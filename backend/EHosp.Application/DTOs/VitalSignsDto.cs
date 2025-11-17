namespace EHosp.Application.DTOs;

public class VitalSignsDto
{
    public int Id { get; set; }
    public DateTime RecordedDate { get; set; }
    public decimal? BloodPressureSystolic { get; set; }
    public decimal? BloodPressureDiastolic { get; set; }
    public decimal? Temperature { get; set; }
    public decimal? HeartRate { get; set; }
    public decimal? RespiratoryRate { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public decimal? OxygenSaturation { get; set; }
    public decimal? BloodGlucose { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public int PatientId { get; set; }
    public string? PatientName { get; set; }
    public int? MedicalRecordId { get; set; }
    public int? RecordedByUserId { get; set; }
    public string? RecordedByName { get; set; }
    
    // Calculated fields
    public string? BloodPressure => BloodPressureSystolic.HasValue && BloodPressureDiastolic.HasValue
        ? $"{BloodPressureSystolic}/{BloodPressureDiastolic}"
        : null;
    
    public decimal? BMIIfAvailable => Weight.HasValue && Height.HasValue && Height > 0
        ? Math.Round((Weight.Value / ((Height.Value / 100) * (Height.Value / 100))), 2)
        : null;
}

public class CreateVitalSignsDto
{
    public DateTime RecordedDate { get; set; } = DateTime.UtcNow;
    public decimal? BloodPressureSystolic { get; set; }
    public decimal? BloodPressureDiastolic { get; set; }
    public decimal? Temperature { get; set; }
    public decimal? HeartRate { get; set; }
    public decimal? RespiratoryRate { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public decimal? OxygenSaturation { get; set; }
    public decimal? BloodGlucose { get; set; }
    public string? Notes { get; set; }
    public int PatientId { get; set; }
    public int? MedicalRecordId { get; set; }
}

public class UpdateVitalSignsDto
{
    public DateTime? RecordedDate { get; set; }
    public decimal? BloodPressureSystolic { get; set; }
    public decimal? BloodPressureDiastolic { get; set; }
    public decimal? Temperature { get; set; }
    public decimal? HeartRate { get; set; }
    public decimal? RespiratoryRate { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public decimal? OxygenSaturation { get; set; }
    public decimal? BloodGlucose { get; set; }
    public string? Notes { get; set; }
    public int? MedicalRecordId { get; set; }
}

