using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwastikBuildcons.Api.Contracts;
using SwastikBuildcons.Api.Services;

namespace SwastikBuildcons.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/projects")]
public class ProjectsController(IIndustrialProjectService industrialProjectService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<PublicProjectResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PublicProjectResponse>>> GetPublished(
        [FromQuery] string? type,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var projects = await industrialProjectService.GetPublishedAsync(type, status, cancellationToken);
        return Ok(projects);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PublicProjectResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PublicProjectResponse>> GetPublishedById(int id, CancellationToken cancellationToken)
    {
        var project = await industrialProjectService.GetPublishedByIdAsync(id, cancellationToken);
        return project is null ? NotFound() : Ok(project);
    }
}
