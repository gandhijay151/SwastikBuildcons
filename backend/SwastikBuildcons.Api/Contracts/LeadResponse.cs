namespace SwastikBuildcons.Api.Contracts;

public record LeadResponse(
    int Id,
    string Name,
    string Phone,
    string? Email,
    string ProjectType,
    string Budget,
    string? Message,
    string? Timeline,
    string Status,
    DateTimeOffset CreatedAtUtc);
