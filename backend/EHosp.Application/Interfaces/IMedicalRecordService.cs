using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces
{
    public interface IMedicalRecordService
    {
        Task<IEnumerable<MedicalRecordDto>> GetAllMedicalRecordsAsync();
        Task<MedicalRecordDto?> GetMedicalRecordByIdAsync(int id);
        Task<IEnumerable<MedicalRecordDto>> GetMedicalRecordsByPatientAsync(int patientId);
        Task<IEnumerable<MedicalRecordDto>> GetMedicalRecordsByDoctorAsync(int doctorId);
        Task<IEnumerable<MedicalRecordDto>> GetMedicalRecordsByPatientAndDoctorAsync(int patientId, int doctorId);
        Task<MedicalRecordDto> CreateMedicalRecordAsync(CreateMedicalRecordDto createMedicalRecordDto);
        Task UpdateMedicalRecordAsync(int id, UpdateMedicalRecordDto updateMedicalRecordDto);
        Task DeleteMedicalRecordAsync(int id);
    }
}

