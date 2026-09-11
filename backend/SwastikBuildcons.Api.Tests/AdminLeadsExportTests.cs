using System.Net;
using System.Net.Http.Headers;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using SwastikBuildcons.Api.Data;
using SwastikBuildcons.Api.Models;
using Xunit;

namespace SwastikBuildcons.Api.Tests;

/// <summary>
/// Integration tests for <c>GET /api/admin/leads/export</c> (Req 3.6).
///
/// Verifies:
///  - 200 with content-type text/csv and an attachment Content-Disposition.
///  - The CSV header row is present.
///  - A seeded lead's data appears in the output.
///  - A field containing a comma is wrapped in double quotes (RFC 4180).
///  - The endpoint requires authentication (401 without credentials).
/// </summary>
public class AdminLeadsExportTests : IClassFixture<ProjectsApiFactory>
{
    private const string AdminUser = "admin";
    private const string AdminPassword = "ChangeThisPassword";

    private readonly ProjectsApiFactory _factory;

    public AdminLeadsExportTests(ProjectsApiFactory factory)
    {
        _factory = factory;
    }

    private void SeedLeads()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        db.Leads.RemoveRange(db.Leads);
        db.SaveChanges();

        db.Leads.Add(new Lead
        {
            Name = "Alice Sharma",
            Phone = "9876543210",
            Email = "alice@example.com",
            ProjectType = "Warehouse",
            Budget = "50L",
            Timeline = "6 months",
            Status = "New",
            // Message contains a comma → must be quoted in the CSV.
            Message = "Need a large facility, urgently",
            CreatedAtUtc = DateTimeOffset.UtcNow
        });

        db.SaveChanges();
    }

    private HttpClient CreateAuthedClient()
    {
        var client = _factory.CreateClient();
        var token = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{AdminUser}:{AdminPassword}"));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", token);
        return client;
    }

    [Fact]
    public async Task Export_ReturnsCsvFileDownload_WithSeededData()
    {
        SeedLeads();
        var client = CreateAuthedClient();

        var response = await client.GetAsync("/api/admin/leads/export");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/csv", response.Content.Headers.ContentType?.MediaType);

        var disposition = response.Content.Headers.ContentDisposition;
        Assert.NotNull(disposition);
        Assert.Equal("attachment", disposition!.DispositionType);
        Assert.StartsWith("leads-export-", disposition.FileName?.Trim('"') ?? string.Empty);

        var body = await response.Content.ReadAsStringAsync();

        // Header row present.
        Assert.Contains("Id,Name,Phone,Email,ProjectType,Budget,Timeline,Status,Message,CreatedAtUtc", body);

        // Seeded lead data appears.
        Assert.Contains("Alice Sharma", body);
        Assert.Contains("alice@example.com", body);

        // A value containing a comma is quoted.
        Assert.Contains("\"Need a large facility, urgently\"", body);
    }

    [Fact]
    public async Task Export_RequiresAuthentication()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/admin/leads/export");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
