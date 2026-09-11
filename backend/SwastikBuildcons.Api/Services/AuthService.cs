using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SwastikBuildcons.Api.Contracts;
using SwastikBuildcons.Api.Options;

namespace SwastikBuildcons.Api.Services;

public class AuthService(
    IOptions<AdminAuthOptions> adminOptions,
    IOptions<JwtOptions> jwtOptions) : IAuthService
{
    public LoginResponse? Login(LoginRequest request)
    {
        var admin = adminOptions.Value;

        // Constant-time comparison of both fields to avoid leaking timing info.
        var userMatch = FixedTimeEquals(request.Username, admin.Username);
        var passMatch = FixedTimeEquals(request.Password, admin.Password);
        if (!userMatch || !passMatch)
        {
            return null;
        }

        var jwt = jwtOptions.Value;
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(jwt.ExpiryMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, admin.Username),
            new Claim(ClaimTypes.Name, admin.Username),
            new Claim(ClaimTypes.Role, "Admin"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwt.Issuer,
            audience: jwt.Audience,
            claims: claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);

        var encoded = new JwtSecurityTokenHandler().WriteToken(token);
        return new LoginResponse(encoded, expiresAt);
    }

    private static bool FixedTimeEquals(string left, string right)
    {
        var leftBytes = Encoding.UTF8.GetBytes(left ?? string.Empty);
        var rightBytes = Encoding.UTF8.GetBytes(right ?? string.Empty);
        return leftBytes.Length == rightBytes.Length &&
               CryptographicOperations.FixedTimeEquals(leftBytes, rightBytes);
    }
}
