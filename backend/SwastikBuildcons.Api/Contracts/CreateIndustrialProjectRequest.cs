using System.ComponentModel.DataAnnotations;

namespace SwastikBuildcons.Api.Contracts;

public class CreateIndustrialProjectRequest
{
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

    [Required, StringLength(100)]
    public string ProjectType { get; set; } = string.Empty;

    [Required]
    public decimal BudgetAmount { get; set; }

    [Required]
    public decimal ActualCostToDate { get; set; }

    [Required, StringLength(50)]
    public string Status { get; set; } = string.Empty;

    [Required, Range(0, 100)]
    public int ProgressPercentage { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(1000)]
    public string? ScopeOfWork { get; set; }

    [StringLength(200)]
    public string? ProjectManager { get; set; }
}