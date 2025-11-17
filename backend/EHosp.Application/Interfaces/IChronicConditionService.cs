using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IChronicConditionService
{
    Task<IEnumerable<ChronicConditionDto>> GetAllChronicConditionsAsync();
    Task<ChronicConditionDto?> GetChronicConditionByIdAsync(int id);
    Task<IEnumerable<ChronicConditionDto>> GetChronicConditionsByPatientAsync(int patientId);
    Task<IEnumerable<ChronicConditionDto>> GetActiveChronicConditionsByPatientAsync(int patientId);
    Task<ChronicConditionDto> CreateChronicConditionAsync(CreateChronicConditionDto createChronicConditionDto);
    Task UpdateChronicConditionAsync(int id, UpdateChronicConditionDto updateChronicConditionDto);
    Task DeleteChronicConditionAsync(int id);
}

