using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using SwastikBuildcons.Api.Security;
using Microsoft.AspNetCore.Mvc;
using SwastikBuildcons.Api.Contracts;
using SwastikBuildcons.Api.Services;

namespace SwastikBuildcons.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin", AuthenticationSchemes = BasicAuthenticationHandler.SchemeName + "," + JwtBearerDefaults.AuthenticationScheme)]
[Route("api/admin/industrial-projects")]
public class IndustrialProjectsController(IIndustrialProjectService industrialProjectService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<IndustrialProjectResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<IndustrialProjectResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var projects = await industrialProjectService.GetAllAsync(cancellationToken);
        return Ok(projects);
    }

    [HttpGet("{id:int}", Name = "GetIndustrialProjectById")]
    [ProducesResponseType(typeof(IndustrialProjectResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IndustrialProjectResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var project = await industrialProjectService.GetByIdAsync(id, cancellationToken);
        return project is null ? NotFound() : Ok(project);
    }

    [HttpPost]
    [ProducesResponseType(typeof(IndustrialProjectResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IndustrialProjectResponse>> Create(
        CreateIndustrialProjectRequest request,
        CancellationToken cancellationToken)
    {
        var project = await industrialProjectService.CreateAsync(request, cancellationToken, User.Identity?.Name);
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(IndustrialProjectResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IndustrialProjectResponse>> Update(
        int id,
        CreateIndustrialProjectRequest request,
        CancellationToken cancellationToken)
    {
        if (id <= 0)
            return BadRequest("Invalid project ID");

        var project = await industrialProjectService.UpdateAsync(id, request, cancellationToken, User.Identity?.Name);
        return project is null ? NotFound() : Ok(project);
    }

    [HttpPatch("{id:int}/publish")]
    [ProducesResponseType(typeof(IndustrialProjectResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IndustrialProjectResponse>> SetPublished(
        int id,
        SetPublishStatusRequest request,
        CancellationToken cancellationToken)
    {
        var project = await industrialProjectService.SetPublishedAsync(id, request.IsPublished, cancellationToken, User.Identity?.Name);
        return project is null ? NotFound() : Ok(project);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await industrialProjectService.DeleteAsync(id, cancellationToken);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
