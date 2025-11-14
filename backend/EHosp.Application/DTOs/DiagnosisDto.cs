using System.ComponentModel.DataAnnotations;

namespace EHosp.Application.DTOs
{
    public class DiagnosisDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int MedicalRecordCount { get; set; }
    }

    public class CreateDiagnosisDto
    {
        [Required]
        [StringLength(20)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateDiagnosisDto
    {
        [StringLength(20)]
        public string? Code { get; set; }

        [StringLength(200)]
        public string? Name { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }
    }
}

