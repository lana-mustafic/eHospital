using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces
{
    public interface IPrescriptionService
    {
        Task<IEnumerable<PrescriptionDto>> GetAllPrescriptionsAsync();
        Task<PrescriptionDto?> GetPrescriptionByIdAsync(int id);
        Task<IEnumerable<PrescriptionDto>> GetPrescriptionsByMedicalRecordAsync(int medicalRecordId);
        Task<IEnumerable<PrescriptionDto>> GetPrescriptionsByPatientAsync(int patientId);
        Task<IEnumerable<PrescriptionDto>> GetPrescriptionsByDoctorAsync(int doctorId);
        Task<IEnumerable<PrescriptionDto>> GetPrescriptionsByMedicationAsync(int medicationId);
        Task<IEnumerable<PrescriptionDto>> GetPendingPrescriptionsAsync();
        Task<PrescriptionDto> CreatePrescriptionAsync(CreatePrescriptionDto createPrescriptionDto);
        Task UpdatePrescriptionAsync(int id, UpdatePrescriptionDto updatePrescriptionDto);
        Task DeletePrescriptionAsync(int id);
        Task<PrescriptionDto> VerifyPrescriptionAsync(int id, int verifiedByUserId, string? notes = null);
        Task<PrescriptionDto> DispensePrescriptionAsync(int id, int dispensedByUserId, string? notes = null);
        Task<PrescriptionDto> CancelPrescriptionAsync(int id, string? reason = null);
    }
}

