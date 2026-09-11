using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using SwastikBuildcons.Api.Security;
using Microsoft.AspNetCore.Mvc;
using SwastikBuildcons.Api.Contracts;
using SwastikBuildcons.Api.Services;

namespace SwastikBuildcons.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin", AuthenticationSchemes = BasicAuthenticationHandler.SchemeName + "," + JwtBearerDefaults.AuthenticationScheme)]
[Route("api/admin/leads")]
public class AdminLeadsController(ILeadService leadService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<LeadResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PagedResult<LeadResponse>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var leads = await leadService.GetPagedAsync(page, pageSize, cancellationToken);
        return Ok(leads);
    }

    [HttpGet("export")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ExportCsv(CancellationToken cancellationToken)
    {
        var bytes = await leadService.ExportCsvAsync(cancellationToken);
        var fileName = $"leads-export-{DateTime.UtcNow:yyyyMMdd}.csv";
        return File(bytes, "text/csv", fileName);
    }

    [HttpGet("{id:int}", Name = "GetAdminLeadById")]
    [ProducesResponseType(typeof(LeadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LeadResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var lead = await leadService.GetByIdAsync(id, cancellationToken);
        return lead is null ? NotFound() : Ok(lead);
    }

    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(LeadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LeadResponse>> UpdateStatus(
        int id,
        UpdateLeadStatusRequest request,
        CancellationToken cancellationToken)
    {
        var lead = await leadService.UpdateStatusAsync(id, request, cancellationToken);
        return lead is null ? NotFound() : Ok(lead);
    }
}

