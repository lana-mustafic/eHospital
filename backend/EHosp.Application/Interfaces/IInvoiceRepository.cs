using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IInvoiceRepository : IRepository<Invoice>
{
    Task<Invoice?> GetInvoiceWithDetailsAsync(int id);
    Task<IEnumerable<Invoice>> GetAllInvoicesWithDetailsAsync();
    Task<IEnumerable<Invoice>> GetInvoicesByPatientAsync(int patientId);
    Task<IEnumerable<Invoice>> GetInvoicesByStatusAsync(string status);
    Task<IEnumerable<Invoice>> GetInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<Invoice?> GetInvoiceByInvoiceNumberAsync(string invoiceNumber);
    Task<string> GenerateNextInvoiceNumberAsync();
}

public interface IPaymentRepository : IRepository<Payment>
{
    Task<Payment?> GetPaymentWithDetailsAsync(int id);
    Task<IEnumerable<Payment>> GetPaymentsByInvoiceAsync(int invoiceId);
    Task<IEnumerable<Payment>> GetPaymentsByPatientAsync(int patientId);
    Task<string> GenerateNextPaymentNumberAsync();
}

