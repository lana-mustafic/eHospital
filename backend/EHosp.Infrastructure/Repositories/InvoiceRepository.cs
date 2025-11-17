using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class InvoiceRepository : BaseRepository<Invoice>, IInvoiceRepository
{
    public InvoiceRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Invoice?> GetInvoiceWithDetailsAsync(int id)
        => await _dbSet.Include(i => i.Patient)
                      .ThenInclude(p => p.User)
                      .Include(i => i.Appointment)
                      .Include(i => i.CreatedByUser)
                      .Include(i => i.InvoiceItems)
                      .Include(i => i.Payments)
                      .ThenInclude(p => p.ProcessedByUser)
                      .FirstOrDefaultAsync(i => i.Id == id);

    public async Task<IEnumerable<Invoice>> GetAllInvoicesWithDetailsAsync()
        => await _dbSet.Include(i => i.Patient)
                      .ThenInclude(p => p.User)
                      .Include(i => i.Appointment)
                      .Include(i => i.CreatedByUser)
                      .Include(i => i.InvoiceItems)
                      .Include(i => i.Payments)
                      .ThenInclude(p => p.ProcessedByUser)
                      .OrderByDescending(i => i.InvoiceDate)
                      .ToListAsync();

    public async Task<IEnumerable<Invoice>> GetInvoicesByPatientAsync(int patientId)
        => await _dbSet.Include(i => i.Patient)
                      .ThenInclude(p => p.User)
                      .Include(i => i.Appointment)
                      .Include(i => i.CreatedByUser)
                      .Include(i => i.InvoiceItems)
                      .Include(i => i.Payments)
                      .ThenInclude(p => p.ProcessedByUser)
                      .Where(i => i.PatientId == patientId)
                      .OrderByDescending(i => i.InvoiceDate)
                      .ToListAsync();

    public async Task<IEnumerable<Invoice>> GetInvoicesByStatusAsync(string status)
        => await _dbSet.Include(i => i.Patient)
                      .ThenInclude(p => p.User)
                      .Include(i => i.Appointment)
                      .Include(i => i.CreatedByUser)
                      .Include(i => i.InvoiceItems)
                      .Include(i => i.Payments)
                      .ThenInclude(p => p.ProcessedByUser)
                      .Where(i => i.Status == status)
                      .OrderByDescending(i => i.InvoiceDate)
                      .ToListAsync();

    public async Task<IEnumerable<Invoice>> GetInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate)
        => await _dbSet.Include(i => i.Patient)
                      .ThenInclude(p => p.User)
                      .Include(i => i.Appointment)
                      .Include(i => i.CreatedByUser)
                      .Include(i => i.InvoiceItems)
                      .Include(i => i.Payments)
                      .ThenInclude(p => p.ProcessedByUser)
                      .Where(i => i.InvoiceDate >= startDate && i.InvoiceDate <= endDate)
                      .OrderByDescending(i => i.InvoiceDate)
                      .ToListAsync();

    public async Task<Invoice?> GetInvoiceByInvoiceNumberAsync(string invoiceNumber)
        => await _dbSet.Include(i => i.Patient)
                      .ThenInclude(p => p.User)
                      .Include(i => i.Appointment)
                      .Include(i => i.CreatedByUser)
                      .Include(i => i.InvoiceItems)
                      .Include(i => i.Payments)
                      .ThenInclude(p => p.ProcessedByUser)
                      .FirstOrDefaultAsync(i => i.InvoiceNumber == invoiceNumber);

    public async Task<string> GenerateNextInvoiceNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        var lastInvoice = await _dbSet
            .Where(i => i.InvoiceNumber.StartsWith($"INV-{year}-"))
            .OrderByDescending(i => i.InvoiceNumber)
            .FirstOrDefaultAsync();

        if (lastInvoice == null)
        {
            return $"INV-{year}-001";
        }

        var lastNumber = lastInvoice.InvoiceNumber.Split('-').LastOrDefault();
        if (int.TryParse(lastNumber, out var number))
        {
            return $"INV-{year}-{(number + 1):D3}";
        }

        return $"INV-{year}-001";
    }
}

public class PaymentRepository : BaseRepository<Payment>, IPaymentRepository
{
    public PaymentRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Payment?> GetPaymentWithDetailsAsync(int id)
        => await _dbSet.Include(p => p.Invoice)
                      .ThenInclude(i => i.Patient)
                      .ThenInclude(pat => pat.User)
                      .Include(p => p.ProcessedByUser)
                      .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<IEnumerable<Payment>> GetPaymentsByInvoiceAsync(int invoiceId)
        => await _dbSet.Include(p => p.Invoice)
                      .Include(p => p.ProcessedByUser)
                      .Where(p => p.InvoiceId == invoiceId)
                      .OrderByDescending(p => p.PaymentDate)
                      .ToListAsync();

    public async Task<IEnumerable<Payment>> GetPaymentsByPatientAsync(int patientId)
        => await _dbSet.Include(p => p.Invoice)
                      .ThenInclude(i => i.Patient)
                      .ThenInclude(pat => pat.User)
                      .Include(p => p.ProcessedByUser)
                      .Where(p => p.Invoice.PatientId == patientId)
                      .OrderByDescending(p => p.PaymentDate)
                      .ToListAsync();

    public async Task<string> GenerateNextPaymentNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        var lastPayment = await _dbSet
            .Where(p => p.PaymentNumber.StartsWith($"PAY-{year}-"))
            .OrderByDescending(p => p.PaymentNumber)
            .FirstOrDefaultAsync();

        if (lastPayment == null)
        {
            return $"PAY-{year}-001";
        }

        var lastNumber = lastPayment.PaymentNumber.Split('-').LastOrDefault();
        if (int.TryParse(lastNumber, out var number))
        {
            return $"PAY-{year}-{(number + 1):D3}";
        }

        return $"PAY-{year}-001";
    }
}

