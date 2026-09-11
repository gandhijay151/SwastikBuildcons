using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwastikBuildcons.Api.Contracts;
using SwastikBuildcons.Api.Services;

namespace SwastikBuildcons.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult<LoginResponse> Login(LoginRequest request)
    {
        var result = authService.Login(request);
        return result is null ? Unauthorized() : Ok(result);
    }
}
