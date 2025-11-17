using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces
{
    public interface IPrescriptionRepository : IRepository<Prescription>
    {
        Task<Prescription?> GetPrescriptionWithDetailsAsync(int id);
        Task<IEnumerable<Prescription>> GetAllPrescriptionsWithDetailsAsync();
        Task<IEnumerable<Prescription>> GetPrescriptionsByMedicalRecordAsync(int medicalRecordId);
        Task<IEnumerable<Prescription>> GetPrescriptionsByPatientAsync(int patientId);
        Task<IEnumerable<Prescription>> GetPrescriptionsByDoctorAsync(int doctorId);
        Task<IEnumerable<Prescription>> GetPrescriptionsByMedicationAsync(int medicationId);
    }
}

