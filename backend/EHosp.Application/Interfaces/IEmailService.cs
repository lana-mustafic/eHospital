namespace EHosp.Application.Interfaces;

public interface IEmailService
{
    Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true);
    Task<bool> SendEmailAsync(string to, string toName, string subject, string body, bool isHtml = true);
}

