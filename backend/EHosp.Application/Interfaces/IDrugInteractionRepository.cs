using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IDrugInteractionRepository : IRepository<DrugInteraction>
{
    Task<IEnumerable<DrugInteraction>> GetInteractionsByMedicationAsync(int medicationId);
    Task<DrugInteraction?> GetInteractionBetweenMedicationsAsync(int medication1Id, int medication2Id);
    Task<IEnumerable<DrugInteraction>> GetAllInteractionsWithDetailsAsync();
    Task<DrugInteraction?> GetInteractionWithDetailsAsync(int id);
}

