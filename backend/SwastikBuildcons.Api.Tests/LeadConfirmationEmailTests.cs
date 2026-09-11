using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using SwastikBuildcons.Api.Models;
using SwastikBuildcons.Api.Options;
using SwastikBuildcons.Api.Services;
using Xunit;

namespace SwastikBuildcons.Api.Tests;

/// <summary>
/// Unit tests for <see cref="SmtpEmailNotificationService.SendLeadConfirmationAsync"/> (Req 8.5).
///
/// The two guarded no-op paths are exercised directly (no SMTP server or DB needed):
///  - When the lead has no email, the method skips sending (nothing to confirm).
///  - When SMTP is unconfigured, the method is a graceful no-op, mirroring the
///    company-notification behavior.
///
/// Both cases must complete without throwing (a network attempt would throw here
/// because there is no SMTP host), which proves the send is correctly skipped.
/// </summary>
public class LeadConfirmationEmailTests
{
    private static SmtpEmailNotificationService CreateService(SmtpOptions options)
    {
        return new SmtpEmailNotificationService(
            Microsoft.Extensions.Options.Options.Create(options),
            NullLogger<SmtpEmailNotificationService>.Instance);
    }

    private static Lead SampleLead(string? email) => new()
    {
        Id = 1,
        Name = "Alice Sharma",
        Phone = "9876543210",
        Email = email,
        ProjectType = "Warehouse",
        Budget = "50L",
        Timeline = "6 months",
        Status = "New",
        Message = "Need a large facility",
        CreatedAtUtc = DateTimeOffset.UtcNow
    };

    [Fact]
    public async Task SendLeadConfirmationAsync_NoInquirerEmail_SkipsSend()
    {
        // SMTP is fully configured, but the lead has no email → must skip (no throw).
        var service = CreateService(new SmtpOptions
        {
            Host = "smtp.example.com",
            FromEmail = "noreply@example.com",
            ToEmail = "sales@example.com"
        });

        await service.SendLeadConfirmationAsync(SampleLead(email: null), CancellationToken.None);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task SendLeadConfirmationAsync_BlankInquirerEmail_SkipsSend(string email)
    {
        var service = CreateService(new SmtpOptions
        {
            Host = "smtp.example.com",
            FromEmail = "noreply@example.com",
            ToEmail = "sales@example.com"
        });

        await service.SendLeadConfirmationAsync(SampleLead(email), CancellationToken.None);
    }

    [Fact]
    public async Task SendLeadConfirmationAsync_SmtpUnconfigured_NoOps()
    {
        // Lead has an email, but SMTP host/from are unset → graceful no-op (no throw).
        var service = CreateService(new SmtpOptions());

        await service.SendLeadConfirmationAsync(SampleLead("alice@example.com"), CancellationToken.None);
    }
}
