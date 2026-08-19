using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using System.Threading.RateLimiting;
using SwastikBuildcons.Api.Data;
using SwastikBuildcons.Api.Options;
using SwastikBuildcons.Api.Security;
using SwastikBuildcons.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("LeadSubmissions", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

builder.Services.Configure<AdminAuthOptions>(builder.Configuration.GetSection(AdminAuthOptions.SectionName));
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection(SmtpOptions.SectionName));

if (!builder.Environment.IsDevelopment())
{
    ValidateProductionConfiguration(builder.Configuration);
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ILeadService, LeadService>();
builder.Services.AddScoped<IEmailNotificationService, SmtpEmailNotificationService>();
builder.Services.AddScoped<IIndustrialProjectService, IndustrialProjectService>();

builder.Services
    .AddAuthentication(BasicAuthenticationHandler.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, BasicAuthenticationHandler>(
        BasicAuthenticationHandler.SchemeName,
        options => { });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy
                .SetIsOriginAllowed(_ => true)
                .AllowAnyHeader()
                .AllowAnyMethod();

            return;
        }

        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? [];
        policy
            .WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.EnsureCreated();
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

static void ValidateProductionConfiguration(IConfiguration configuration)
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException("Production connection string is not configured.");
    }
    // Optional: warn if still pointing to local developer database
    if (connectionString.Contains("MSSQLLocalDB", StringComparison.OrdinalIgnoreCase))
    {
        throw new InvalidOperationException("Production connection string should not point to MSSQLLocalDB.");
    }

    var adminPassword = configuration[$"{AdminAuthOptions.SectionName}:Password"];
    if (string.IsNullOrWhiteSpace(adminPassword) ||
        string.Equals(adminPassword, "ChangeThisPassword", StringComparison.Ordinal))
    {
        throw new InvalidOperationException("Production admin password must be configured (change from default).");
    }

    var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
    if (allowedOrigins is null ||
        allowedOrigins.Length == 0 ||
        allowedOrigins.Any(origin => origin.Contains("localhost", StringComparison.OrdinalIgnoreCase)))
    {
        throw new InvalidOperationException("Production CORS origins must be set to your deployed frontend domain (not localhost).");
    }
}
