using System.ComponentModel.DataAnnotations;

namespace SwastikBuildcons.Api.Contracts;

public class CreateTestimonialRequest
{
    [Required, StringLength(120)]
    public string ClientName { get; set; } = string.Empty;

    [StringLength(160)]
    public string? Company { get; set; }

    [Required, StringLength(1000)]
    public string Quote { get; set; } = string.Empty;

    [Range(1, 5)]
    public int? Rating { get; set; }

    public int? ProjectId { get; set; }

    public bool IsPublished { get; set; }
}
