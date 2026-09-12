using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SwastikBuildcons.Api.Contracts;
using SwastikBuildcons.Api.Services;

namespace SwastikBuildcons.Api.Controllers;

[ApiController]
[Route("api/leads")]
public class LeadsController(
    ILeadService leadService,
    ITurnstileVerifier turnstileVerifier) : ControllerBase
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

        // Cloudflare Turnstile check. No-op when Turnstile isn't configured; when
        // it is, a missing/invalid token is rejected as a bad request.
        var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        if (!await turnstileVerifier.VerifyAsync(request.TurnstileToken, remoteIp, cancellationToken))
        {
            return BadRequest(new { error = "CAPTCHA verification failed. Please try again." });
        }

        var lead = await leadService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(AdminLeadsController.GetById), "AdminLeads", new { id = lead.Id }, lead);
    }
}
