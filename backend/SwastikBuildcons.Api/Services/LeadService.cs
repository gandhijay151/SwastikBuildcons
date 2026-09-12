using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using SwastikBuildcons.Api.Contracts;
using SwastikBuildcons.Api.Data;
using SwastikBuildcons.Api.Models;

namespace SwastikBuildcons.Api.Services;

public class LeadService(
    AppDbContext dbContext,
    IEmailNotificationService emailNotificationService,
    IAiLeadAnalysisService aiLeadAnalysisService,
    ILogger<LeadService> logger) : ILeadService
{
    // Default paging bounds for GetPagedAsync.
    private const int DefaultPageSize = 20;
    private const int MaxPageSize = 100;

    public async Task<LeadResponse> CreateAsync(CreateLeadRequest request, CancellationToken cancellationToken)
    {
        var lead = new Lead
        {
            Name = request.Name.Trim(),
            Phone = request.Phone.Trim(),
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim(),
            ProjectType = request.ProjectType.Trim(),
            Budget = request.Budget.Trim(),
            Message = string.IsNullOrWhiteSpace(request.Message) ? null : request.Message.Trim(),
            Timeline = request.Timeline.Trim(),
            CreatedAtUtc = DateTimeOffset.UtcNow
        };

        dbContext.Leads.Add(lead);
        await dbContext.SaveChangesAsync(cancellationToken);

        try
        {
            await emailNotificationService.SendLeadNotificationAsync(lead, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email notification for lead {LeadId}.", lead.Id);
        }

        // Customer auto-reply (Req 8.5). Failures here must not fail lead creation,
        // mirroring the company-notification behavior above.
        try
        {
            await emailNotificationService.SendLeadConfirmationAsync(lead, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send customer confirmation for lead {LeadId}.", lead.Id);
        }

        // AI triage (summary + priority). Same no-op-on-failure contract: never
        // let AI break lead creation. Persist the result when we get one.
        try
        {
            var analysis = await aiLeadAnalysisService.AnalyzeAsync(lead, cancellationToken);
            if (analysis is not null)
            {
                lead.AiSummary = analysis.Summary;
                lead.AiPriority = analysis.Priority;
                await dbContext.SaveChangesAsync(cancellationToken);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "AI analysis failed for lead {LeadId}.", lead.Id);
        }

        return ToResponse(lead);
    }

    public async Task<IReadOnlyList<LeadResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        // Newest first — Id is a monotonically increasing autoincrement. Ordering by Id
        // rather than CreatedAtUtc avoids SQLite's inability to translate ORDER BY on a
        // DateTimeOffset column.
        var leads = await dbContext.Leads
            .AsNoTracking()
            .OrderByDescending(lead => lead.Id)
            .ToListAsync(cancellationToken);

        return leads.Select(ToResponse).ToList();
    }

    public async Task<PagedResult<LeadResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);

        var total = await dbContext.Leads.CountAsync(cancellationToken);

        var leads = await dbContext.Leads
            .AsNoTracking()
            .OrderByDescending(lead => lead.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = leads.Select(ToResponse).ToList();
        return new PagedResult<LeadResponse>(items, total, page, pageSize);
    }

    public async Task<LeadResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var lead = await dbContext.Leads
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        return lead is null ? null : ToResponse(lead);
    }

    public async Task<LeadResponse?> UpdateStatusAsync(
        int id,
        UpdateLeadStatusRequest request,
        CancellationToken cancellationToken)
    {
        var lead = await dbContext.Leads
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (lead is null)
        {
            return null;
        }

        lead.Status = request.Status.Trim();
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(lead);
    }

    public async Task<byte[]> ExportCsvAsync(CancellationToken cancellationToken)
    {
        var leads = await dbContext.Leads
            .AsNoTracking()
            .OrderBy(lead => lead.Id)
            .ToListAsync(cancellationToken);

        var builder = new StringBuilder();
        builder.AppendLine("Id,Name,Phone,Email,ProjectType,Budget,Timeline,Status,Message,CreatedAtUtc");

        foreach (var lead in leads)
        {
            builder.AppendLine(string.Join(',',
                CsvEscape(lead.Id.ToString(CultureInfo.InvariantCulture)),
                CsvEscape(lead.Name),
                CsvEscape(lead.Phone),
                CsvEscape(lead.Email),
                CsvEscape(lead.ProjectType),
                CsvEscape(lead.Budget),
                CsvEscape(lead.Timeline),
                CsvEscape(lead.Status),
                CsvEscape(lead.Message),
                CsvEscape(lead.CreatedAtUtc.ToString("o", CultureInfo.InvariantCulture))));
        }

        // UTF-8 without BOM.
        return new UTF8Encoding(false).GetBytes(builder.ToString());
    }

    // Quote a CSV field when it contains a comma, double-quote, CR or LF, and
    // escape embedded double-quotes by doubling them (RFC 4180). Null → empty.
    private static string CsvEscape(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        if (value.IndexOfAny(['"', ',', '\r', '\n']) >= 0)
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }

        return value;
    }

    private static LeadResponse ToResponse(Lead lead)
    {
        return new LeadResponse(
            lead.Id,
            lead.Name,
            lead.Phone,
            lead.Email,
            lead.ProjectType,
            lead.Budget,
            lead.Message,
            lead.Timeline,
            lead.Status,
            lead.CreatedAtUtc,
            lead.AiSummary,
            lead.AiPriority);
    }
}

