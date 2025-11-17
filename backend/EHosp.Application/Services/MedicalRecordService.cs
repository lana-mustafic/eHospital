using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services
{
    public class MedicalRecordService : IMedicalRecordService
    {
        private readonly IMedicalRecordRepository _medicalRecordRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly ILogger<MedicalRecordService> _logger;
        private readonly IAuditService _auditService;

        public MedicalRecordService(
            IMedicalRecordRepository medicalRecordRepository,
            IPatientRepository patientRepository,
            IDoctorRepository doctorRepository,
            ILogger<MedicalRecordService> logger,
            IAuditService auditService)
        {
            _medicalRecordRepository = medicalRecordRepository;
            _patientRepository = patientRepository;
            _doctorRepository = doctorRepository;
            _logger = logger;
            _auditService = auditService;
        }

        public async Task<IEnumerable<MedicalRecordDto>> GetAllMedicalRecordsAsync()
        {
            var medicalRecords = await _medicalRecordRepository.GetAllMedicalRecordsWithDetailsAsync();
            return medicalRecords.Select(MapToDto);
        }

        public async Task<MedicalRecordDto?> GetMedicalRecordByIdAsync(int id)
        {
            var medicalRecord = await _medicalRecordRepository.GetMedicalRecordWithDetailsAsync(id);
            return medicalRecord != null ? MapToDto(medicalRecord) : null;
        }

        public async Task<IEnumerable<MedicalRecordDto>> GetMedicalRecordsByPatientAsync(int patientId)
        {
            var medicalRecords = await _medicalRecordRepository.GetMedicalRecordsByPatientAsync(patientId);
            return medicalRecords.Select(MapToDto);
        }

        public async Task<IEnumerable<MedicalRecordDto>> GetMedicalRecordsByDoctorAsync(int doctorId)
        {
            var medicalRecords = await _medicalRecordRepository.GetMedicalRecordsByDoctorAsync(doctorId);
            return medicalRecords.Select(MapToDto);
        }

        public async Task<IEnumerable<MedicalRecordDto>> GetMedicalRecordsByPatientAndDoctorAsync(int patientId, int doctorId)
        {
            var medicalRecords = await _medicalRecordRepository.GetMedicalRecordsByPatientAndDoctorAsync(patientId, doctorId);
            return medicalRecords.Select(MapToDto);
        }

        public async Task<MedicalRecordDto> CreateMedicalRecordAsync(CreateMedicalRecordDto createMedicalRecordDto)
        {
            // Validate patient exists
            var patient = await _patientRepository.GetByIdAsync(createMedicalRecordDto.PatientId);
            if (patient == null)
            {
                throw new ArgumentException("Patient not found");
            }

            // Validate doctor exists
            var doctor = await _doctorRepository.GetByIdAsync(createMedicalRecordDto.DoctorId);
            if (doctor == null)
            {
                throw new ArgumentException("Doctor not found");
            }

            var medicalRecord = new MedicalRecord
            {
                VisitDate = createMedicalRecordDto.VisitDate,
                Symptoms = createMedicalRecordDto.Symptoms,
                Treatment = createMedicalRecordDto.Treatment,
                Notes = createMedicalRecordDto.Notes,
                PatientId = createMedicalRecordDto.PatientId,
                DoctorId = createMedicalRecordDto.DoctorId,
                DiagnosisId = createMedicalRecordDto.DiagnosisId,
                CreatedAt = DateTime.UtcNow
            };

            var createdMedicalRecord = await _medicalRecordRepository.AddAsync(medicalRecord);
            await _auditService.WriteAsync("system", "Doctor", "Create", "MedicalRecord", createdMedicalRecord.Id.ToString(), $"PatientId={createdMedicalRecord.PatientId}");
            var medicalRecordWithDetails = await _medicalRecordRepository.GetMedicalRecordWithDetailsAsync(createdMedicalRecord.Id);
            return MapToDto(medicalRecordWithDetails!);
        }

        public async Task UpdateMedicalRecordAsync(int id, UpdateMedicalRecordDto updateMedicalRecordDto)
        {
            var medicalRecord = await _medicalRecordRepository.GetByIdAsync(id);
            if (medicalRecord == null)
            {
                throw new ArgumentException("Medical record not found");
            }

            if (updateMedicalRecordDto.VisitDate.HasValue)
                medicalRecord.VisitDate = updateMedicalRecordDto.VisitDate.Value;
            if (!string.IsNullOrEmpty(updateMedicalRecordDto.Symptoms))
                medicalRecord.Symptoms = updateMedicalRecordDto.Symptoms;
            if (!string.IsNullOrEmpty(updateMedicalRecordDto.Treatment))
                medicalRecord.Treatment = updateMedicalRecordDto.Treatment;
            if (updateMedicalRecordDto.Notes != null)
                medicalRecord.Notes = updateMedicalRecordDto.Notes;
            if (updateMedicalRecordDto.DiagnosisId.HasValue)
                medicalRecord.DiagnosisId = updateMedicalRecordDto.DiagnosisId;

            await _medicalRecordRepository.UpdateAsync(medicalRecord);
            await _auditService.WriteAsync("system", "Doctor", "Update", "MedicalRecord", medicalRecord.Id.ToString(), "Updated fields");
        }

        public async Task DeleteMedicalRecordAsync(int id)
        {
            var medicalRecord = await _medicalRecordRepository.GetByIdAsync(id);
            if (medicalRecord == null)
            {
                throw new ArgumentException("Medical record not found");
            }

            // Check if medical record has prescriptions
            var medicalRecordWithDetails = await _medicalRecordRepository.GetMedicalRecordWithDetailsAsync(id);
            if (medicalRecordWithDetails != null && medicalRecordWithDetails.Prescriptions.Any())
            {
                throw new InvalidOperationException("Cannot delete medical record with associated prescriptions. Please delete prescriptions first.");
            }

            await _medicalRecordRepository.DeleteAsync(medicalRecord);
            await _auditService.WriteAsync("system", "Doctor", "Delete", "MedicalRecord", medicalRecord.Id.ToString(), "Deleted");
        }

        private static MedicalRecordDto MapToDto(MedicalRecord medicalRecord) => new()
        {
            Id = medicalRecord.Id,
            VisitDate = medicalRecord.VisitDate,
            Symptoms = medicalRecord.Symptoms,
            Treatment = medicalRecord.Treatment,
            Notes = medicalRecord.Notes,
            CreatedAt = medicalRecord.CreatedAt,
            PatientId = medicalRecord.PatientId,
            PatientName = $"{medicalRecord.Patient?.User?.FirstName} {medicalRecord.Patient?.User?.LastName}".Trim(),
            DoctorId = medicalRecord.DoctorId,
            DoctorName = $"{medicalRecord.Doctor?.User?.FirstName} {medicalRecord.Doctor?.User?.LastName}".Trim(),
            DoctorSpecialization = medicalRecord.Doctor?.Specialization ?? string.Empty,
            DiagnosisId = medicalRecord.DiagnosisId,
            DiagnosisCode = medicalRecord.Diagnosis?.Code,
            DiagnosisName = medicalRecord.Diagnosis?.Name,
            PrescriptionCount = medicalRecord.Prescriptions?.Count ?? 0
        };
    }
}

