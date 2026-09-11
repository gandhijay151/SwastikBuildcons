namespace SwastikBuildcons.Api.Contracts;

public record IndustrialProjectResponse(
    int Id,
    string ProjectName,
    string ClientName,
    string Location,
    DateTime StartDate,
    DateTime EstimatedCompletionDate,
    DateTime? ActualCompletionDate,
    string ProjectType,
    decimal BudgetAmount,
    decimal ActualCostToDate,
    string Status,
    int ProgressPercentage,
    string? Description,
    string? ScopeOfWork,
    string? ProjectManager,
    bool IsPublished,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);