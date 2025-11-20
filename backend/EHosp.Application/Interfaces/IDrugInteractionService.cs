using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IDrugInteractionService
{
    Task<IEnumerable<DrugInteractionDto>> GetAllInteractionsAsync();
    Task<DrugInteractionDto?> GetInteractionByIdAsync(int id);
    Task<IEnumerable<DrugInteractionDto>> GetInteractionsByMedicationAsync(int medicationId);
    Task<DrugInteractionDto?> CheckInteractionAsync(int medication1Id, int medication2Id);
    Task<IEnumerable<DrugInteractionDto>> CheckInteractionsForPrescriptionAsync(int prescriptionId);
    Task<DrugInteractionDto> CreateInteractionAsync(CreateDrugInteractionDto createDto);
    Task UpdateInteractionAsync(int id, UpdateDrugInteractionDto updateDto);
    Task DeleteInteractionAsync(int id);
}

