using System.ComponentModel.DataAnnotations;

namespace SwastikBuildcons.Api.Models;

public class IndustrialProject
{
    public int Id { get; set; }

    [Required, StringLength(120)]
    public string ProjectName { get; set; } = string.Empty;

    [Required, StringLength(120)]
    public string ClientName { get; set; } = string.Empty;

    [Required, StringLength(200)]
    public string Location { get; set; } = string.Empty;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EstimatedCompletionDate { get; set; }

    public DateTime? ActualCompletionDate { get; set; }

    [Required, StringLength(100)]
    public string ProjectType { get; set; } = string.Empty; // e.g., Factory, Warehouse, Industrial Plant

    [Required]
    public decimal BudgetAmount { get; set; }

    [Required]
    public decimal ActualCostToDate { get; set; }

    [Required, StringLength(50)]
    public string Status { get; set; } = string.Empty; // Planning, In Progress, On Hold, Completed, Delayed

    [Required, Range(0, 100)]
    public int ProgressPercentage { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(1000)]
    public string? ScopeOfWork { get; set; }

    [StringLength(200)]
    public string? ProjectManager { get; set; }

    /// <summary>
    /// Controls whether the project is visible on the public site. Defaults to false
    /// so newly created projects are private until an admin explicitly publishes them.
    /// </summary>
    public bool IsPublished { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Audit field capturing which admin last modified the record.
    /// </summary>
    [StringLength(120)]
    public string? UpdatedBy { get; set; }
}