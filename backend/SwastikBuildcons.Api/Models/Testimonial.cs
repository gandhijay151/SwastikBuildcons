using System.ComponentModel.DataAnnotations;

namespace SwastikBuildcons.Api.Models;

public class Testimonial
{
    public int Id { get; set; }

    [Required, StringLength(120)]
    public string ClientName { get; set; } = string.Empty;

    [StringLength(160)]
    public string? Company { get; set; }

    [Required, StringLength(1000)]
    public string Quote { get; set; } = string.Empty;

    [Range(1, 5)]
    public int? Rating { get; set; }

    /// <summary>
    /// Optional link to the industrial project this testimonial relates to.
    /// Nullable so deleting a project sets this to null rather than cascade-deleting
    /// the testimonial.
    /// </summary>
    public int? ProjectId { get; set; }

    public IndustrialProject? Project { get; set; }

    /// <summary>
    /// Controls whether the testimonial is visible on the public site. Defaults to false
    /// so newly created testimonials are private until an admin explicitly publishes them (Req 5.3).
    /// </summary>
    public bool IsPublished { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Audit field capturing which admin last created or modified the record (Req 9.4).
    /// </summary>
    [StringLength(120)]
    public string? UpdatedBy { get; set; }
}
