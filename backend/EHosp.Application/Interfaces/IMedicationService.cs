using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces
{
    public interface IMedicationService
    {
        Task<MedicationDto?> GetMedicationByIdAsync(int id);
        Task<IEnumerable<MedicationDto>> GetAllMedicationsAsync();
        Task<IEnumerable<MedicationDto>> GetActiveMedicationsAsync();
        Task<IEnumerable<MedicationDto>> GetMedicationsByFormAsync(string form);
        Task<IEnumerable<MedicationDto>> GetLowStockMedicationsAsync(int threshold = 10);
        Task<MedicationDto> CreateMedicationAsync(CreateMedicationDto createMedicationDto);
        Task UpdateMedicationAsync(int id, UpdateMedicationDto updateMedicationDto);
        Task UpdateStockQuantityAsync(int id, int quantity);
        Task DeleteMedicationAsync(int id);
    }
}

