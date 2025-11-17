using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IPatientAllergyService
{
    Task<IEnumerable<PatientAllergyDto>> GetAllPatientAllergiesAsync();
    Task<PatientAllergyDto?> GetPatientAllergyByIdAsync(int id);
    Task<IEnumerable<PatientAllergyDto>> GetPatientAllergiesByPatientAsync(int patientId);
    Task<IEnumerable<PatientAllergyDto>> GetActivePatientAllergiesByPatientAsync(int patientId);
    Task<PatientAllergyDto> CreatePatientAllergyAsync(CreatePatientAllergyDto createPatientAllergyDto);
    Task UpdatePatientAllergyAsync(int id, UpdatePatientAllergyDto updatePatientAllergyDto);
    Task DeletePatientAllergyAsync(int id);
}

