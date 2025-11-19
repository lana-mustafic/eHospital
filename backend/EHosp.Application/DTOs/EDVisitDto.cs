using System.ComponentModel.DataAnnotations;

namespace EHosp.Application.DTOs;

public class EDVisitDto
{
    public int Id { get; set; }
    public DateTime ArrivalTime { get; set; }
    public DateTime? TriageTime { get; set; }
    public DateTime? TreatmentStartTime { get; set; }
    public DateTime? DischargeTime { get; set; }
    
    // Triage Information
    public string TriagePriority { get; set; } = string.Empty;
    public string ChiefComplaint { get; set; } = string.Empty;
    public string? TriageNotes { get; set; }
    
    // Vital Signs
    public decimal? BloodPressureSystolic { get; set; }
    public decimal? BloodPressureDiastolic { get; set; }
    public decimal? Temperature { get; set; }
    public decimal? HeartRate { get; set; }
    public decimal? RespiratoryRate { get; set; }
    public decimal? OxygenSaturation { get; set; }
    public decimal? PainScale { get; set; }
    
    // Status and Disposition
    public string Status { get; set; } = string.Empty;
    public string? Disposition { get; set; }
    public string? DispositionNotes { get; set; }
    
    // Treatment Information
    public string? TreatmentNotes { get; set; }
    public string? Diagnosis { get; set; }
    public string? MedicationsGiven { get; set; }
    public string? ProceduresPerformed { get; set; }
    
    // Wait Times
    public int? WaitTimeToTriage { get; set; }
    public int? WaitTimeToTreatment { get; set; }
    public int? TotalEDStayTime { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Patient Information
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientAge { get; set; } = string.Empty;
    public string PatientGender { get; set; } = string.Empty;
    public string PatientBloodType { get; set; } = string.Empty;
    
    // Staff Information
    public int? TriageNurseId { get; set; }
    public string? TriageNurseName { get; set; }
    public int? AssignedDoctorId { get; set; }
    public string? AssignedDoctorName { get; set; }
    public int? TreatedByDoctorId { get; set; }
    public string? TreatedByDoctorName { get; set; }
}

public class CreateEDVisitDto
{
    [Required]
    public int PatientId { get; set; }
    
    [Required]
    [StringLength(500)]
    public string ChiefComplaint { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string TriagePriority { get; set; } = "Non-Urgent";
    
    [StringLength(1000)]
    public string? TriageNotes { get; set; }
    
    // Vital Signs
    public decimal? BloodPressureSystolic { get; set; }
    public decimal? BloodPressureDiastolic { get; set; }
    public decimal? Temperature { get; set; }
    public decimal? HeartRate { get; set; }
    public decimal? RespiratoryRate { get; set; }
    public decimal? OxygenSaturation { get; set; }
    public decimal? PainScale { get; set; }
    
    public int? TriageNurseId { get; set; }
    public int? AssignedDoctorId { get; set; }
}

public class UpdateEDVisitDto
{
    [StringLength(50)]
    public string? TriagePriority { get; set; }
    
    [StringLength(500)]
    public string? ChiefComplaint { get; set; }
    
    [StringLength(1000)]
    public string? TriageNotes { get; set; }
    
    // Vital Signs
    public decimal? BloodPressureSystolic { get; set; }
    public decimal? BloodPressureDiastolic { get; set; }
    public decimal? Temperature { get; set; }
    public decimal? HeartRate { get; set; }
    public decimal? RespiratoryRate { get; set; }
    public decimal? OxygenSaturation { get; set; }
    public decimal? PainScale { get; set; }
    
    [StringLength(50)]
    public string? Status { get; set; }
    
    [StringLength(50)]
    public string? Disposition { get; set; }
    
    [StringLength(2000)]
    public string? DispositionNotes { get; set; }
    
    [StringLength(2000)]
    public string? TreatmentNotes { get; set; }
    
    [StringLength(500)]
    public string? Diagnosis { get; set; }
    
    [StringLength(1000)]
    public string? MedicationsGiven { get; set; }
    
    [StringLength(1000)]
    public string? ProceduresPerformed { get; set; }
    
    public int? AssignedDoctorId { get; set; }
    public int? TreatedByDoctorId { get; set; }
}

public class TriageDto
{
    [Required]
    public int EDVisitId { get; set; }
    
    [Required]
    [StringLength(50)]
    public string TriagePriority { get; set; } = string.Empty;
    
    [Required]
    [StringLength(500)]
    public string ChiefComplaint { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string? TriageNotes { get; set; }
    
    // Vital Signs
    public decimal? BloodPressureSystolic { get; set; }
    public decimal? BloodPressureDiastolic { get; set; }
    public decimal? Temperature { get; set; }
    public decimal? HeartRate { get; set; }
    public decimal? RespiratoryRate { get; set; }
    public decimal? OxygenSaturation { get; set; }
    public decimal? PainScale { get; set; }
    
    public int? TriageNurseId { get; set; }
    public int? AssignedDoctorId { get; set; }
}

