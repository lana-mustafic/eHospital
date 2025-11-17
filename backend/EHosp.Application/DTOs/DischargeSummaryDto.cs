namespace EHosp.Application.DTOs;

public class DischargeSummaryDto
{
    public int Id { get; set; }
    public string DischargeNumber { get; set; } = string.Empty;
    public DateTime DischargeDate { get; set; }
    public DateTime? AdmissionDate { get; set; }
    public string DischargeType { get; set; } = string.Empty;
    public string ConditionOnDischarge { get; set; } = string.Empty;
    
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
    public string WarningSigns { get; set; } = string.Empty;
    
    // Follow-up
    public DateTime? FollowUpDate { get; set; }
    public int? FollowUpDoctorId { get; set; }
    public string? FollowUpDoctorName { get; set; }
    public string FollowUpInstructions { get; set; } = string.Empty;
    
    // Additional Information
    public string AdditionalNotes { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? FinalizedAt { get; set; }
    
    // Foreign keys
    public int PatientId { get; set; }
    public string? PatientName { get; set; }
    public int DischargingDoctorId { get; set; }
    public string? DischargingDoctorName { get; set; }
    public int? MedicalRecordId { get; set; }
    public int? AppointmentId { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
    
    // Related data
    public List<DischargeMedicationDto> DischargeMedications { get; set; } = new();
}

public class DischargeMedicationDto
{
    public int PrescriptionId { get; set; }
    public string MedicationName { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
}

public class CreateDischargeSummaryDto
{
    public DateTime DischargeDate { get; set; }
    public DateTime? AdmissionDate { get; set; }
    public string DischargeType { get; set; } = string.Empty;
    public string ConditionOnDischarge { get; set; } = string.Empty;
    
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
    public string WarningSigns { get; set; } = string.Empty;
    
    // Follow-up
    public DateTime? FollowUpDate { get; set; }
    public int? FollowUpDoctorId { get; set; }
    public string FollowUpInstructions { get; set; } = string.Empty;
    
    // Additional Information
    public string AdditionalNotes { get; set; } = string.Empty;
    
    // Foreign keys
    public int PatientId { get; set; }
    public int DischargingDoctorId { get; set; }
    public int? MedicalRecordId { get; set; }
    public int? AppointmentId { get; set; }
    public int? CreatedByUserId { get; set; }
    
    // Medications to include
    public List<int> PrescriptionIds { get; set; } = new();
}

public class UpdateDischargeSummaryDto
{
    public DateTime? DischargeDate { get; set; }
    public DateTime? AdmissionDate { get; set; }
    public string? DischargeType { get; set; }
    public string? ConditionOnDischarge { get; set; }
    
    // Clinical Summary
    public string? ChiefComplaint { get; set; }
    public string? HistoryOfPresentIllness { get; set; }
    public string? HospitalCourse { get; set; }
    public string? ProceduresPerformed { get; set; }
    public string? DischargeDiagnosis { get; set; }
    
    // Post-Discharge Instructions
    public string? PostDischargeInstructions { get; set; }
    public string? ActivityRestrictions { get; set; }
    public string? DietInstructions { get; set; }
    public string? MedicationInstructions { get; set; }
    public string? WarningSigns { get; set; }
    
    // Follow-up
    public DateTime? FollowUpDate { get; set; }
    public int? FollowUpDoctorId { get; set; }
    public string? FollowUpInstructions { get; set; }
    
    // Additional Information
    public string? AdditionalNotes { get; set; }
    public string? Status { get; set; }
}

