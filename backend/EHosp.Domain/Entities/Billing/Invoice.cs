namespace EHosp.Domain.Entities;

public class Invoice
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty; // Unique invoice number (e.g., INV-2024-001)
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; } = 0;
    public decimal BalanceAmount => TotalAmount - PaidAmount;
    public string Status { get; set; } = "Pending"; // Pending, PartiallyPaid, Paid, Overdue, Cancelled
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Foreign keys
    public int PatientId { get; set; }
    public int? AppointmentId { get; set; } // Optional: Link to appointment
    public int? CreatedByUserId { get; set; } // User who created the invoice

    // Navigation properties
    public Patient Patient { get; set; } = null!;
    public Appointment? Appointment { get; set; }
    public User? CreatedByUser { get; set; }
    public ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}

public class InvoiceItem
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice => Quantity * UnitPrice;
    public string? ItemType { get; set; } // Appointment, LabTest, Medication, Procedure, Other
    public int? RelatedEntityId { get; set; } // ID of related entity (e.g., LabTest ID, Appointment ID)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign key
    public int InvoiceId { get; set; }

    // Navigation property
    public Invoice Invoice { get; set; } = null!;
}

public class Payment
{
    public int Id { get; set; }
    public string PaymentNumber { get; set; } = string.Empty; // Unique payment number (e.g., PAY-2024-001)
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty; // Cash, CreditCard, DebitCard, BankTransfer, Check, Insurance
    public string? TransactionReference { get; set; } // Transaction ID, check number, etc.
    public string? Notes { get; set; }
    public string Status { get; set; } = "Completed"; // Completed, Pending, Failed, Refunded
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? ProcessedByUserId { get; set; } // User who processed the payment

    // Foreign key
    public int InvoiceId { get; set; }

    // Navigation properties
    public Invoice Invoice { get; set; } = null!;
    public User? ProcessedByUser { get; set; }
}

