namespace EHosp.Domain.Entities;

public class LabTest
{
    public int Id { get; set; }
    public DateTime OrderedDate { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedDate { get; set; }
    public string TestName { get; set; } = string.Empty;
    public string TestType { get; set; } = string.Empty; // e.g., "Blood Test", "X-Ray", "CT Scan", "MRI", "Ultrasound"
    public string? TestCode { get; set; } // Lab test code/identifier
    public string Status { get; set; } = "Ordered"; // Ordered, In Progress, Completed, Cancelled
    public string? Results { get; set; } // Text results
    public string? Notes { get; set; }
    public string? FilePath { get; set; } // Path to uploaded file/report
    public string? FileName { get; set; } // Original filename
    public string? FileContentType { get; set; } // MIME type
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public int PatientId { get; set; }
    public int DoctorId { get; set; } // Doctor who ordered the test
    public int? MedicalRecordId { get; set; } // Optional link to medical record
    public int? PerformedByUserId { get; set; } // Who performed/completed the test

    // Navigation properties
    public Patient Patient { get; set; } = null!;
    public Doctor Doctor { get; set; } = null!;
    public MedicalRecord? MedicalRecord { get; set; }
    public User? PerformedBy { get; set; }
}

