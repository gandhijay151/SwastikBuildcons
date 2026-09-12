namespace SwastikBuildcons.Api.Services;

public interface ITurnstileVerifier
{
    /// <summary>
    /// Verifies a Cloudflare Turnstile token. Returns true when verification
    /// passes, OR when Turnstile is not configured (no-op, so the check is
    /// opt-in via config). Returns false only when configured AND the token is
    /// missing/invalid.
    /// </summary>
    Task<bool> VerifyAsync(string? token, string? remoteIp, CancellationToken cancellationToken);
}
