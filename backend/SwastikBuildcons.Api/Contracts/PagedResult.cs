namespace SwastikBuildcons.Api.Contracts;

/// <summary>
/// Generic paged-response envelope: a slice of <paramref name="Items"/> plus the
/// total number of records available and the paging coordinates that produced it.
/// </summary>
public record PagedResult<T>(
    IReadOnlyList<T> Items,
    int Total,
    int Page,
    int PageSize);
