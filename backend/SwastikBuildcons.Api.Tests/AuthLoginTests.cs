using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using SwastikBuildcons.Api.Data;
using Xunit;

namespace SwastikBuildcons.Api.Tests;

/// <summary>
/// Integration tests for the JWT login flow
/// (<c>POST /api/auth/login</c>, Req 2.2 &amp; 9.1).
///
/// Verifies:
///  - Valid admin credentials return 200 with a non-empty token and a future expiry.
///  - Invalid credentials return 401 and no token.
///  - The issued JWT works as a bearer token against an admin endpoint, proving
///    JWT bearer auth coexists with the transitional Basic scheme.
/// </summary>
public class AuthLoginTests : IClassFixture<ProjectsApiFactory>
{
    private const string AdminUser = "admin";
    private const string AdminPassword = "ChangeThisPassword";

    private readonly ProjectsApiFactory _factory;

    public AuthLoginTests(ProjectsApiFactory factory)
    {
        _factory = factory;
    }

    private void ClearProjects()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.IndustrialProjects.RemoveRange(db.IndustrialProjects);
        db.SaveChanges();
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsTokenAndFutureExpiry()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new { username = AdminUser, password = AdminPassword });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var raw = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(raw);

        var token = doc.RootElement.GetProperty("token").GetString();
        Assert.False(string.IsNullOrWhiteSpace(token));

        var expiresAt = doc.RootElement.GetProperty("expiresAtUtc").GetDateTimeOffset();
        Assert.True(expiresAt > DateTimeOffset.UtcNow);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new { username = AdminUser, password = "wrong-password" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task IssuedJwt_AuthorizesAdminEndpoint()
    {
        ClearProjects();
        var client = _factory.CreateClient();

        // Obtain a JWT via the login endpoint.
        var loginResponse = await client.PostAsJsonAsync(
            "/api/auth/login",
            new { username = AdminUser, password = AdminPassword });
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginRaw = await loginResponse.Content.ReadAsStringAsync();
        using var loginDoc = JsonDocument.Parse(loginRaw);
        var token = loginDoc.RootElement.GetProperty("token").GetString();

        // Use the JWT as a bearer token against an admin endpoint.
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var adminResponse = await client.GetAsync("/api/admin/industrial-projects");

        Assert.Equal(HttpStatusCode.OK, adminResponse.StatusCode);
    }

    [Fact]
    public async Task AdminEndpoint_WithoutToken_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/admin/industrial-projects");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
