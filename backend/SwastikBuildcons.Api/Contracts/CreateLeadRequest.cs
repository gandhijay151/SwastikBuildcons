using System.ComponentModel.DataAnnotations;

namespace SwastikBuildcons.Api.Contracts;

public class CreateLeadRequest
{
    [Required, StringLength(120)]
    public string Name { get; set; } = string.Empty;

    [Required, Phone, StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [EmailAddress, StringLength(160)]
    public string? Email { get; set; }

    [Required, StringLength(80)]
    public string ProjectType { get; set; } = string.Empty;

    [Required, StringLength(80)]
    public string Budget { get; set; } = string.Empty;

    [StringLength(1500)]
    public string? Message { get; set; }

    [Required, StringLength(80)]
    public string Timeline { get; set; } = string.Empty;

    /// <summary>
    /// Honeypot spam trap (Req 8.4). The public form renders this as a hidden,
    /// off-screen field that real users never see or fill. Legitimate
    /// submissions leave it empty; bots that auto-fill every input populate it,
    /// so a non-empty value flags the submission as spam and it is silently
    /// rejected without persisting a lead.
    /// </summary>
    public string? Website { get; set; }
}
