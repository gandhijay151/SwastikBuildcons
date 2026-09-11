namespace SwastikBuildcons.Api.Models;

public class Lead
{
    public int Id { get; set; }

    public required string Name { get; set; }
    public required string Phone { get; set; }
    public string? Email { get; set; }
    public required string ProjectType { get; set; }
    public required string Budget { get; set; }
    public string? Message { get; set; }
    public string? Timeline { get; set; }
    public string Status { get; set; } = "New";
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}
