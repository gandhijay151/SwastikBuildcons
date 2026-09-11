using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SwastikBuildcons.Api.Contracts;
using SwastikBuildcons.Api.Services;

namespace SwastikBuildcons.Api.Controllers;

[ApiController]
[Route("api/leads")]
public class LeadsController(ILeadService leadService) : ControllerBase
{
    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("LeadSubmissions")]
    [ProducesResponseType(typeof(LeadResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LeadResponse>> Create(
        CreateLeadRequest request,
        CancellationToken cancellationToken)
    {
        // Honeypot spam trap (Req 8.4): the hidden "Website" field is invisible to
        // real users. If a bot fills it, silently accept the request without
        // persisting anything, so the spammer sees a normal success and gets no
        // signal that the submission was dropped.
        if (!string.IsNullOrWhiteSpace(request.Website))
        {
            return Accepted();
        }

        var lead = await leadService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(AdminLeadsController.GetById), "AdminLeads", new { id = lead.Id }, lead);
    }
}
