using System.ComponentModel.DataAnnotations;

namespace EHosp.Application.DTOs
{
    public class PatientDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string EmergencyContact { get; set; } = string.Empty;
        public string BloodType { get; set; } = string.Empty;
    }

    public class CreatePatientDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        public string Gender { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string EmergencyContact { get; set; } = string.Empty;

        public string BloodType { get; set; } = string.Empty;
    }

    public class UpdatePatientDto
    {
        [StringLength(100)]
        public string? FirstName { get; set; }

        [StringLength(100)]
        public string? LastName { get; set; }

        [Phone]
        public string? PhoneNumber { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string? Gender { get; set; }

        public string? Address { get; set; }

        public string? EmergencyContact { get; set; }

        public string? BloodType { get; set; }
    }
}

