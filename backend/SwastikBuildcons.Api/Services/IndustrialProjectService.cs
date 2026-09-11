using Microsoft.EntityFrameworkCore;
using SwastikBuildcons.Api.Contracts;
using SwastikBuildcons.Api.Data;
using SwastikBuildcons.Api.Models;

namespace SwastikBuildcons.Api.Services;

public class IndustrialProjectService : IIndustrialProjectService
{
    private readonly AppDbContext _context;

    public IndustrialProjectService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IndustrialProjectResponse> CreateAsync(CreateIndustrialProjectRequest request, CancellationToken cancellationToken, string? createdBy = null)
    {
        var now = DateTimeOffset.UtcNow;
        var project = new IndustrialProject
        {
            ProjectName = request.ProjectName,
            ClientName = request.ClientName,
            Location = request.Location,
            StartDate = request.StartDate,
            EstimatedCompletionDate = request.EstimatedCompletionDate,
            ProjectType = request.ProjectType,
            BudgetAmount = request.BudgetAmount,
            ActualCostToDate = request.ActualCostToDate,
            Status = request.Status,
            ProgressPercentage = request.ProgressPercentage,
            Description = request.Description,
            ScopeOfWork = request.ScopeOfWork,
            ProjectManager = request.ProjectManager,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
            UpdatedBy = string.IsNullOrWhiteSpace(createdBy) ? null : createdBy
        };

        _context.IndustrialProjects.Add(project);
        await _context.SaveChangesAsync(cancellationToken);

        return ToAdminResponse(project);
    }

    public async Task<IReadOnlyList<IndustrialProjectResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        // Order by Id (autoincrement) — SQLite cannot translate ORDER BY on a DateTimeOffset.
        var projects = await _context.IndustrialProjects
            .OrderByDescending(p => p.Id)
            .ToListAsync(cancellationToken);

        return projects.Select(ToAdminResponse).ToList();
    }

    public async Task<IndustrialProjectResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var project = await _context.IndustrialProjects
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        return project == null ? null : ToAdminResponse(project);
    }

    public async Task<IReadOnlyList<PublicProjectResponse>> GetPublishedAsync(string? type, string? status, CancellationToken cancellationToken)
    {
        var query = _context.IndustrialProjects.Where(p => p.IsPublished);

        if (!string.IsNullOrWhiteSpace(type))
        {
            var trimmedType = type.Trim();
            query = query.Where(p => p.ProjectType == trimmedType);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            var trimmedStatus = status.Trim();
            query = query.Where(p => p.Status == trimmedStatus);
        }

        // Materialize first — SQLite cannot ORDER BY a DateTimeOffset in SQL, so sort in memory.
        var projects = await query.ToListAsync(cancellationToken);

        return projects
            .OrderByDescending(p => p.CreatedAtUtc)
            .Select(ToPublicResponse)
            .ToList();
    }

    public async Task<PublicProjectResponse?> GetPublishedByIdAsync(int id, CancellationToken cancellationToken)
    {
        var project = await _context.IndustrialProjects
            .FirstOrDefaultAsync(p => p.Id == id && p.IsPublished, cancellationToken);

        return project == null ? null : ToPublicResponse(project);
    }

    public async Task<IndustrialProjectResponse?> UpdateAsync(int id, CreateIndustrialProjectRequest request, CancellationToken cancellationToken, string? updatedBy = null)
    {
        var project = await _context.IndustrialProjects
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (project == null)
        {
            return null;
        }

        project.ProjectName = request.ProjectName;
        project.ClientName = request.ClientName;
        project.Location = request.Location;
        project.StartDate = request.StartDate;
        project.EstimatedCompletionDate = request.EstimatedCompletionDate;
        project.ProjectType = request.ProjectType;
        project.BudgetAmount = request.BudgetAmount;
        project.ActualCostToDate = request.ActualCostToDate;
        project.Status = request.Status;
        project.ProgressPercentage = request.ProgressPercentage;
        project.Description = request.Description;
        project.ScopeOfWork = request.ScopeOfWork;
        project.ProjectManager = request.ProjectManager;
        project.UpdatedAtUtc = DateTimeOffset.UtcNow;
        if (!string.IsNullOrWhiteSpace(updatedBy))
        {
            project.UpdatedBy = updatedBy;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return ToAdminResponse(project);
    }

    public async Task<IndustrialProjectResponse?> SetPublishedAsync(int id, bool isPublished, CancellationToken cancellationToken, string? updatedBy = null)
    {
        var project = await _context.IndustrialProjects
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (project == null)
        {
            return null;
        }

        project.IsPublished = isPublished;
        project.UpdatedAtUtc = DateTimeOffset.UtcNow;
        if (!string.IsNullOrWhiteSpace(updatedBy))
        {
            project.UpdatedBy = updatedBy;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return ToAdminResponse(project);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var project = await _context.IndustrialProjects
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (project == null)
        {
            return false;
        }

        _context.IndustrialProjects.Remove(project);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static IndustrialProjectResponse ToAdminResponse(IndustrialProject project) =>
        new IndustrialProjectResponse(
            project.Id,
            project.ProjectName,
            project.ClientName,
            project.Location,
            project.StartDate,
            project.EstimatedCompletionDate,
            project.ActualCompletionDate,
            project.ProjectType,
            project.BudgetAmount,
            project.ActualCostToDate,
            project.Status,
            project.ProgressPercentage,
            project.Description,
            project.ScopeOfWork,
            project.ProjectManager,
            project.IsPublished,
            project.CreatedAtUtc,
            project.UpdatedAtUtc);

    private static PublicProjectResponse ToPublicResponse(IndustrialProject project) =>
        new PublicProjectResponse(
            project.Id,
            project.ProjectName,
            project.ClientName,
            project.Location,
            project.ProjectType,
            project.Status,
            project.ProgressPercentage,
            project.Description,
            project.ScopeOfWork,
            project.StartDate,
            project.EstimatedCompletionDate,
            project.ActualCompletionDate);
}
