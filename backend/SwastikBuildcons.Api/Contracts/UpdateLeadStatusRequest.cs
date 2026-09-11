using System.ComponentModel.DataAnnotations;

namespace SwastikBuildcons.Api.Contracts;

public class UpdateLeadStatusRequest
{
    [Required, StringLength(40)]
    public string Status { get; set; } = string.Empty;
}
