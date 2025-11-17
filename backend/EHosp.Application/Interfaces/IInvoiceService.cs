using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IInvoiceService
{
    Task<IEnumerable<InvoiceDto>> GetAllInvoicesAsync();
    Task<InvoiceDto?> GetInvoiceByIdAsync(int id);
    Task<InvoiceDto?> GetInvoiceByInvoiceNumberAsync(string invoiceNumber);
    Task<IEnumerable<InvoiceDto>> GetInvoicesByPatientAsync(int patientId);
    Task<IEnumerable<InvoiceDto>> GetInvoicesByStatusAsync(string status);
    Task<IEnumerable<InvoiceDto>> GetInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<InvoiceDto> CreateInvoiceAsync(CreateInvoiceDto createInvoiceDto);
    Task UpdateInvoiceAsync(int id, UpdateInvoiceDto updateInvoiceDto);
    Task DeleteInvoiceAsync(int id);
    Task<string> GenerateInvoiceNumberAsync();
    Task<byte[]> GenerateInvoicePdfAsync(int invoiceId);
    
    // Payment methods
    Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto createPaymentDto);
    Task UpdatePaymentAsync(int id, UpdatePaymentDto updatePaymentDto);
    Task DeletePaymentAsync(int id);
    Task<IEnumerable<PaymentDto>> GetPaymentsByInvoiceAsync(int invoiceId);
    Task<PaymentDto?> GetPaymentByIdAsync(int id);
}

