using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwastikBuildcons.Api.Contracts;
using SwastikBuildcons.Api.Services;

namespace SwastikBuildcons.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/testimonials")]
public class TestimonialsController(ITestimonialService testimonialService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<PublicTestimonialResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PublicTestimonialResponse>>> GetPublished(CancellationToken cancellationToken)
    {
        var testimonials = await testimonialService.GetPublishedAsync(cancellationToken);
        return Ok(testimonials);
    }
}
