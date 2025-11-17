namespace EHosp.Domain.Entities;

public class DischargeSummary
{
    public int Id { get; set; }
    public string DischargeNumber { get; set; } = string.Empty;
    public DateTime DischargeDate { get; set; }
    public DateTime? AdmissionDate { get; set; }
    public string DischargeType { get; set; } = string.Empty; // Routine, Against Medical Advice, Transfer, Death
    public string ConditionOnDischarge { get; set; } = string.Empty; // Improved, Stable, Critical, etc.
    
    // Clinical Summary
    public string ChiefComplaint { get; set; } = string.Empty;
    public string HistoryOfPresentIllness { get; set; } = string.Empty;
    public string HospitalCourse { get; set; } = string.Empty;
    public string ProceduresPerformed { get; set; } = string.Empty;
    public string DischargeDiagnosis { get; set; } = string.Empty;
    
    // Post-Discharge Instructions
    public string PostDischargeInstructions { get; set; } = string.Empty;
    public string ActivityRestrictions { get; set; } = string.Empty;
    public string DietInstructions { get; set; } = string.Empty;
    public string MedicationInstructions { get; set; } = string.Empty;
    public string WarningSigns { get; set; } = string.Empty; // When to seek immediate care
    
    // Follow-up
    public DateTime? FollowUpDate { get; set; }
    public int? FollowUpDoctorId { get; set; }
    public string FollowUpInstructions { get; set; } = string.Empty;
    
    // Additional Information
    public string AdditionalNotes { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft"; // Draft, Finalized, Printed
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? FinalizedAt { get; set; }

    // Foreign keys
    public int PatientId { get; set; }
    public int DischargingDoctorId { get; set; }
    public int? MedicalRecordId { get; set; }
    public int? AppointmentId { get; set; }
    public int? CreatedByUserId { get; set; }

    // Navigation properties
    public Patient Patient { get; set; } = null!;
    public Doctor DischargingDoctor { get; set; } = null!;
    public Doctor? FollowUpDoctor { get; set; }
    public MedicalRecord? MedicalRecord { get; set; }
    public Appointment? Appointment { get; set; }
    public User? CreatedByUser { get; set; }
}

