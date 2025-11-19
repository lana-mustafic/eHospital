using System.ComponentModel.DataAnnotations;

namespace EHosp.Application.DTOs;

public class QueueDto
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public int DoctorId { get; set; }
    public int PatientId { get; set; }
    public int QueueNumber { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime QueueDate { get; set; }
    public DateTime? CalledAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int EstimatedWaitTimeMinutes { get; set; }
    public int ActualWaitTimeMinutes { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Additional display properties
    public string PatientName { get; set; } = string.Empty;
    public string DoctorName { get; set; } = string.Empty;
    public string DoctorSpecialization { get; set; } = string.Empty;
    public string AppointmentReason { get; set; } = string.Empty;
    public string AppointmentTime { get; set; } = string.Empty;
}

public class CreateQueueDto
{
    [Required]
    [Range(1, int.MaxValue)]
    public int AppointmentId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int DoctorId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int PatientId { get; set; }

    [Required]
    public DateTime QueueDate { get; set; }
}

public class UpdateQueueStatusDto
{
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Notes { get; set; }
}

public class ReorderQueueDto
{
    [Required]
    public List<int> QueueIds { get; set; } = new();
}

