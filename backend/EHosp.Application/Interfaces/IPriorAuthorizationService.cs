using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IPriorAuthorizationService
{
    Task<IEnumerable<PriorAuthorizationDto>> GetAllPriorAuthorizationsAsync();
    Task<PriorAuthorizationDto?> GetPriorAuthorizationByIdAsync(int id);
    Task<IEnumerable<PriorAuthorizationDto>> GetPriorAuthorizationsByPatientAsync(int patientId);
    Task<IEnumerable<PriorAuthorizationDto>> GetPriorAuthorizationsByStatusAsync(string status);
    Task<PriorAuthorizationDto> CreatePriorAuthorizationAsync(CreatePriorAuthorizationDto createDto);
    Task UpdatePriorAuthorizationAsync(int id, UpdatePriorAuthorizationDto updateDto);
    Task DeletePriorAuthorizationAsync(int id);
}

