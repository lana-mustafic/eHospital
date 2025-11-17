using EHosp.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class SmsService : ISmsService
{
    private readonly ILogger<SmsService> _logger;

    public SmsService(ILogger<SmsService> logger)
    {
        _logger = logger;
    }

    public async Task<bool> SendSmsAsync(string phoneNumber, string message)
    {
        try
        {
            // TODO: Implement actual SMS sending using Twilio, AWS SNS, or similar
            // For now, just log the SMS
            _logger.LogInformation($"SMS would be sent to: {phoneNumber}, Message: {message}");
            
            // Simulate async operation
            await Task.Delay(100);
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error sending SMS to {phoneNumber}");
            return false;
        }
    }
}

