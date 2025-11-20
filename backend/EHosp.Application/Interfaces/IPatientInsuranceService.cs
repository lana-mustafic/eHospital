using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IPatientInsuranceService
{
    Task<IEnumerable<PatientInsuranceDto>> GetAllPatientInsurancesAsync();
    Task<PatientInsuranceDto?> GetPatientInsuranceByIdAsync(int id);
    Task<IEnumerable<PatientInsuranceDto>> GetPatientInsurancesByPatientAsync(int patientId);
    Task<IEnumerable<PatientInsuranceDto>> GetActivePatientInsurancesByPatientAsync(int patientId);
    Task<PatientInsuranceDto> CreatePatientInsuranceAsync(CreatePatientInsuranceDto createDto);
    Task UpdatePatientInsuranceAsync(int id, UpdatePatientInsuranceDto updateDto);
    Task<PatientInsuranceDto> VerifyInsuranceAsync(int id, VerifyInsuranceDto verifyDto);
    Task DeletePatientInsuranceAsync(int id);
}

