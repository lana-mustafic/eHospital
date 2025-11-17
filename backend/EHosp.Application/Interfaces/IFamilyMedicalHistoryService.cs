using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IFamilyMedicalHistoryService
{
    Task<IEnumerable<FamilyMedicalHistoryDto>> GetAllFamilyMedicalHistoriesAsync();
    Task<FamilyMedicalHistoryDto?> GetFamilyMedicalHistoryByIdAsync(int id);
    Task<IEnumerable<FamilyMedicalHistoryDto>> GetFamilyMedicalHistoriesByPatientAsync(int patientId);
    Task<FamilyMedicalHistoryDto> CreateFamilyMedicalHistoryAsync(CreateFamilyMedicalHistoryDto createFamilyMedicalHistoryDto);
    Task UpdateFamilyMedicalHistoryAsync(int id, UpdateFamilyMedicalHistoryDto updateFamilyMedicalHistoryDto);
    Task DeleteFamilyMedicalHistoryAsync(int id);
}

