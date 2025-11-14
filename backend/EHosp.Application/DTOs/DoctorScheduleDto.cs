using System.ComponentModel.DataAnnotations;

namespace EHosp.Application.DTOs
{
    public class DoctorScheduleDto
    {
        public int Id { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsAvailable { get; set; }
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorSpecialization { get; set; } = string.Empty;
    }

    public class CreateDoctorScheduleDto
    {
        [Required]
        [Range(0, 6)]
        public DayOfWeek DayOfWeek { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        public bool IsAvailable { get; set; } = true;

        [Range(1, int.MaxValue)]
        public int DoctorId { get; set; }
    }

    public class UpdateDoctorScheduleDto
    {
        [Range(0, 6)]
        public DayOfWeek? DayOfWeek { get; set; }

        public TimeSpan? StartTime { get; set; }

        public TimeSpan? EndTime { get; set; }

        public bool? IsAvailable { get; set; }
    }
}

