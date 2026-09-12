using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
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
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<AiOptions>(builder.Configuration.GetSection(AiOptions.SectionName));
builder.Services.Configure<TurnstileOptions>(builder.Configuration.GetSection(TurnstileOptions.SectionName));
builder.Services.AddHttpClient();

if (!builder.Environment.IsDevelopment())
{
    ValidateProductionConfiguration(builder.Configuration);
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' (PostgreSQL) is not configured.")));

builder.Services.AddScoped<ILeadService, LeadService>();
builder.Services.AddScoped<IEmailNotificationService, SmtpEmailNotificationService>();
builder.Services.AddScoped<IAiLeadAnalysisService, GeminiLeadAnalysisService>();
builder.Services.AddScoped<ITurnstileVerifier, TurnstileVerifier>();
builder.Services.AddScoped<IIndustrialProjectService, IndustrialProjectService>();
builder.Services.AddScoped<ITestimonialService, TestimonialService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Resolve JWT settings, with a development-only fallback signing key so the app
// runs locally without extra config. Production requires a real key (validated
// in ValidateProductionConfiguration below).
var jwtSection = builder.Configuration.GetSection(JwtOptions.SectionName);
var jwtSigningKey = jwtSection["SigningKey"];
if (string.IsNullOrWhiteSpace(jwtSigningKey))
{
    jwtSigningKey = "dev-only-insecure-signing-key-change-me-please-32b";
}
var jwtIssuer = jwtSection["Issuer"] ?? "SwastikBuildcons";
var jwtAudience = jwtSection["Audience"] ?? "SwastikBuildconsAdmin";

// Ensure the token issuer (AuthService, via IOptions<JwtOptions>) uses the exact
// same resolved key/issuer/audience as the bearer validation below. Without this,
// the dev fallback key would only apply to validation, and issued tokens would be
// signed with an empty key (throwing IDX10703) or fail validation.
builder.Services.PostConfigure<JwtOptions>(options =>
{
    options.SigningKey = jwtSigningKey;
    options.Issuer = jwtIssuer;
    options.Audience = jwtAudience;
});

builder.Services
    .AddAuthentication(BasicAuthenticationHandler.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, BasicAuthenticationHandler>(
        BasicAuthenticationHandler.SchemeName,
        options => { })
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey))
        };
    });

// Accept either Basic or JWT bearer during the transition (design: both coexist).
builder.Services.AddAuthorization(options =>
{
    var multiScheme = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder(
            BasicAuthenticationHandler.SchemeName,
            JwtBearerDefaults.AuthenticationScheme)
        .RequireAuthenticatedUser()
        .Build();

    // Make the combined scheme the default so [Authorize] challenges both.
    options.DefaultPolicy = multiScheme;
    options.FallbackPolicy = null;
});

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
}

// Apply EF Core migrations on startup so the PostgreSQL schema is always current.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Security headers. This is a JSON API, so a full CSP isn't needed; these cover
// MIME-sniffing, clickjacking, and referrer leakage. HSTS only in production
// (it requires HTTPS and shouldn't be sent over plain-HTTP dev).
app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["Referrer-Policy"] = "no-referrer";
    if (!app.Environment.IsDevelopment())
    {
        headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
    }
    await next();
});

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

    var jwtKey = configuration[$"{JwtOptions.SectionName}:SigningKey"];
    if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
    {
        throw new InvalidOperationException("Production JWT signing key must be configured with at least 32 characters.");
    }
}

/// <summary>
/// Exposes the implicit top-level <c>Program</c> class so integration tests can
/// reference it via <c>WebApplicationFactory&lt;Program&gt;</c>.
/// </summary>
public partial class Program { }




