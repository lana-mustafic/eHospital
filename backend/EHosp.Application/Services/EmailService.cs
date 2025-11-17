using EHosp.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true)
    {
        return await SendEmailAsync(to, "", subject, body, isHtml);
    }

    public async Task<bool> SendEmailAsync(string to, string toName, string subject, string body, bool isHtml = true)
    {
        try
        {
            // TODO: Implement actual email sending using SMTP, SendGrid, AWS SES, or similar
            // For now, just log the email
            _logger.LogInformation($"Email would be sent to: {to} ({toName}), Subject: {subject}");
            
            // Simulate async operation
            await Task.Delay(100);
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error sending email to {to}");
            return false;
        }
    }
}

