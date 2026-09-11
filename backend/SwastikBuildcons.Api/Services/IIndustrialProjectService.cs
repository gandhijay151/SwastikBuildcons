using SwastikBuildcons.Api.Contracts;

namespace SwastikBuildcons.Api.Services;

public interface IIndustrialProjectService
{
    Task<IndustrialProjectResponse> CreateAsync(CreateIndustrialProjectRequest request, CancellationToken cancellationToken, string? createdBy = null);
    Task<IReadOnlyList<IndustrialProjectResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<IndustrialProjectResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);

    /// <summary>
    /// Returns only published projects (<see cref="Models.IndustrialProject.IsPublished"/> == true),
    /// projected to <see cref="PublicProjectResponse"/> so financial fields are never exposed.
    /// Optionally filtered by project type and/or status (case-insensitive). Both filters are optional.
    /// </summary>
    Task<IReadOnlyList<PublicProjectResponse>> GetPublishedAsync(string? type, string? status, CancellationToken cancellationToken);

    /// <summary>
    /// Returns a single published project by id, or null when the project does not exist
    /// or is not published.
    /// </summary>
    Task<PublicProjectResponse?> GetPublishedByIdAsync(int id, CancellationToken cancellationToken);
    Task<IndustrialProjectResponse?> UpdateAsync(int id, CreateIndustrialProjectRequest request, CancellationToken cancellationToken, string? updatedBy = null);

    /// <summary>
    /// Sets the project's <see cref="Models.IndustrialProject.IsPublished"/> flag,
    /// bumping <see cref="Models.IndustrialProject.UpdatedAtUtc"/>, and returns the
    /// updated admin response — or null when no project has the given id (Req 4.6).
    /// </summary>
    Task<IndustrialProjectResponse?> SetPublishedAsync(int id, bool isPublished, CancellationToken cancellationToken, string? updatedBy = null);

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
}