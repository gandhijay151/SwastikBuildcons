using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using SwastikBuildcons.Api.Models;
using SwastikBuildcons.Api.Options;

namespace SwastikBuildcons.Api.Services;

/// <summary>
/// Lead analysis via Google Gemini's REST API. One call per lead. Returns null
/// (no-op) when no API key is configured or the call fails, so lead creation is
/// never blocked or broken by AI.
/// </summary>
public class GeminiLeadAnalysisService(
    IHttpClientFactory httpClientFactory,
    IOptions<AiOptions> options,
    ILogger<GeminiLeadAnalysisService> logger) : IAiLeadAnalysisService
{
    private static readonly string[] ValidPriorities = ["Hot", "Warm", "Cold"];

    public async Task<LeadAnalysis?> AnalyzeAsync(Lead lead, CancellationToken cancellationToken)
    {
        var ai = options.Value;
        if (string.IsNullOrWhiteSpace(ai.ApiKey))
        {
            logger.LogInformation("AI is not configured. Skipping analysis for lead {LeadId}.", lead.Id);
            return null;
        }

        var prompt =
            "You triage construction/interior-design sales leads. Given the lead below, " +
            "reply with ONLY compact JSON: {\"summary\":\"<one short sentence>\",\"priority\":\"Hot|Warm|Cold\"}. " +
            "Priority: Hot = large budget or urgent timeline or clear intent; Cold = vague/low budget; Warm = in between.\n\n" +
            $"ProjectType: {lead.ProjectType}\nBudget: {lead.Budget}\nTimeline: {lead.Timeline}\nMessage: {lead.Message}";

        var requestBody = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            },
            generationConfig = new { temperature = 0.2, responseMimeType = "application/json" }
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{ai.Model}:generateContent";

        try
        {
            var client = httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(20);

            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = new StringContent(
                    JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
            };
            // The API key is sent as a request header (works for both classic
            // AIza keys and the newer AQ. keys); passing it as a ?key= query
            // param 404s for the newer key format.
            httpRequest.Headers.Add("x-goog-api-key", ai.ApiKey);
            using var response = await client.SendAsync(httpRequest, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Gemini returned {Status} for lead {LeadId}.", response.StatusCode, lead.Id);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            return ParseAnalysis(json);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "AI analysis failed for lead {LeadId}.", lead.Id);
            return null;
        }
    }

    // Gemini wraps the model output at candidates[0].content.parts[0].text,
    // which itself is the JSON we asked for. Parse both layers defensively.
    private LeadAnalysis? ParseAnalysis(string geminiResponse)
    {
        try
        {
            using var doc = JsonDocument.Parse(geminiResponse);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(text))
            {
                return null;
            }

            using var inner = JsonDocument.Parse(text);
            var summary = inner.RootElement.TryGetProperty("summary", out var s) ? s.GetString() : null;
            var priority = inner.RootElement.TryGetProperty("priority", out var p) ? p.GetString() : null;

            if (string.IsNullOrWhiteSpace(summary) || string.IsNullOrWhiteSpace(priority))
            {
                return null;
            }

            // Normalize priority to one of the known values; default to Warm.
            priority = ValidPriorities.FirstOrDefault(
                v => string.Equals(v, priority.Trim(), StringComparison.OrdinalIgnoreCase)) ?? "Warm";

            // Keep the summary reasonably short.
            summary = summary.Trim();
            if (summary.Length > 280)
            {
                summary = summary[..280];
            }

            return new LeadAnalysis(summary, priority);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Could not parse Gemini response.");
            return null;
        }
    }
}
