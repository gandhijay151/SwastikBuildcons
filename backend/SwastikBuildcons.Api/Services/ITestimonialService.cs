using SwastikBuildcons.Api.Contracts;

namespace SwastikBuildcons.Api.Services;

public interface ITestimonialService
{
    /// <summary>
    /// Returns only published testimonials, projected to <see cref="PublicTestimonialResponse"/>.
    /// </summary>
    Task<IReadOnlyList<PublicTestimonialResponse>> GetPublishedAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Returns all testimonials (admin), projected to <see cref="TestimonialResponse"/>.
    /// </summary>
    Task<IReadOnlyList<TestimonialResponse>> GetAllAsync(CancellationToken cancellationToken);

    Task<TestimonialResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);

    Task<TestimonialResponse> CreateAsync(CreateTestimonialRequest request, CancellationToken cancellationToken, string? createdBy = null);

    Task<TestimonialResponse?> UpdateAsync(int id, UpdateTestimonialRequest request, CancellationToken cancellationToken, string? updatedBy = null);

    /// <summary>
    /// Sets the testimonial's published flag, bumping UpdatedAtUtc, and returns the
    /// updated admin response — or null when no testimonial has the given id.
    /// </summary>
    Task<TestimonialResponse?> SetPublishedAsync(int id, bool isPublished, CancellationToken cancellationToken, string? updatedBy = null);

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
}
