using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using SwastikBuildcons.Api.Data;
using SwastikBuildcons.Api.Models;
using Xunit;

namespace SwastikBuildcons.Api.Tests;

/// <summary>
/// Integration tests for pagination on <c>GET /api/admin/leads</c> (Req 3.5).
///
/// Verifies:
///  - The endpoint returns a paged envelope (items + total + page + pageSize).
///  - page/pageSize query params slice the result correctly.
///  - Newest-first ordering (by Id descending) — this also guards the SQLite
///    DateTimeOffset ORDER BY translation gotcha (would 500 otherwise).
///  - pageSize is clamped to a sane range and out-of-range page is clamped to 1.
///  - The endpoint still requires authentication.
/// </summary>
public class AdminLeadsPaginationTests : IClassFixture<ProjectsApiFactory>
{
    private const string AdminUser = "admin";
    private const string AdminPassword = "ChangeThisPassword";

    private readonly ProjectsApiFactory _factory;

    public AdminLeadsPaginationTests(ProjectsApiFactory factory)
    {
        _factory = factory;
        SeedLeads(25);
    }

    private void SeedLeads(int count)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        db.Leads.RemoveRange(db.Leads);
        db.SaveChanges();

        for (var i = 1; i <= count; i++)
        {
            db.Leads.Add(new Lead
            {
                Name = $"Lead {i:D2}",
                Phone = "9999999999",
                ProjectType = "Factory",
                Budget = "10L",
                Timeline = "3 months",
                CreatedAtUtc = DateTimeOffset.UtcNow.AddMinutes(-i)
            });
        }

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
    public async Task GetAll_ReturnsPagedEnvelope_WithTotalAndItems()
    {
        var client = CreateAuthedClient();

        var raw = await client.GetStringAsync("/api/admin/leads?page=1&pageSize=10");

        using var doc = JsonDocument.Parse(raw);
        var root = doc.RootElement;

        Assert.Equal(25, root.GetProperty("total").GetInt32());
        Assert.Equal(1, root.GetProperty("page").GetInt32());
        Assert.Equal(10, root.GetProperty("pageSize").GetInt32());
        Assert.Equal(10, root.GetProperty("items").GetArrayLength());
    }

    [Fact]
    public async Task GetAll_SecondPage_ReturnsNextSlice()
    {
        var client = CreateAuthedClient();

        var page1 = await client.GetStringAsync("/api/admin/leads?page=1&pageSize=10");
        var page3 = await client.GetStringAsync("/api/admin/leads?page=3&pageSize=10");

        using var doc1 = JsonDocument.Parse(page1);
        using var doc3 = JsonDocument.Parse(page3);

        // Page 3 with pageSize 10 over 25 records => 5 remaining items.
        Assert.Equal(5, doc3.RootElement.GetProperty("items").GetArrayLength());

        // Pages must not overlap.
        var ids1 = doc1.RootElement.GetProperty("items").EnumerateArray()
            .Select(e => e.GetProperty("id").GetInt32()).ToHashSet();
        var ids3 = doc3.RootElement.GetProperty("items").EnumerateArray()
            .Select(e => e.GetProperty("id").GetInt32()).ToList();

        Assert.All(ids3, id => Assert.DoesNotContain(id, ids1));
    }

    [Fact]
    public async Task GetAll_OrdersByNewestFirst()
    {
        var client = CreateAuthedClient();

        var raw = await client.GetStringAsync("/api/admin/leads?page=1&pageSize=25");

        using var doc = JsonDocument.Parse(raw);
        var ids = doc.RootElement.GetProperty("items").EnumerateArray()
            .Select(e => e.GetProperty("id").GetInt32()).ToList();

        // Id descending (newest first) — also proves the SQLite ORDER BY translates.
        var sortedDesc = ids.OrderByDescending(id => id).ToList();
        Assert.Equal(sortedDesc, ids);
    }

    [Fact]
    public async Task GetAll_ClampsPageSizeToMax()
    {
        var client = CreateAuthedClient();

        var raw = await client.GetStringAsync("/api/admin/leads?page=1&pageSize=5000");

        using var doc = JsonDocument.Parse(raw);
        // pageSize clamped to 100; only 25 records exist so all are returned.
        Assert.Equal(100, doc.RootElement.GetProperty("pageSize").GetInt32());
        Assert.Equal(25, doc.RootElement.GetProperty("items").GetArrayLength());
    }

    [Fact]
    public async Task GetAll_ClampsNonPositivePageToOne()
    {
        var client = CreateAuthedClient();

        var raw = await client.GetStringAsync("/api/admin/leads?page=0&pageSize=10");

        using var doc = JsonDocument.Parse(raw);
        Assert.Equal(1, doc.RootElement.GetProperty("page").GetInt32());
        Assert.Equal(10, doc.RootElement.GetProperty("items").GetArrayLength());
    }

    [Fact]
    public async Task GetAll_RequiresAuthentication()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/admin/leads");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
