using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IInsuranceProviderService
{
    Task<IEnumerable<InsuranceProviderDto>> GetAllProvidersAsync();
    Task<InsuranceProviderDto?> GetProviderByIdAsync(int id);
    Task<IEnumerable<InsuranceProviderDto>> GetActiveProvidersAsync();
    Task<InsuranceProviderDto> CreateProviderAsync(CreateInsuranceProviderDto createDto);
    Task UpdateProviderAsync(int id, UpdateInsuranceProviderDto updateDto);
    Task DeleteProviderAsync(int id);
}

