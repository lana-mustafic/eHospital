using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IFamilyMedicalHistoryRepository : IRepository<FamilyMedicalHistory>
{
    Task<FamilyMedicalHistory?> GetFamilyMedicalHistoryWithDetailsAsync(int id);
    Task<IEnumerable<FamilyMedicalHistory>> GetAllFamilyMedicalHistoriesWithDetailsAsync();
    Task<IEnumerable<FamilyMedicalHistory>> GetFamilyMedicalHistoriesByPatientAsync(int patientId);
}

