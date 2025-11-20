using System.ComponentModel.DataAnnotations;

namespace EHosp.Application.DTOs
{
    public class PrescriptionDto
    {
        public int Id { get; set; }
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public int Duration { get; set; }
        public string Instructions { get; set; } = string.Empty;
        public DateTime PrescribedDate { get; set; }
        public int MedicalRecordId { get; set; }
        public int MedicationId { get; set; }
        public string MedicationName { get; set; } = string.Empty;
        public string MedicationForm { get; set; } = string.Empty;
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        
        // Prescription processing workflow
        public string Status { get; set; } = "Pending";
        public int? VerifiedByUserId { get; set; }
        public string? VerifiedByUserName { get; set; }
        public int? DispensedByUserId { get; set; }
        public string? DispensedByUserName { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public DateTime? DispensedAt { get; set; }
        public bool AllergyChecked { get; set; }
        public bool InteractionChecked { get; set; }
        public string? PharmacistNotes { get; set; }
        public string? AllergyAlert { get; set; }
        public string? InteractionAlert { get; set; }
    }

    public class CreatePrescriptionDto
    {
        [Required]
        [StringLength(100)]
        public string Dosage { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Frequency { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue)]
        public int Duration { get; set; }

        [StringLength(500)]
        public string Instructions { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int MedicalRecordId { get; set; }

        [Range(1, int.MaxValue)]
        public int MedicationId { get; set; }

        [Range(1, int.MaxValue)]
        public int DoctorId { get; set; }
    }

    public class UpdatePrescriptionDto
    {
        [StringLength(100)]
        public string? Dosage { get; set; }

        [StringLength(50)]
        public string? Frequency { get; set; }

        [Range(1, int.MaxValue)]
        public int? Duration { get; set; }

        [StringLength(500)]
        public string? Instructions { get; set; }
    }
}

