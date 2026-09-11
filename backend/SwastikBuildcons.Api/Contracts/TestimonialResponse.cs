namespace SwastikBuildcons.Api.Contracts;

/// <summary>
/// Admin-facing projection of a <see cref="Models.Testimonial"/>, including
/// the publish state and audit timestamp.
/// </summary>
public record TestimonialResponse(
    int Id,
    string ClientName,
    string? Company,
    string Quote,
    int? Rating,
    int? ProjectId,
    bool IsPublished,
    DateTimeOffset CreatedAtUtc,
    string? UpdatedBy = null);
