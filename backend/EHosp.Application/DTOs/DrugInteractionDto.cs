using System.ComponentModel.DataAnnotations;

namespace EHosp.Application.DTOs;

public class DrugInteractionDto
{
    public int Id { get; set; }
    public int Medication1Id { get; set; }
    public string Medication1Name { get; set; } = string.Empty;
    public int Medication2Id { get; set; }
    public string Medication2Name { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ClinicalSignificance { get; set; } = string.Empty;
    public string Management { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class CreateDrugInteractionDto
{
    [Required]
    [Range(1, int.MaxValue)]
    public int Medication1Id { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Medication2Id { get; set; }

    [Required]
    [StringLength(50)]
    public string Severity { get; set; } = string.Empty;

    [Required]
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [StringLength(500)]
    public string ClinicalSignificance { get; set; } = string.Empty;

    [StringLength(1000)]
    public string Management { get; set; } = string.Empty;
}

public class UpdateDrugInteractionDto
{
    [StringLength(50)]
    public string? Severity { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(500)]
    public string? ClinicalSignificance { get; set; }

    [StringLength(1000)]
    public string? Management { get; set; }

    public bool? IsActive { get; set; }
}

