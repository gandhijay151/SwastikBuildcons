using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using SwastikBuildcons.Api.Data;
using SwastikBuildcons.Api.Models;
using Xunit;

namespace SwastikBuildcons.Api.Tests;

/// <summary>
/// Integration tests for the publish-toggle endpoint
/// (<c>PATCH /api/admin/industrial-projects/{id}/publish</c>, Req 4.6).
///
/// Verifies:
///  - Toggling publish true/false persists (re-GET reflects the new value).
///  - A newly published project then appears in the public GET /api/projects.
///  - The endpoint requires authentication (401 without credentials).
///  - A missing id yields 404.
/// </summary>
public class AdminProjectsPublishTests : IClassFixture<ProjectsApiFactory>
{
    private const string AdminUser = "admin";
    private const string AdminPassword = "ChangeThisPassword";

    private readonly ProjectsApiFactory _factory;

    public AdminProjectsPublishTests(ProjectsApiFactory factory)
    {
        _factory = factory;
    }

    private int SeedProject(bool isPublished, string name)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        db.IndustrialProjects.RemoveRange(db.IndustrialProjects);
        db.SaveChanges();

        var project = new IndustrialProject
        {
            ProjectName = name,
            ClientName = "Acme Corp",
            Location = "Pune",
            StartDate = new DateTime(2024, 1, 1),
            EstimatedCompletionDate = new DateTime(2024, 12, 1),
            ProjectType = "Factory",
            BudgetAmount = 5_000_000m,
            ActualCostToDate = 2_500_000m,
            Status = "In Progress",
            ProgressPercentage = 50,
            IsPublished = isPublished
        };

        db.IndustrialProjects.Add(project);
        db.SaveChanges();
        return project.Id;
    }

    private HttpClient CreateAuthedClient()
    {
        var client = _factory.CreateClient();
        var token = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{AdminUser}:{AdminPassword}"));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", token);
        return client;
    }

    [Fact]
    public async Task Publish_SetsIsPublishedTrue_AndPersists()
    {
        var id = SeedProject(isPublished: false, "Draft Factory");
        var client = CreateAuthedClient();

        var response = await client.PatchAsJsonAsync(
            $"/api/admin/industrial-projects/{id}/publish",
            new { isPublished = true });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(body);
        Assert.True(doc.RootElement.GetProperty("isPublished").GetBoolean());

        // Re-GET the admin record and confirm the change persisted.
        var reread = await client.GetStringAsync($"/api/admin/industrial-projects/{id}");
        using var rereadDoc = JsonDocument.Parse(reread);
        Assert.True(rereadDoc.RootElement.GetProperty("isPublished").GetBoolean());
    }

    [Fact]
    public async Task Unpublish_SetsIsPublishedFalse_AndPersists()
    {
        var id = SeedProject(isPublished: true, "Live Factory");
        var client = CreateAuthedClient();

        var response = await client.PatchAsJsonAsync(
            $"/api/admin/industrial-projects/{id}/publish",
            new { isPublished = false });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var reread = await client.GetStringAsync($"/api/admin/industrial-projects/{id}");
        using var rereadDoc = JsonDocument.Parse(reread);
        Assert.False(rereadDoc.RootElement.GetProperty("isPublished").GetBoolean());
    }

    [Fact]
    public async Task Publish_MakesProjectVisibleOnPublicEndpoint()
    {
        var id = SeedProject(isPublished: false, "Soon Public Factory");
        var client = CreateAuthedClient();

        // Not published yet: public list must not contain it.
        var before = await client.GetFromJsonAsync<List<JsonElement>>("/api/projects");
        Assert.NotNull(before);
        Assert.DoesNotContain("Soon Public Factory",
            before!.Select(p => p.GetProperty("projectName").GetString()));

        // Publish it.
        var patch = await client.PatchAsJsonAsync(
            $"/api/admin/industrial-projects/{id}/publish",
            new { isPublished = true });
        Assert.Equal(HttpStatusCode.OK, patch.StatusCode);

        // Now it appears publicly.
        var after = await client.GetFromJsonAsync<List<JsonElement>>("/api/projects");
        Assert.NotNull(after);
        Assert.Contains("Soon Public Factory",
            after!.Select(p => p.GetProperty("projectName").GetString()));
    }

    [Fact]
    public async Task Publish_RequiresAuthentication()
    {
        var id = SeedProject(isPublished: false, "Draft Factory");
        var client = _factory.CreateClient();

        var response = await client.PatchAsJsonAsync(
            $"/api/admin/industrial-projects/{id}/publish",
            new { isPublished = true });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Publish_Returns404_ForMissingId()
    {
        SeedProject(isPublished: false, "Draft Factory");
        var client = CreateAuthedClient();

        var response = await client.PatchAsJsonAsync(
            "/api/admin/industrial-projects/999999/publish",
            new { isPublished = true });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
