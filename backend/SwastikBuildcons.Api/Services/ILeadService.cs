using SwastikBuildcons.Api.Contracts;

namespace SwastikBuildcons.Api.Services;

public interface ILeadService
{
    Task<LeadResponse> CreateAsync(CreateLeadRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyList<LeadResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<PagedResult<LeadResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken);
    Task<LeadResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<LeadResponse?> UpdateStatusAsync(int id, UpdateLeadStatusRequest request, CancellationToken cancellationToken);
    Task<byte[]> ExportCsvAsync(CancellationToken cancellationToken);
}
