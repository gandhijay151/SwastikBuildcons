namespace SwastikBuildcons.Api.Contracts;

/// <summary>Successful login result (Req 9.1): a bearer token and its expiry.</summary>
public record LoginResponse(string Token, DateTimeOffset ExpiresAtUtc);
