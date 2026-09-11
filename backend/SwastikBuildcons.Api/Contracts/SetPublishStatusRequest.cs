namespace SwastikBuildcons.Api.Contracts;

/// <summary>
/// Request body for the publish-toggle endpoint
/// (<c>PATCH /api/admin/industrial-projects/{id}/publish</c>). Sets whether the
/// project is visible on the public site (Req 4.6).
/// </summary>
public class SetPublishStatusRequest
{
    /// <summary>True to publish the project publicly; false to unpublish (draft).</summary>
    public bool IsPublished { get; set; }
}
