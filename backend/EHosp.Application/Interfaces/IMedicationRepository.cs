using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces
{
    public interface IMedicationRepository : IRepository<Medication>
    {
        Task<Medication?> GetMedicationWithPrescriptionsAsync(int id);
        Task<IEnumerable<Medication>> GetActiveMedicationsAsync();
        Task<IEnumerable<Medication>> GetMedicationsByFormAsync(string form);
        Task<IEnumerable<Medication>> GetLowStockMedicationsAsync(int threshold);
    }
}

