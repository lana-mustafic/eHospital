using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<DoctorService> _logger;

        public DoctorService(IDoctorRepository doctorRepository, IUserRepository userRepository, ILogger<DoctorService> logger)
        {
            _doctorRepository = doctorRepository;
            _userRepository = userRepository;
            _logger = logger;
        }

        public async Task<DoctorDto?> GetDoctorByIdAsync(int id)
        {
            var doctor = await _doctorRepository.GetDoctorWithDetailsAsync(id);
            return doctor != null ? MapToDto(doctor) : null;
        }

        public async Task<IEnumerable<DoctorDto>> GetAllDoctorsAsync()
        {
            var doctors = await _doctorRepository.GetAllAsync();
            return doctors.Select(MapToDto);
        }

        public async Task<IEnumerable<DoctorDto>> GetDoctorsByDepartmentAsync(int departmentId)
        {
            var doctors = await _doctorRepository.GetDoctorsByDepartmentAsync(departmentId);
            return doctors.Select(MapToDto);
        }

        public async Task<IEnumerable<DoctorDto>> GetDoctorsBySpecializationAsync(string specialization)
        {
            var doctors = await _doctorRepository.GetDoctorsBySpecializationAsync(specialization);
            return doctors.Select(MapToDto);
        }

        public async Task<DoctorDto> CreateDoctorAsync(CreateDoctorDto createDoctorDto)
        {
            // Check if user already exists
            if (await _userRepository.UserExistsAsync(createDoctorDto.Email))
            {
                throw new ArgumentException("User with this email already exists");
            }

            // Create user first
            var user = new User
            {
                Email = createDoctorDto.Email,
                PasswordHash = createDoctorDto.Password, // Temporary - will hash later
                FirstName = createDoctorDto.FirstName,
                LastName = createDoctorDto.LastName,
                PhoneNumber = createDoctorDto.PhoneNumber,
                RoleId = 2, // Doctor role
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var createdUser = await _userRepository.AddAsync(user);

            // Create doctor
            var doctor = new Doctor
            {
                UserId = createdUser.Id,
                Specialization = createDoctorDto.Specialization,
                LicenseNumber = createDoctorDto.LicenseNumber,
                YearsOfExperience = createDoctorDto.YearsOfExperience,
                DepartmentId = createDoctorDto.DepartmentId
            };

            var createdDoctor = await _doctorRepository.AddAsync(doctor);
            return MapToDto(createdDoctor);
        }

        private static DoctorDto MapToDto(Doctor doctor) => new()
        {
            Id = doctor.Id,
            Specialization = doctor.Specialization,
            LicenseNumber = doctor.LicenseNumber,
            YearsOfExperience = doctor.YearsOfExperience,
            FirstName = doctor.User?.FirstName ?? string.Empty,
            LastName = doctor.User?.LastName ?? string.Empty,
            Email = doctor.User?.Email ?? string.Empty,
            DepartmentName = doctor.Department?.Name ?? string.Empty
        };
    }
}