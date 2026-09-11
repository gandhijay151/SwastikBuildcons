using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using SwastikBuildcons.Api.Data;

namespace SwastikBuildcons.Api.Tests;

/// <summary>
/// Boots the real API in-memory for integration testing against a real
/// PostgreSQL database (the project targets Npgsql/Neon).
///
/// To keep tests isolated and avoid touching production tables, each factory
/// instance runs inside its own throwaway PostgreSQL schema
/// (<c>test_&lt;guid&gt;</c>). The schema is created up front, the app's EF Core
/// migrations are applied into it (via the connection's <c>Search Path</c>), and
/// the schema is dropped on dispose.
///
/// The database connection string is read from the <c>TEST_DATABASE_URL</c>
/// environment variable so the secret is never committed. Tests that need a DB
/// are skipped-by-failure with a clear message when it is not set.
/// </summary>
public class ProjectsApiFactory : WebApplicationFactory<Program>
{
    private readonly string _schema = "test_" + Guid.NewGuid().ToString("N");
    private readonly string? _baseConnectionString =
        Environment.GetEnvironmentVariable("TEST_DATABASE_URL");

    private string SchemaConnectionString
    {
        get
        {
            // Use Neon's DIRECT (unpooled) endpoint for tests: the pooled
            // "-pooler" endpoint (PgBouncer) both rejects a search_path startup
            // option and does not preserve a session-level SET search_path across
            // pooled connections. On a direct connection, the session-level
            // SearchPath is stable, so every command in the request hits the
            // throwaway schema.
            var csb = new NpgsqlConnectionStringBuilder(_baseConnectionString)
            {
                SearchPath = _schema,
                Pooling = false,
            };
            csb.Host = csb.Host?.Replace("-pooler", string.Empty);
            return csb.ConnectionString;
        }
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        if (string.IsNullOrWhiteSpace(_baseConnectionString))
        {
            throw new InvalidOperationException(
                "TEST_DATABASE_URL is not set. Integration tests require a PostgreSQL connection string.");
        }

        builder.UseEnvironment("Development");

        // Create the isolated schema before the host applies migrations on startup.
        CreateSchema();

        builder.ConfigureServices(services =>
        {
            // Remove the app's DbContext registration and re-add one scoped to the
            // throwaway schema.
            var descriptors = services
                .Where(d =>
                    d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                    d.ServiceType == typeof(AppDbContext) ||
                    (d.ServiceType.IsGenericType &&
                     d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>)))
                .ToList();

            foreach (var descriptor in descriptors)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<AppDbContext>(options => options.UseNpgsql(SchemaConnectionString));
        });
    }

    private string DirectConnectionString
    {
        get
        {
            var csb = new NpgsqlConnectionStringBuilder(_baseConnectionString);
            csb.Host = csb.Host?.Replace("-pooler", string.Empty);
            return csb.ConnectionString;
        }
    }

    private void CreateSchema()
    {
        using var connection = new NpgsqlConnection(DirectConnectionString);
        connection.Open();
        using var command = connection.CreateCommand();
        command.CommandText = $"CREATE SCHEMA IF NOT EXISTS \"{_schema}\";";
        command.ExecuteNonQuery();
    }

    private void DropSchema()
    {
        if (string.IsNullOrWhiteSpace(_baseConnectionString)) return;
        try
        {
            using var connection = new NpgsqlConnection(DirectConnectionString);
            connection.Open();
            using var command = connection.CreateCommand();
            command.CommandText = $"DROP SCHEMA IF EXISTS \"{_schema}\" CASCADE;";
            command.ExecuteNonQuery();
        }
        catch
        {
            // Best-effort cleanup; ignore failures on teardown.
        }
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            DropSchema();
        }
        base.Dispose(disposing);
    }
}
