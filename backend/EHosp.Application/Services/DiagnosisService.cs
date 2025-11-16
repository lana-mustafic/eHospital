using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services
{
    public class DiagnosisService : IDiagnosisService
    {
        private readonly IDiagnosisRepository _diagnosisRepository;
        private readonly ILogger<DiagnosisService> _logger;
        private readonly IAuditService _auditService;

        public DiagnosisService(IDiagnosisRepository diagnosisRepository, ILogger<DiagnosisService> logger, IAuditService auditService)
        {
            _diagnosisRepository = diagnosisRepository;
            _logger = logger;
            _auditService = auditService;
        }

        public async Task<DiagnosisDto?> GetDiagnosisByIdAsync(int id)
        {
            var diagnosis = await _diagnosisRepository.GetDiagnosisWithMedicalRecordsAsync(id);
            return diagnosis != null ? MapToDto(diagnosis) : null;
        }

        public async Task<DiagnosisDto?> GetDiagnosisByCodeAsync(string code)
        {
            var diagnosis = await _diagnosisRepository.GetDiagnosisByCodeAsync(code);
            return diagnosis != null ? MapToDto(diagnosis) : null;
        }

        public async Task<IEnumerable<DiagnosisDto>> GetAllDiagnosesAsync()
        {
            var diagnoses = await _diagnosisRepository.GetAllAsync();
            return diagnoses.Select(MapToDto);
        }

        public async Task<IEnumerable<DiagnosisDto>> SearchDiagnosesAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return await GetAllDiagnosesAsync();
            }

            var diagnoses = await _diagnosisRepository.SearchDiagnosesAsync(searchTerm);
            return diagnoses.Select(MapToDto);
        }

        public async Task<DiagnosisDto> CreateDiagnosisAsync(CreateDiagnosisDto createDiagnosisDto)
        {
            // Check if diagnosis code already exists
            var existingDiagnosis = await _diagnosisRepository.GetDiagnosisByCodeAsync(createDiagnosisDto.Code);
            if (existingDiagnosis != null)
            {
                throw new ArgumentException($"Diagnosis with code '{createDiagnosisDto.Code}' already exists");
            }

            var diagnosis = new Diagnosis
            {
                Code = createDiagnosisDto.Code,
                Name = createDiagnosisDto.Name,
                Description = createDiagnosisDto.Description
            };

            var createdDiagnosis = await _diagnosisRepository.AddAsync(diagnosis);
            await _auditService.WriteAsync("system", "Doctor", "Create", "Diagnosis", createdDiagnosis.Id.ToString(), createdDiagnosis.Code);
            return MapToDto(createdDiagnosis);
        }

        public async Task UpdateDiagnosisAsync(int id, UpdateDiagnosisDto updateDiagnosisDto)
        {
            var diagnosis = await _diagnosisRepository.GetByIdAsync(id);
            if (diagnosis == null)
            {
                throw new ArgumentException("Diagnosis not found");
            }

            // If code is being updated, check if new code already exists
            if (!string.IsNullOrEmpty(updateDiagnosisDto.Code) && updateDiagnosisDto.Code != diagnosis.Code)
            {
                var existingDiagnosis = await _diagnosisRepository.GetDiagnosisByCodeAsync(updateDiagnosisDto.Code);
                if (existingDiagnosis != null && existingDiagnosis.Id != id)
                {
                    throw new ArgumentException($"Diagnosis with code '{updateDiagnosisDto.Code}' already exists");
                }
            }

            if (!string.IsNullOrEmpty(updateDiagnosisDto.Code))
                diagnosis.Code = updateDiagnosisDto.Code;
            if (!string.IsNullOrEmpty(updateDiagnosisDto.Name))
                diagnosis.Name = updateDiagnosisDto.Name;
            if (!string.IsNullOrEmpty(updateDiagnosisDto.Description))
                diagnosis.Description = updateDiagnosisDto.Description;

            await _diagnosisRepository.UpdateAsync(diagnosis);
            await _auditService.WriteAsync("system", "Doctor", "Update", "Diagnosis", diagnosis.Id.ToString(), "Updated fields");
        }

        public async Task DeleteDiagnosisAsync(int id)
        {
            var diagnosis = await _diagnosisRepository.GetDiagnosisWithMedicalRecordsAsync(id);
            if (diagnosis == null)
            {
                throw new ArgumentException("Diagnosis not found");
            }

            // Check if diagnosis has associated medical records
            if (diagnosis.MedicalRecords != null && diagnosis.MedicalRecords.Any())
            {
                throw new InvalidOperationException(
                    "Cannot delete diagnosis with associated medical records. " +
                    "Please remove the diagnosis from all medical records first.");
            }

            await _diagnosisRepository.DeleteAsync(diagnosis);
            await _auditService.WriteAsync("system", "Doctor", "Delete", "Diagnosis", diagnosis.Id.ToString(), diagnosis.Code);
        }

        private static DiagnosisDto MapToDto(Diagnosis diagnosis) => new()
        {
            Id = diagnosis.Id,
            Code = diagnosis.Code,
            Name = diagnosis.Name,
            Description = diagnosis.Description,
            MedicalRecordCount = diagnosis.MedicalRecords?.Count ?? 0
        };
    }
}

