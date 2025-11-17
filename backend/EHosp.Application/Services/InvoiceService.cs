using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IPaymentRepository _paymentRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<InvoiceService> _logger;
    private readonly IAuditService _auditService;

    public InvoiceService(
        IInvoiceRepository invoiceRepository,
        IPaymentRepository paymentRepository,
        IPatientRepository patientRepository,
        IAppointmentRepository appointmentRepository,
        IUserRepository userRepository,
        ILogger<InvoiceService> logger,
        IAuditService auditService)
    {
        _invoiceRepository = invoiceRepository;
        _paymentRepository = paymentRepository;
        _patientRepository = patientRepository;
        _appointmentRepository = appointmentRepository;
        _userRepository = userRepository;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<IEnumerable<InvoiceDto>> GetAllInvoicesAsync()
    {
        var invoices = await _invoiceRepository.GetAllInvoicesWithDetailsAsync();
        return invoices.Select(MapToDto);
    }

    public async Task<InvoiceDto?> GetInvoiceByIdAsync(int id)
    {
        var invoice = await _invoiceRepository.GetInvoiceWithDetailsAsync(id);
        return invoice != null ? MapToDto(invoice) : null;
    }

    public async Task<InvoiceDto?> GetInvoiceByInvoiceNumberAsync(string invoiceNumber)
    {
        var invoice = await _invoiceRepository.GetInvoiceByInvoiceNumberAsync(invoiceNumber);
        return invoice != null ? MapToDto(invoice) : null;
    }

    public async Task<IEnumerable<InvoiceDto>> GetInvoicesByPatientAsync(int patientId)
    {
        var invoices = await _invoiceRepository.GetInvoicesByPatientAsync(patientId);
        return invoices.Select(MapToDto);
    }

    public async Task<IEnumerable<InvoiceDto>> GetInvoicesByStatusAsync(string status)
    {
        var invoices = await _invoiceRepository.GetInvoicesByStatusAsync(status);
        return invoices.Select(MapToDto);
    }

    public async Task<IEnumerable<InvoiceDto>> GetInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var invoices = await _invoiceRepository.GetInvoicesByDateRangeAsync(startDate, endDate);
        return invoices.Select(MapToDto);
    }

    public async Task<InvoiceDto> CreateInvoiceAsync(CreateInvoiceDto createInvoiceDto)
    {
        // Validate patient exists
        var patient = await _patientRepository.GetByIdAsync(createInvoiceDto.PatientId);
        if (patient == null)
        {
            throw new ArgumentException("Patient not found");
        }

        // Validate appointment if provided
        if (createInvoiceDto.AppointmentId.HasValue)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(createInvoiceDto.AppointmentId.Value);
            if (appointment == null)
            {
                throw new ArgumentException("Appointment not found");
            }
        }

        // Validate user if provided
        if (createInvoiceDto.CreatedByUserId.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(createInvoiceDto.CreatedByUserId.Value);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }
        }

        // Generate invoice number
        var invoiceNumber = await _invoiceRepository.GenerateNextInvoiceNumberAsync();

        // Calculate totals
        var subTotal = createInvoiceDto.InvoiceItems.Sum(item => item.Quantity * item.UnitPrice);
        var totalAmount = subTotal + createInvoiceDto.TaxAmount - createInvoiceDto.DiscountAmount;

        // Determine initial status
        var status = totalAmount <= 0 ? "Paid" : "Pending";

        var invoice = new Invoice
        {
            InvoiceNumber = invoiceNumber,
            InvoiceDate = createInvoiceDto.InvoiceDate,
            DueDate = createInvoiceDto.DueDate,
            SubTotal = subTotal,
            TaxAmount = createInvoiceDto.TaxAmount,
            DiscountAmount = createInvoiceDto.DiscountAmount,
            TotalAmount = totalAmount,
            PaidAmount = 0,
            Status = status,
            Notes = createInvoiceDto.Notes,
            PatientId = createInvoiceDto.PatientId,
            AppointmentId = createInvoiceDto.AppointmentId,
            CreatedByUserId = createInvoiceDto.CreatedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        // Add invoice items
        foreach (var itemDto in createInvoiceDto.InvoiceItems)
        {
            invoice.InvoiceItems.Add(new InvoiceItem
            {
                Description = itemDto.Description,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                ItemType = itemDto.ItemType,
                RelatedEntityId = itemDto.RelatedEntityId,
                CreatedAt = DateTime.UtcNow
            });
        }

        var createdInvoice = await _invoiceRepository.AddAsync(invoice);
        await _auditService.WriteAsync(
            createInvoiceDto.CreatedByUserId?.ToString() ?? "system",
            "Admin",
            "Create",
            "Invoice",
            createdInvoice.Id.ToString(),
            $"InvoiceNumber={invoiceNumber}, PatientId={createInvoiceDto.PatientId}, TotalAmount={totalAmount}"
        );

        var invoiceWithDetails = await _invoiceRepository.GetInvoiceWithDetailsAsync(createdInvoice.Id);
        return MapToDto(invoiceWithDetails!);
    }

    public async Task UpdateInvoiceAsync(int id, UpdateInvoiceDto updateInvoiceDto)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null)
        {
            throw new ArgumentException("Invoice not found");
        }

        if (updateInvoiceDto.DueDate.HasValue)
            invoice.DueDate = updateInvoiceDto.DueDate.Value;
        if (updateInvoiceDto.TaxAmount.HasValue)
        {
            invoice.TaxAmount = updateInvoiceDto.TaxAmount.Value;
            // Recalculate total
            invoice.TotalAmount = invoice.SubTotal + invoice.TaxAmount - invoice.DiscountAmount;
            UpdateInvoiceStatus(invoice);
        }
        if (updateInvoiceDto.DiscountAmount.HasValue)
        {
            invoice.DiscountAmount = updateInvoiceDto.DiscountAmount.Value;
            // Recalculate total
            invoice.TotalAmount = invoice.SubTotal + invoice.TaxAmount - invoice.DiscountAmount;
            UpdateInvoiceStatus(invoice);
        }
        if (updateInvoiceDto.Notes != null)
            invoice.Notes = updateInvoiceDto.Notes;
        if (!string.IsNullOrEmpty(updateInvoiceDto.Status))
            invoice.Status = updateInvoiceDto.Status;

        invoice.UpdatedAt = DateTime.UtcNow;

        await _invoiceRepository.UpdateAsync(invoice);
        await _auditService.WriteAsync("system", "Admin", "Update", "Invoice", invoice.Id.ToString(), "Updated fields");
    }

    public async Task DeleteInvoiceAsync(int id)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null)
        {
            throw new ArgumentException("Invoice not found");
        }

        // Check if invoice has payments
        if (invoice.Payments.Any())
        {
            throw new InvalidOperationException("Cannot delete invoice with existing payments. Cancel the invoice instead.");
        }

        await _invoiceRepository.DeleteAsync(invoice);
        await _auditService.WriteAsync("system", "Admin", "Delete", "Invoice", invoice.Id.ToString(), "Deleted");
    }

    public async Task<string> GenerateInvoiceNumberAsync()
    {
        return await _invoiceRepository.GenerateNextInvoiceNumberAsync();
    }

    public async Task<byte[]> GenerateInvoicePdfAsync(int invoiceId)
    {
        var invoice = await _invoiceRepository.GetInvoiceWithDetailsAsync(invoiceId);
        if (invoice == null)
        {
            throw new ArgumentException("Invoice not found");
        }

        // TODO: Implement PDF generation using a library like QuestPDF, iTextSharp, or similar
        // For now, return a simple text representation
        var invoiceText = $@"
INVOICE
Invoice Number: {invoice.InvoiceNumber}
Date: {invoice.InvoiceDate:yyyy-MM-dd}
Due Date: {invoice.DueDate:yyyy-MM-dd}

Patient: {invoice.Patient?.User?.FirstName} {invoice.Patient?.User?.LastName}

Items:
{string.Join("\n", invoice.InvoiceItems.Select(item => $"{item.Description} - Qty: {item.Quantity} x ${item.UnitPrice} = ${item.TotalPrice}"))}

Subtotal: ${invoice.SubTotal}
Tax: ${invoice.TaxAmount}
Discount: ${invoice.DiscountAmount}
Total: ${invoice.TotalAmount}
Paid: ${invoice.PaidAmount}
Balance: ${invoice.BalanceAmount}

Status: {invoice.Status}
";

        return System.Text.Encoding.UTF8.GetBytes(invoiceText);
    }

    // Payment methods
    public async Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto createPaymentDto)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(createPaymentDto.InvoiceId);
        if (invoice == null)
        {
            throw new ArgumentException("Invoice not found");
        }

        // Validate user if provided
        if (createPaymentDto.ProcessedByUserId.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(createPaymentDto.ProcessedByUserId.Value);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }
        }

        // Generate payment number
        var paymentNumber = await _paymentRepository.GenerateNextPaymentNumberAsync();

        var payment = new Payment
        {
            PaymentNumber = paymentNumber,
            PaymentDate = createPaymentDto.PaymentDate,
            Amount = createPaymentDto.Amount,
            PaymentMethod = createPaymentDto.PaymentMethod,
            TransactionReference = createPaymentDto.TransactionReference,
            Notes = createPaymentDto.Notes,
            Status = createPaymentDto.Status ?? "Completed",
            InvoiceId = createPaymentDto.InvoiceId,
            ProcessedByUserId = createPaymentDto.ProcessedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        var createdPayment = await _paymentRepository.AddAsync(payment);

        // Update invoice paid amount and status
        var invoiceWithPayments = await _invoiceRepository.GetInvoiceWithDetailsAsync(createPaymentDto.InvoiceId);
        if (invoiceWithPayments != null)
        {
            invoiceWithPayments.PaidAmount = invoiceWithPayments.Payments.Sum(p => p.Amount);
            UpdateInvoiceStatus(invoiceWithPayments);
            invoiceWithPayments.UpdatedAt = DateTime.UtcNow;
            await _invoiceRepository.UpdateAsync(invoiceWithPayments);
        }

        await _auditService.WriteAsync(
            createPaymentDto.ProcessedByUserId?.ToString() ?? "system",
            "Admin",
            "Create",
            "Payment",
            createdPayment.Id.ToString(),
            $"PaymentNumber={paymentNumber}, InvoiceId={createPaymentDto.InvoiceId}, Amount={createPaymentDto.Amount}"
        );

        var paymentWithDetails = await _paymentRepository.GetPaymentWithDetailsAsync(createdPayment.Id);
        return MapToPaymentDto(paymentWithDetails!);
    }

    public async Task UpdatePaymentAsync(int id, UpdatePaymentDto updatePaymentDto)
    {
        var payment = await _paymentRepository.GetByIdAsync(id);
        if (payment == null)
        {
            throw new ArgumentException("Payment not found");
        }

        if (updatePaymentDto.PaymentDate.HasValue)
            payment.PaymentDate = updatePaymentDto.PaymentDate.Value;
        if (updatePaymentDto.Amount.HasValue)
            payment.Amount = updatePaymentDto.Amount.Value;
        if (!string.IsNullOrEmpty(updatePaymentDto.PaymentMethod))
            payment.PaymentMethod = updatePaymentDto.PaymentMethod;
        if (updatePaymentDto.TransactionReference != null)
            payment.TransactionReference = updatePaymentDto.TransactionReference;
        if (updatePaymentDto.Notes != null)
            payment.Notes = updatePaymentDto.Notes;
        if (!string.IsNullOrEmpty(updatePaymentDto.Status))
            payment.Status = updatePaymentDto.Status;

        await _paymentRepository.UpdateAsync(payment);

        // Update invoice paid amount and status
        var invoice = await _invoiceRepository.GetInvoiceWithDetailsAsync(payment.InvoiceId);
        if (invoice != null)
        {
            invoice.PaidAmount = invoice.Payments.Sum(p => p.Amount);
            UpdateInvoiceStatus(invoice);
            invoice.UpdatedAt = DateTime.UtcNow;
            await _invoiceRepository.UpdateAsync(invoice);
        }

        await _auditService.WriteAsync("system", "Admin", "Update", "Payment", payment.Id.ToString(), "Updated fields");
    }

    public async Task DeletePaymentAsync(int id)
    {
        var payment = await _paymentRepository.GetByIdAsync(id);
        if (payment == null)
        {
            throw new ArgumentException("Payment not found");
        }

        var invoiceId = payment.InvoiceId;
        await _paymentRepository.DeleteAsync(payment);

        // Update invoice paid amount and status
        var invoice = await _invoiceRepository.GetInvoiceWithDetailsAsync(invoiceId);
        if (invoice != null)
        {
            invoice.PaidAmount = invoice.Payments.Sum(p => p.Amount);
            UpdateInvoiceStatus(invoice);
            invoice.UpdatedAt = DateTime.UtcNow;
            await _invoiceRepository.UpdateAsync(invoice);
        }

        await _auditService.WriteAsync("system", "Admin", "Delete", "Payment", payment.Id.ToString(), "Deleted");
    }

    public async Task<IEnumerable<PaymentDto>> GetPaymentsByInvoiceAsync(int invoiceId)
    {
        var payments = await _paymentRepository.GetPaymentsByInvoiceAsync(invoiceId);
        return payments.Select(MapToPaymentDto);
    }

    public async Task<PaymentDto?> GetPaymentByIdAsync(int id)
    {
        var payment = await _paymentRepository.GetPaymentWithDetailsAsync(id);
        return payment != null ? MapToPaymentDto(payment) : null;
    }

    private static void UpdateInvoiceStatus(Invoice invoice)
    {
        if (invoice.TotalAmount <= 0)
        {
            invoice.Status = "Paid";
        }
        else if (invoice.PaidAmount >= invoice.TotalAmount)
        {
            invoice.Status = "Paid";
        }
        else if (invoice.PaidAmount > 0)
        {
            invoice.Status = "PartiallyPaid";
        }
        else if (invoice.DueDate < DateTime.UtcNow.Date)
        {
            invoice.Status = "Overdue";
        }
        else
        {
            invoice.Status = "Pending";
        }
    }

    private static InvoiceDto MapToDto(Invoice invoice) => new()
    {
        Id = invoice.Id,
        InvoiceNumber = invoice.InvoiceNumber,
        InvoiceDate = invoice.InvoiceDate,
        DueDate = invoice.DueDate,
        SubTotal = invoice.SubTotal,
        TaxAmount = invoice.TaxAmount,
        DiscountAmount = invoice.DiscountAmount,
        TotalAmount = invoice.TotalAmount,
        PaidAmount = invoice.PaidAmount,
        BalanceAmount = invoice.BalanceAmount,
        Status = invoice.Status,
        Notes = invoice.Notes,
        CreatedAt = invoice.CreatedAt,
        UpdatedAt = invoice.UpdatedAt,
        PatientId = invoice.PatientId,
        PatientName = $"{invoice.Patient?.User?.FirstName} {invoice.Patient?.User?.LastName}".Trim(),
        AppointmentId = invoice.AppointmentId,
        CreatedByUserId = invoice.CreatedByUserId,
        CreatedByUserName = invoice.CreatedByUser != null
            ? $"{invoice.CreatedByUser.FirstName} {invoice.CreatedByUser.LastName}".Trim()
            : null,
        InvoiceItems = invoice.InvoiceItems.Select(MapToItemDto).ToList(),
        Payments = invoice.Payments.Select(MapToPaymentDto).ToList()
    };

    private static InvoiceItemDto MapToItemDto(InvoiceItem item) => new()
    {
        Id = item.Id,
        Description = item.Description,
        Quantity = item.Quantity,
        UnitPrice = item.UnitPrice,
        TotalPrice = item.TotalPrice,
        ItemType = item.ItemType,
        RelatedEntityId = item.RelatedEntityId
    };

    private static PaymentDto MapToPaymentDto(Payment payment) => new()
    {
        Id = payment.Id,
        PaymentNumber = payment.PaymentNumber,
        PaymentDate = payment.PaymentDate,
        Amount = payment.Amount,
        PaymentMethod = payment.PaymentMethod,
        TransactionReference = payment.TransactionReference,
        Notes = payment.Notes,
        Status = payment.Status,
        CreatedAt = payment.CreatedAt,
        InvoiceId = payment.InvoiceId,
        ProcessedByUserId = payment.ProcessedByUserId,
        ProcessedByUserName = payment.ProcessedByUser != null
            ? $"{payment.ProcessedByUser.FirstName} {payment.ProcessedByUser.LastName}".Trim()
            : null
    };
}

