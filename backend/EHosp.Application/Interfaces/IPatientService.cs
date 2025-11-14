using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces
{
    public interface IPatientService
    {
        Task<PatientDto?> GetPatientByIdAsync(int id);
        Task<IEnumerable<PatientDto>> GetAllPatientsAsync();
        Task<IEnumerable<PatientDto>> GetPatientsByDoctorAsync(int doctorId);
        Task<PatientDto> CreatePatientAsync(CreatePatientDto createPatientDto);
        Task UpdatePatientAsync(int id, UpdatePatientDto updatePatientDto);
        Task DeletePatientAsync(int id);
    }
}

