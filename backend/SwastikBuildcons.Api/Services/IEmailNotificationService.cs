using SwastikBuildcons.Api.Models;

namespace SwastikBuildcons.Api.Services;

public interface IEmailNotificationService
{
    /// <summary>
    /// Notifies the company inbox that a new lead was submitted.
    /// </summary>
    Task SendLeadNotificationAsync(Lead lead, CancellationToken cancellationToken);

    /// <summary>
    /// Sends a thank-you/auto-reply to the inquirer's email address (Req 8.5).
    /// No-op when the lead has no email or SMTP is not configured, matching the
    /// company-notification behavior. Never throws to the caller path such that
    /// it fails lead creation.
    /// </summary>
    Task SendLeadConfirmationAsync(Lead lead, CancellationToken cancellationToken);
}
