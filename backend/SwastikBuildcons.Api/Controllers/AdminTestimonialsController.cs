using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using SwastikBuildcons.Api.Security;
using Microsoft.AspNetCore.Mvc;
using SwastikBuildcons.Api.Contracts;
using SwastikBuildcons.Api.Services;

namespace SwastikBuildcons.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin", AuthenticationSchemes = BasicAuthenticationHandler.SchemeName + "," + JwtBearerDefaults.AuthenticationScheme)]
[Route("api/admin/testimonials")]
public class AdminTestimonialsController(ITestimonialService testimonialService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TestimonialResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<TestimonialResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var testimonials = await testimonialService.GetAllAsync(cancellationToken);
        return Ok(testimonials);
    }

    [HttpGet("{id:int}", Name = "GetTestimonialById")]
    [ProducesResponseType(typeof(TestimonialResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TestimonialResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var testimonial = await testimonialService.GetByIdAsync(id, cancellationToken);
        return testimonial is null ? NotFound() : Ok(testimonial);
    }

    [HttpPost]
    [ProducesResponseType(typeof(TestimonialResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<TestimonialResponse>> Create(
        CreateTestimonialRequest request,
        CancellationToken cancellationToken)
    {
        var testimonial = await testimonialService.CreateAsync(request, cancellationToken, User.Identity?.Name);
        return CreatedAtAction(nameof(GetById), new { id = testimonial.Id }, testimonial);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(TestimonialResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TestimonialResponse>> Update(
        int id,
        UpdateTestimonialRequest request,
        CancellationToken cancellationToken)
    {
        if (id <= 0)
            return BadRequest("Invalid testimonial ID");

        var testimonial = await testimonialService.UpdateAsync(id, request, cancellationToken, User.Identity?.Name);
        return testimonial is null ? NotFound() : Ok(testimonial);
    }

    [HttpPatch("{id:int}/publish")]
    [ProducesResponseType(typeof(TestimonialResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TestimonialResponse>> SetPublished(
        int id,
        SetPublishStatusRequest request,
        CancellationToken cancellationToken)
    {
        var testimonial = await testimonialService.SetPublishedAsync(id, request.IsPublished, cancellationToken, User.Identity?.Name);
        return testimonial is null ? NotFound() : Ok(testimonial);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await testimonialService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}

