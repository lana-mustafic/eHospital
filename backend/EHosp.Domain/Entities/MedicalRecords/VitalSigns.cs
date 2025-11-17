namespace EHosp.Domain.Entities;

public class VitalSigns
{
    public int Id { get; set; }
    public DateTime RecordedDate { get; set; } = DateTime.UtcNow;
    
    // Vital signs measurements
    public decimal? BloodPressureSystolic { get; set; } // mmHg
    public decimal? BloodPressureDiastolic { get; set; } // mmHg
    public decimal? Temperature { get; set; } // Celsius or Fahrenheit
    public decimal? HeartRate { get; set; } // bpm
    public decimal? RespiratoryRate { get; set; } // breaths per minute
    public decimal? Weight { get; set; } // kg
    public decimal? Height { get; set; } // cm
    public decimal? OxygenSaturation { get; set; } // SpO2 percentage
    public decimal? BloodGlucose { get; set; } // mg/dL
    
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public int PatientId { get; set; }
    public int? MedicalRecordId { get; set; } // Optional link to medical record
    public int? RecordedByUserId { get; set; } // Who recorded these vitals

    // Navigation properties
    public Patient Patient { get; set; } = null!;
    public MedicalRecord? MedicalRecord { get; set; }
    public User? RecordedBy { get; set; }
}

