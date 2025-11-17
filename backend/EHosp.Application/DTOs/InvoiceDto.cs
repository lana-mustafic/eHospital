namespace EHosp.Application.DTOs;

public class InvoiceDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal BalanceAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    public int PatientId { get; set; }
    public string? PatientName { get; set; }
    public int? AppointmentId { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
    
    public List<InvoiceItemDto> InvoiceItems { get; set; } = new();
    public List<PaymentDto> Payments { get; set; } = new();
}

public class InvoiceItemDto
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string? ItemType { get; set; }
    public int? RelatedEntityId { get; set; }
}

public class PaymentDto
{
    public int Id { get; set; }
    public string PaymentNumber { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? TransactionReference { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int InvoiceId { get; set; }
    public int? ProcessedByUserId { get; set; }
    public string? ProcessedByUserName { get; set; }
}

public class CreateInvoiceDto
{
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public decimal TaxAmount { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;
    public string? Notes { get; set; }
    public int PatientId { get; set; }
    public int? AppointmentId { get; set; }
    public int? CreatedByUserId { get; set; }
    public List<CreateInvoiceItemDto> InvoiceItems { get; set; } = new();
}

public class CreateInvoiceItemDto
{
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public string? ItemType { get; set; }
    public int? RelatedEntityId { get; set; }
}

public class UpdateInvoiceDto
{
    public DateTime? DueDate { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public string? Notes { get; set; }
    public string? Status { get; set; }
}

public class CreatePaymentDto
{
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? TransactionReference { get; set; }
    public string? Notes { get; set; }
    public string? Status { get; set; }
    public int InvoiceId { get; set; }
    public int? ProcessedByUserId { get; set; }
}

public class UpdatePaymentDto
{
    public DateTime? PaymentDate { get; set; }
    public decimal? Amount { get; set; }
    public string? PaymentMethod { get; set; }
    public string? TransactionReference { get; set; }
    public string? Notes { get; set; }
    public string? Status { get; set; }
}

