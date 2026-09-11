namespace SwastikBuildcons.Api.Options;

/// <summary>
/// JWT bearer configuration (Req 9.1). The signing key must be supplied via
/// environment/secret configuration in production and be long enough for HS256.
/// </summary>
public class JwtOptions
{
    public const string SectionName = "Jwt";

    /// <summary>HS256 signing key. Provide via secret config in production.</summary>
    public string SigningKey { get; set; } = string.Empty;

    public string Issuer { get; set; } = "SwastikBuildcons";

    public string Audience { get; set; } = "SwastikBuildconsAdmin";

    /// <summary>Token lifetime in minutes.</summary>
    public int ExpiryMinutes { get; set; } = 480;
}
