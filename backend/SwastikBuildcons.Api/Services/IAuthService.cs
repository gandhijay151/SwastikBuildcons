using SwastikBuildcons.Api.Contracts;

namespace SwastikBuildcons.Api.Services;

public interface IAuthService
{
    /// <summary>
    /// Validates admin credentials and issues a JWT on success (Req 9.1).
    /// Returns null when the credentials are invalid.
    /// </summary>
    LoginResponse? Login(LoginRequest request);
}
