using System.Text.Json;
using Microsoft.Extensions.Options;
using SwastikBuildcons.Api.Options;

namespace SwastikBuildcons.Api.Services;

/// <summary>
/// Verifies Cloudflare Turnstile tokens against the siteverify endpoint. When no
/// secret key is configured the verifier is a no-op that returns true, so the
/// CAPTCHA is strictly opt-in and never blocks dev / pre-launch traffic.
/// </summary>
public class TurnstileVerifier(
    IHttpClientFactory httpClientFactory,
    IOptions<TurnstileOptions> options,
    ILogger<TurnstileVerifier> logger) : ITurnstileVerifier
{
    private const string VerifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    public async Task<bool> VerifyAsync(string? token, string? remoteIp, CancellationToken cancellationToken)
    {
        var secret = options.Value.SecretKey;
        if (string.IsNullOrWhiteSpace(secret))
        {
            // Not configured → verification disabled (accept).
            return true;
        }

        if (string.IsNullOrWhiteSpace(token))
        {
            // Configured but no token supplied → reject.
            return false;
        }

        try
        {
            var form = new List<KeyValuePair<string, string>>
            {
                new("secret", secret),
                new("response", token)
            };
            if (!string.IsNullOrWhiteSpace(remoteIp))
            {
                form.Add(new("remoteip", remoteIp));
            }

            var client = httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(10);
            using var response = await client.PostAsync(
                VerifyUrl, new FormUrlEncodedContent(form), cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Turnstile siteverify returned {Status}.", response.StatusCode);
                return false;
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.TryGetProperty("success", out var success) && success.GetBoolean();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Turnstile verification failed.");
            // Fail closed: if we can't verify while it's configured, reject.
            return false;
        }
    }
}
