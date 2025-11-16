using System.ComponentModel.DataAnnotations;

namespace EHosp.Application.DTOs
{
    public class AppointmentDto
    {
        public int Id { get; set; }
        public DateTime AppointmentDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
    }
    public class CreateAppointmentDto
    {
        [Required]
        public DateTime AppointmentDate { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [Required]
        [StringLength(500)]
        public string Reason { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int PatientId { get; set; }

        [Range(1, int.MaxValue)]
        public int DoctorId { get; set; }
    }

    public class UpdateAppointmentDto
    {
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Notes { get; set; }
    }

    public class RescheduleAppointmentDto
    {
        [Required]
        public DateTime AppointmentDate { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }
    }
}
    