using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces
{
    public interface IMedicalRecordRepository : IRepository<MedicalRecord>
    {
        Task<MedicalRecord?> GetMedicalRecordWithDetailsAsync(int id);
        Task<IEnumerable<MedicalRecord>> GetAllMedicalRecordsWithDetailsAsync();
        Task<IEnumerable<MedicalRecord>> GetMedicalRecordsByPatientAsync(int patientId);
        Task<IEnumerable<MedicalRecord>> GetMedicalRecordsByDoctorAsync(int doctorId);
        Task<IEnumerable<MedicalRecord>> GetMedicalRecordsByPatientAndDoctorAsync(int patientId, int doctorId);
    }
}

