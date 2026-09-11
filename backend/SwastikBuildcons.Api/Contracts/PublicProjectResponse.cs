namespace SwastikBuildcons.Api.Contracts;

/// <summary>
/// Public-facing projection of an <see cref="Models.IndustrialProject"/>.
/// Intentionally excludes financial fields (BudgetAmount, ActualCostToDate) so that
/// budget and cost data are never exposed on the public site (Req 1.7).
/// </summary>
public record PublicProjectResponse(
    int Id,
    string ProjectName,
    string ClientName,
    string Location,
    string ProjectType,
    string Status,
    int ProgressPercentage,
    string? Description,
    string? ScopeOfWork,
    DateTime StartDate,
    DateTime EstimatedCompletionDate,
    DateTime? ActualCompletionDate);
