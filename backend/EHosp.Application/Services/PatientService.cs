using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;
using BCrypt.Net;

namespace EHosp.Application.Services
{
    public class PatientService : IPatientService
    {
        private readonly IPatientRepository _patientRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<PatientService> _logger;

        public PatientService(IPatientRepository patientRepository, IUserRepository userRepository, ILogger<PatientService> logger)
        {
            _patientRepository = patientRepository;
            _userRepository = userRepository;
            _logger = logger;
        }

        public async Task<PatientDto?> GetPatientByIdAsync(int id)
        {
            var patient = await _patientRepository.GetPatientWithDetailsAsync(id);
            return patient != null ? MapToDto(patient) : null;
        }

        public async Task<IEnumerable<PatientDto>> GetAllPatientsAsync()
        {
            var patients = await _patientRepository.GetAllAsync();
            return patients.Select(p => MapToDto(p));
        }

        public async Task<IEnumerable<PatientDto>> GetPatientsByDoctorAsync(int doctorId)
        {
            var patients = await _patientRepository.GetPatientsByDoctorAsync(doctorId);
            return patients.Select(MapToDto);
        }

        public async Task<PatientDto> CreatePatientAsync(CreatePatientDto createPatientDto)
        {
            // Check if user already exists
            if (await _userRepository.UserExistsAsync(createPatientDto.Email))
            {
                throw new ArgumentException("User with this email already exists");
            }

            // Create user first
            var user = new User
            {
                Email = createPatientDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(createPatientDto.Password, 13),
                FirstName = createPatientDto.FirstName,
                LastName = createPatientDto.LastName,
                PhoneNumber = createPatientDto.PhoneNumber,
                RoleId = 3, // Patient role (assuming 1=Admin, 2=Doctor, 3=Patient)
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var createdUser = await _userRepository.AddAsync(user);

            // Create patient
            var patient = new Patient
            {
                UserId = createdUser.Id,
                DateOfBirth = createPatientDto.DateOfBirth,
                Gender = createPatientDto.Gender,
                Address = createPatientDto.Address,
                EmergencyContact = createPatientDto.EmergencyContact,
                BloodType = createPatientDto.BloodType
            };

            var createdPatient = await _patientRepository.AddAsync(patient);
            return MapToDto(createdPatient);
        }

        public async Task UpdatePatientAsync(int id, UpdatePatientDto updatePatientDto)
        {
            var patient = await _patientRepository.GetPatientWithDetailsAsync(id);
            if (patient == null)
            {
                throw new ArgumentException("Patient not found");
            }

            // Update user information if provided
            if (patient.User != null)
            {
                if (!string.IsNullOrEmpty(updatePatientDto.FirstName))
                    patient.User.FirstName = updatePatientDto.FirstName;
                if (!string.IsNullOrEmpty(updatePatientDto.LastName))
                    patient.User.LastName = updatePatientDto.LastName;
                if (!string.IsNullOrEmpty(updatePatientDto.PhoneNumber))
                    patient.User.PhoneNumber = updatePatientDto.PhoneNumber;
            }

            // Update patient information if provided
            if (updatePatientDto.DateOfBirth.HasValue)
                patient.DateOfBirth = updatePatientDto.DateOfBirth.Value;
            if (!string.IsNullOrEmpty(updatePatientDto.Gender))
                patient.Gender = updatePatientDto.Gender;
            if (!string.IsNullOrEmpty(updatePatientDto.Address))
                patient.Address = updatePatientDto.Address;
            if (!string.IsNullOrEmpty(updatePatientDto.EmergencyContact))
                patient.EmergencyContact = updatePatientDto.EmergencyContact;
            if (!string.IsNullOrEmpty(updatePatientDto.BloodType))
                patient.BloodType = updatePatientDto.BloodType;

            await _patientRepository.UpdateAsync(patient);
        }

        public async Task DeletePatientAsync(int id)
        {
            var patient = await _patientRepository.GetByIdAsync(id);
            if (patient != null)
            {
                await _patientRepository.DeleteAsync(patient);
            }
        }

        private static PatientDto MapToDto(Patient patient) => new()
        {
            Id = patient.Id,
            FirstName = patient.User?.FirstName ?? string.Empty,
            LastName = patient.User?.LastName ?? string.Empty,
            Email = patient.User?.Email ?? string.Empty,
            PhoneNumber = patient.User?.PhoneNumber ?? string.Empty,
            DateOfBirth = patient.DateOfBirth,
            Gender = patient.Gender,
            Address = patient.Address,
            EmergencyContact = patient.EmergencyContact,
            BloodType = patient.BloodType
        };
    }
}

