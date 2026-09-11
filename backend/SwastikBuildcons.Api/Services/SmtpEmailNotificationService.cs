using System.Net;
using System.Net.Mail;
using System.Text;
using Microsoft.Extensions.Options;
using SwastikBuildcons.Api.Models;
using SwastikBuildcons.Api.Options;

namespace SwastikBuildcons.Api.Services;

public class SmtpEmailNotificationService(
    IOptions<SmtpOptions> options,
    ILogger<SmtpEmailNotificationService> logger) : IEmailNotificationService
{
    public async Task SendLeadNotificationAsync(Lead lead, CancellationToken cancellationToken)
    {
        var smtp = options.Value;
        if (string.IsNullOrWhiteSpace(smtp.Host) ||
            string.IsNullOrWhiteSpace(smtp.FromEmail) ||
            string.IsNullOrWhiteSpace(smtp.ToEmail))
        {
            logger.LogInformation("SMTP is not configured. Skipping email notification for lead {LeadId}.", lead.Id);
            return;
        }

        using var message = new MailMessage
        {
            From = new MailAddress(smtp.FromEmail, smtp.FromName),
            Subject = $"New Swastik Buildcons inquiry: {lead.ProjectType}",
            Body = BuildBody(lead),
            IsBodyHtml = false
        };
        message.To.Add(smtp.ToEmail);

        await SendAsync(smtp, message, cancellationToken);
    }

    public async Task SendLeadConfirmationAsync(Lead lead, CancellationToken cancellationToken)
    {
        var smtp = options.Value;

        // No inquirer email → nothing to confirm (Req 8.5).
        if (string.IsNullOrWhiteSpace(lead.Email))
        {
            logger.LogInformation("Lead {LeadId} has no email; skipping customer confirmation.", lead.Id);
            return;
        }

        // Same no-op behavior as the company notification when SMTP is unconfigured.
        if (string.IsNullOrWhiteSpace(smtp.Host) || string.IsNullOrWhiteSpace(smtp.FromEmail))
        {
            logger.LogInformation("SMTP is not configured. Skipping customer confirmation for lead {LeadId}.", lead.Id);
            return;
        }

        using var message = new MailMessage
        {
            From = new MailAddress(smtp.FromEmail, smtp.FromName),
            Subject = "Thank you for contacting Swastik Buildcons",
            Body = BuildConfirmationBody(lead),
            IsBodyHtml = false
        };
        message.To.Add(lead.Email);

        await SendAsync(smtp, message, cancellationToken);
    }

    private static async Task SendAsync(SmtpOptions smtp, MailMessage message, CancellationToken cancellationToken)
    {
        using var client = new SmtpClient(smtp.Host, smtp.Port)
        {
            EnableSsl = smtp.EnableSsl
        };

        if (!string.IsNullOrWhiteSpace(smtp.Username))
        {
            client.Credentials = new NetworkCredential(smtp.Username, smtp.Password);
        }

        await client.SendMailAsync(message, cancellationToken);
    }

    private static string BuildBody(Lead lead)
    {
        var body = new StringBuilder();
        body.AppendLine("New inquiry received from the Swastik Buildcons website.");
        body.AppendLine();
        body.AppendLine($"Name: {lead.Name}");
        body.AppendLine($"Phone: {lead.Phone}");
        body.AppendLine($"Email: {lead.Email ?? "-"}");
        body.AppendLine($"Project Type: {lead.ProjectType}");
        body.AppendLine($"Budget: {lead.Budget}");
        body.AppendLine($"Timeline: {lead.Timeline ?? "-"}");
        body.AppendLine($"Message: {lead.Message ?? "-"}");
        body.AppendLine($"Submitted UTC: {lead.CreatedAtUtc:O}");
        return body.ToString();
    }

    private static string BuildConfirmationBody(Lead lead)
    {
        var body = new StringBuilder();
        body.AppendLine($"Hi {lead.Name},");
        body.AppendLine();
        body.AppendLine("Thank you for reaching out to Swastik Buildcons. We've received your inquiry and our team will review the details and get back to you within 24 hours.");
        body.AppendLine();
        body.AppendLine("Here's a copy of what you sent us:");
        body.AppendLine($"  Project Type: {lead.ProjectType}");
        body.AppendLine($"  Budget: {lead.Budget}");
        body.AppendLine($"  Timeline: {lead.Timeline ?? "-"}");
        if (!string.IsNullOrWhiteSpace(lead.Message))
        {
            body.AppendLine($"  Message: {lead.Message}");
        }
        body.AppendLine();
        body.AppendLine("If you'd like to reach us sooner, call +91 8511 00 3888.");
        body.AppendLine();
        body.AppendLine("Warm regards,");
        body.AppendLine("Swastik Buildcons");
        return body.ToString();
    }
}
