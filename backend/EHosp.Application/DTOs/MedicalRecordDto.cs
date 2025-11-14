using System.ComponentModel.DataAnnotations;

namespace EHosp.Application.DTOs
{
    public class MedicalRecordDto
    {
        public int Id { get; set; }
        public DateTime VisitDate { get; set; }
        public string Symptoms { get; set; } = string.Empty;
        public string Treatment { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
        public int? DiagnosisId { get; set; }
        public string? DiagnosisCode { get; set; }
        public string? DiagnosisName { get; set; }
        public int PrescriptionCount { get; set; }
    }

    public class CreateMedicalRecordDto
    {
        [Required]
        public DateTime VisitDate { get; set; }

        [Required]
        [StringLength(1000)]
        public string Symptoms { get; set; } = string.Empty;

        [Required]
        [StringLength(1000)]
        public string Treatment { get; set; } = string.Empty;

        [StringLength(2000)]
        public string Notes { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int PatientId { get; set; }

        [Range(1, int.MaxValue)]
        public int DoctorId { get; set; }

        public int? DiagnosisId { get; set; }
    }

    public class UpdateMedicalRecordDto
    {
        public DateTime? VisitDate { get; set; }

        [StringLength(1000)]
        public string? Symptoms { get; set; }

        [StringLength(1000)]
        public string? Treatment { get; set; }

        [StringLength(2000)]
        public string? Notes { get; set; }

        public int? DiagnosisId { get; set; }
    }
}

