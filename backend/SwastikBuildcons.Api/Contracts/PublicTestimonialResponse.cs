namespace SwastikBuildcons.Api.Contracts;

/// <summary>
/// Public-facing projection of a <see cref="Models.Testimonial"/>. Intentionally
/// omits IsPublished (only published testimonials are ever projected to this shape)
/// and audit fields.
/// </summary>
public record PublicTestimonialResponse(
    int Id,
    string ClientName,
    string? Company,
    string Quote,
    int? Rating,
    int? ProjectId);
