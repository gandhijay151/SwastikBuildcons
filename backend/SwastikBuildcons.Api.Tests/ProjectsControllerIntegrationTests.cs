using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using SwastikBuildcons.Api.Data;
using SwastikBuildcons.Api.Models;
using Xunit;

namespace SwastikBuildcons.Api.Tests;

/// <summary>
/// Integration tests for the public <c>ProjectsController</c> (<c>/api/projects</c>).
///
/// Verifies:
///  - Only published projects are returned (Req 1.2).
///  - Financial fields (budget, actual cost) are never present in the JSON (Req 1.7).
///  - Unpublished / nonexistent projects yield 404 on the detail endpoint.
///  - Type and status query filters work.
/// </summary>
public class ProjectsControllerIntegrationTests : IClassFixture<ProjectsApiFactory>
{
    private readonly ProjectsApiFactory _factory;

    public ProjectsControllerIntegrationTests(ProjectsApiFactory factory)
    {
        _factory = factory;
        SeedDatabase();
    }

    private void SeedDatabase()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Reset to a known state so tests are independent of ordering / prior runs.
        db.IndustrialProjects.RemoveRange(db.IndustrialProjects);
        db.SaveChanges();

        db.IndustrialProjects.AddRange(
            new IndustrialProject
            {
                ProjectName = "Published Factory",
                ClientName = "Acme Corp",
                Location = "Pune",
                StartDate = new DateTime(2024, 1, 1),
                EstimatedCompletionDate = new DateTime(2024, 12, 1),
                ProjectType = "Factory",
                BudgetAmount = 5_000_000m,
                ActualCostToDate = 2_500_000m,
                Status = "In Progress",
                ProgressPercentage = 50,
                Description = "A factory build.",
                ScopeOfWork = "Civil + structural.",
                IsPublished = true
            },
            new IndustrialProject
            {
                ProjectName = "Published Warehouse",
                ClientName = "Beta Ltd",
                Location = "Mumbai",
                StartDate = new DateTime(2023, 6, 1),
                EstimatedCompletionDate = new DateTime(2024, 6, 1),
                ActualCompletionDate = new DateTime(2024, 5, 20),
                ProjectType = "Warehouse",
                BudgetAmount = 3_000_000m,
                ActualCostToDate = 3_100_000m,
                Status = "Completed",
                ProgressPercentage = 100,
                IsPublished = true
            },
            new IndustrialProject
            {
                ProjectName = "Draft Plant",
                ClientName = "Gamma Inc",
                Location = "Nashik",
                StartDate = new DateTime(2024, 3, 1),
                EstimatedCompletionDate = new DateTime(2025, 3, 1),
                ProjectType = "Industrial Plant",
                BudgetAmount = 8_000_000m,
                ActualCostToDate = 1_000_000m,
                Status = "Planning",
                ProgressPercentage = 5,
                IsPublished = false
            });

        db.SaveChanges();
    }

    private int GetProjectId(string projectName)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return db.IndustrialProjects.Single(p => p.ProjectName == projectName).Id;
    }

    [Fact]
    public async Task GetPublished_ReturnsOnlyPublishedProjects()
    {
        var client = _factory.CreateClient();

        var projects = await client.GetFromJsonAsync<List<JsonElement>>("/api/projects");

        Assert.NotNull(projects);
        var names = projects!.Select(p => p.GetProperty("projectName").GetString()).ToList();

        Assert.Contains("Published Factory", names);
        Assert.Contains("Published Warehouse", names);
        Assert.DoesNotContain("Draft Plant", names);
        Assert.Equal(2, projects!.Count);
    }

    [Fact]
    public async Task GetPublished_ResponseOmitsFinancialFields()
    {
        var client = _factory.CreateClient();

        // Inspect the raw JSON so we detect leaks regardless of DTO shape / casing.
        var raw = await client.GetStringAsync("/api/projects");

        Assert.DoesNotContain("budget", raw, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("actualCost", raw, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("ActualCostToDate", raw, StringComparison.OrdinalIgnoreCase);

        // And per-element: confirm the financial properties simply do not exist.
        using var doc = JsonDocument.Parse(raw);
        foreach (var element in doc.RootElement.EnumerateArray())
        {
            Assert.False(element.TryGetProperty("budgetAmount", out _));
            Assert.False(element.TryGetProperty("actualCostToDate", out _));
        }
    }

    [Fact]
    public async Task GetPublishedById_ReturnsProject_ForPublished()
    {
        var client = _factory.CreateClient();
        var publishedId = GetProjectId("Published Factory");

        var response = await client.GetAsync($"/api/projects/{publishedId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var raw = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("budget", raw, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("actualCost", raw, StringComparison.OrdinalIgnoreCase);

        using var doc = JsonDocument.Parse(raw);
        Assert.Equal("Published Factory", doc.RootElement.GetProperty("projectName").GetString());
        Assert.False(doc.RootElement.TryGetProperty("budgetAmount", out _));
        Assert.False(doc.RootElement.TryGetProperty("actualCostToDate", out _));
    }

    [Fact]
    public async Task GetPublishedById_Returns404_ForUnpublishedProject()
    {
        var client = _factory.CreateClient();
        var unpublishedId = GetProjectId("Draft Plant");

        var response = await client.GetAsync($"/api/projects/{unpublishedId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetPublishedById_Returns404_ForNonexistentProject()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/projects/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetPublished_FiltersByType()
    {
        var client = _factory.CreateClient();

        var projects = await client.GetFromJsonAsync<List<JsonElement>>("/api/projects?type=Warehouse");

        Assert.NotNull(projects);
        Assert.Single(projects!);
        Assert.Equal("Published Warehouse", projects![0].GetProperty("projectName").GetString());
    }

    [Fact]
    public async Task GetPublished_FiltersByStatus()
    {
        var client = _factory.CreateClient();

        var projects = await client.GetFromJsonAsync<List<JsonElement>>("/api/projects?status=Completed");

        Assert.NotNull(projects);
        Assert.Single(projects!);
        Assert.Equal("Published Warehouse", projects![0].GetProperty("projectName").GetString());
    }

    [Fact]
    public async Task GetPublished_FilterExcludesUnpublished_EvenWhenTypeMatches()
    {
        var client = _factory.CreateClient();

        // "Industrial Plant" exists only as the unpublished Draft Plant.
        var projects = await client.GetFromJsonAsync<List<JsonElement>>("/api/projects?type=Industrial Plant");

        Assert.NotNull(projects);
        Assert.Empty(projects!);
    }
}
