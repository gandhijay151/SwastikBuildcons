using SwastikBuildcons.Api.Models;

namespace SwastikBuildcons.Api.Services;

public interface IAiLeadAnalysisService
{
    /// <summary>
    /// Analyzes a lead and returns a one-line summary and a priority tag
    /// ("Hot" | "Warm" | "Cold"), or null if AI is not configured or the call
    /// fails. Callers must treat failure as a no-op and never block lead creation.
    /// </summary>
    Task<LeadAnalysis?> AnalyzeAsync(Lead lead, CancellationToken cancellationToken);
}

public record LeadAnalysis(string Summary, string Priority);
