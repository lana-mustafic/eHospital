using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class InsuranceProviderService : IInsuranceProviderService
{
    private readonly IInsuranceProviderRepository _providerRepository;
    private readonly ILogger<InsuranceProviderService> _logger;
    private readonly IAuditService _auditService;

    public InsuranceProviderService(
        IInsuranceProviderRepository providerRepository,
        ILogger<InsuranceProviderService> logger,
        IAuditService auditService)
    {
        _providerRepository = providerRepository;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<IEnumerable<InsuranceProviderDto>> GetAllProvidersAsync()
    {
        var providers = await _providerRepository.GetAllAsync();
        return providers.Select(MapToDto);
    }

    public async Task<InsuranceProviderDto?> GetProviderByIdAsync(int id)
    {
        var provider = await _providerRepository.GetByIdAsync(id);
        return provider != null ? MapToDto(provider) : null;
    }

    public async Task<IEnumerable<InsuranceProviderDto>> GetActiveProvidersAsync()
    {
        var providers = await _providerRepository.GetActiveProvidersAsync();
        return providers.Select(MapToDto);
    }

    public async Task<InsuranceProviderDto> CreateProviderAsync(CreateInsuranceProviderDto createDto)
    {
        var provider = new InsuranceProvider
        {
            Name = createDto.Name,
            Code = createDto.Code,
            Address = createDto.Address,
            City = createDto.City,
            State = createDto.State,
            ZipCode = createDto.ZipCode,
            PhoneNumber = createDto.PhoneNumber,
            Email = createDto.Email,
            Website = createDto.Website,
            PayerId = createDto.PayerId,
            ContactPerson = createDto.ContactPerson,
            IsActive = true
        };

        var created = await _providerRepository.AddAsync(provider);
        await _auditService.WriteAsync("system", "Admin", "Create", "InsuranceProvider", created.Id.ToString(), $"Name={created.Name}");
        return MapToDto(created);
    }

    public async Task UpdateProviderAsync(int id, UpdateInsuranceProviderDto updateDto)
    {
        var provider = await _providerRepository.GetByIdAsync(id);
        if (provider == null)
        {
            throw new ArgumentException("Insurance provider not found");
        }

        if (!string.IsNullOrEmpty(updateDto.Name))
            provider.Name = updateDto.Name;
        if (updateDto.Code != null)
            provider.Code = updateDto.Code;
        if (updateDto.Address != null)
            provider.Address = updateDto.Address;
        if (updateDto.City != null)
            provider.City = updateDto.City;
        if (updateDto.State != null)
            provider.State = updateDto.State;
        if (updateDto.ZipCode != null)
            provider.ZipCode = updateDto.ZipCode;
        if (updateDto.PhoneNumber != null)
            provider.PhoneNumber = updateDto.PhoneNumber;
        if (updateDto.Email != null)
            provider.Email = updateDto.Email;
        if (updateDto.Website != null)
            provider.Website = updateDto.Website;
        if (updateDto.PayerId != null)
            provider.PayerId = updateDto.PayerId;
        if (updateDto.ContactPerson != null)
            provider.ContactPerson = updateDto.ContactPerson;
        if (updateDto.IsActive.HasValue)
            provider.IsActive = updateDto.IsActive.Value;

        provider.UpdatedAt = DateTime.UtcNow;
        await _providerRepository.UpdateAsync(provider);
        await _auditService.WriteAsync("system", "Admin", "Update", "InsuranceProvider", provider.Id.ToString(), "Updated fields");
    }

    public async Task DeleteProviderAsync(int id)
    {
        var provider = await _providerRepository.GetByIdAsync(id);
        if (provider == null)
        {
            throw new ArgumentException("Insurance provider not found");
        }

        await _providerRepository.DeleteAsync(provider);
        await _auditService.WriteAsync("system", "Admin", "Delete", "InsuranceProvider", provider.Id.ToString(), $"Name={provider.Name}");
    }

    private static InsuranceProviderDto MapToDto(InsuranceProvider provider) => new()
    {
        Id = provider.Id,
        Name = provider.Name,
        Code = provider.Code,
        Address = provider.Address,
        City = provider.City,
        State = provider.State,
        ZipCode = provider.ZipCode,
        PhoneNumber = provider.PhoneNumber,
        Email = provider.Email,
        Website = provider.Website,
        PayerId = provider.PayerId,
        ContactPerson = provider.ContactPerson,
        IsActive = provider.IsActive
    };
}

