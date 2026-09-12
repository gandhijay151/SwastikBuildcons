namespace SwastikBuildcons.Api.Options;

public class TurnstileOptions
{
    public const string SectionName = "Turnstile";

    /// <summary>
    /// Cloudflare Turnstile secret key. When empty, verification is disabled and
    /// lead submissions are accepted without a CAPTCHA check (no-op, so local dev
    /// and pre-launch keep working). Set this in production to enforce the check.
    /// </summary>
    public string SecretKey { get; set; } = string.Empty;
}
