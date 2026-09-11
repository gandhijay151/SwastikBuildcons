using System.ComponentModel.DataAnnotations;

namespace SwastikBuildcons.Api.Contracts;

public class LoginRequest
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
