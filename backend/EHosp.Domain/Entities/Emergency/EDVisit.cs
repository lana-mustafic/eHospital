namespace EHosp.Domain.Entities;

public class EDVisit
{
    public int Id { get; set; }
    public DateTime ArrivalTime { get; set; } = DateTime.UtcNow;
    public DateTime? TriageTime { get; set; }
    public DateTime? TreatmentStartTime { get; set; }
    public DateTime? DischargeTime { get; set; }
    
    // Triage Information
    public string TriagePriority { get; set; } = "Non-Urgent"; // Critical, Urgent, Non-Urgent
    public string ChiefComplaint { get; set; } = string.Empty;
    public string? TriageNotes { get; set; }
    
    // Vital Signs (can also link to VitalSigns entity)
    public decimal? BloodPressureSystolic { get; set; }
    public decimal? BloodPressureDiastolic { get; set; }
    public decimal? Temperature { get; set; }
    public decimal? HeartRate { get; set; }
    public decimal? RespiratoryRate { get; set; }
    public decimal? OxygenSaturation { get; set; }
    public decimal? PainScale { get; set; } // 0-10 pain scale
    
    // Status and Disposition
    public string Status { get; set; } = "Triage"; // Triage, Treatment, Discharged, Admitted, Transferred, Deceased
    public string? Disposition { get; set; } // Admit, Discharge, Transfer, Observation, AMA (Against Medical Advice)
    public string? DispositionNotes { get; set; }
    
    // Treatment Information
    public string? TreatmentNotes { get; set; }
    public string? Diagnosis { get; set; }
    public string? MedicationsGiven { get; set; }
    public string? ProceduresPerformed { get; set; }
    
    // Wait Times (in minutes)
    public int? WaitTimeToTriage { get; set; }
    public int? WaitTimeToTreatment { get; set; }
    public int? TotalEDStayTime { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Foreign Keys
    public int PatientId { get; set; }
    public int? TriageNurseId { get; set; } // Nurse who performed triage
    public int? AssignedDoctorId { get; set; } // Doctor assigned to treat
    public int? TreatedByDoctorId { get; set; } // Doctor who actually treated
    
    // Navigation Properties
    public Patient Patient { get; set; } = null!;
    public User? TriageNurse { get; set; }
    public Doctor? AssignedDoctor { get; set; }
    public Doctor? TreatedByDoctor { get; set; }
}

