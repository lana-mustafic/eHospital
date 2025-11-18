using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class SupplierService : ISupplierService
{
    private readonly ISupplierRepository _supplierRepository;
    private readonly ILogger<SupplierService> _logger;

    public SupplierService(
        ISupplierRepository supplierRepository,
        ILogger<SupplierService> logger)
    {
        _supplierRepository = supplierRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<SupplierDto>> GetAllSuppliersAsync()
    {
        var suppliers = await _supplierRepository.GetAllAsync();
        return suppliers.Select(s => MapToDto(s));
    }

    public async Task<SupplierDto?> GetSupplierByIdAsync(int id)
    {
        var supplier = await _supplierRepository.GetSupplierWithOrdersAsync(id);
        return supplier != null ? MapToDto(supplier) : null;
    }

    public async Task<IEnumerable<SupplierDto>> GetActiveSuppliersAsync()
    {
        var suppliers = await _supplierRepository.GetActiveSuppliersAsync();
        return suppliers.Select(MapToDto);
    }

    public async Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto createSupplierDto)
    {
        // Check if supplier with same email already exists
        var existingSupplier = await _supplierRepository.GetSupplierByEmailAsync(createSupplierDto.Email);
        if (existingSupplier != null)
        {
            throw new InvalidOperationException($"Supplier with email {createSupplierDto.Email} already exists");
        }

        var supplier = new Supplier
        {
            Name = createSupplierDto.Name,
            ContactPerson = createSupplierDto.ContactPerson,
            Email = createSupplierDto.Email,
            PhoneNumber = createSupplierDto.PhoneNumber,
            Address = createSupplierDto.Address,
            City = createSupplierDto.City,
            State = createSupplierDto.State,
            ZipCode = createSupplierDto.ZipCode,
            Country = createSupplierDto.Country,
            TaxId = createSupplierDto.TaxId,
            Notes = createSupplierDto.Notes,
            IsActive = createSupplierDto.IsActive
        };

        var createdSupplier = await _supplierRepository.AddAsync(supplier);
        _logger.LogInformation("Created supplier: {SupplierName}", createdSupplier.Name);

        return MapToDto(createdSupplier);
    }

    public async Task UpdateSupplierAsync(int id, UpdateSupplierDto updateSupplierDto)
    {
        var supplier = await _supplierRepository.GetByIdAsync(id);
        if (supplier == null)
        {
            throw new ArgumentException("Supplier not found");
        }

        if (!string.IsNullOrEmpty(updateSupplierDto.Name))
            supplier.Name = updateSupplierDto.Name;
        if (!string.IsNullOrEmpty(updateSupplierDto.ContactPerson))
            supplier.ContactPerson = updateSupplierDto.ContactPerson;
        if (!string.IsNullOrEmpty(updateSupplierDto.Email) && updateSupplierDto.Email != supplier.Email)
        {
            var existingSupplier = await _supplierRepository.GetSupplierByEmailAsync(updateSupplierDto.Email);
            if (existingSupplier != null && existingSupplier.Id != id)
            {
                throw new InvalidOperationException($"Supplier with email {updateSupplierDto.Email} already exists");
            }
            supplier.Email = updateSupplierDto.Email;
        }
        if (!string.IsNullOrEmpty(updateSupplierDto.PhoneNumber))
            supplier.PhoneNumber = updateSupplierDto.PhoneNumber;
        if (!string.IsNullOrEmpty(updateSupplierDto.Address))
            supplier.Address = updateSupplierDto.Address;
        if (!string.IsNullOrEmpty(updateSupplierDto.City))
            supplier.City = updateSupplierDto.City;
        if (!string.IsNullOrEmpty(updateSupplierDto.State))
            supplier.State = updateSupplierDto.State;
        if (!string.IsNullOrEmpty(updateSupplierDto.ZipCode))
            supplier.ZipCode = updateSupplierDto.ZipCode;
        if (!string.IsNullOrEmpty(updateSupplierDto.Country))
            supplier.Country = updateSupplierDto.Country;
        if (updateSupplierDto.TaxId != null)
            supplier.TaxId = updateSupplierDto.TaxId;
        if (updateSupplierDto.Notes != null)
            supplier.Notes = updateSupplierDto.Notes;
        if (updateSupplierDto.IsActive.HasValue)
            supplier.IsActive = updateSupplierDto.IsActive.Value;

        supplier.UpdatedAt = DateTime.UtcNow;

        await _supplierRepository.UpdateAsync(supplier);
        _logger.LogInformation("Updated supplier: {SupplierId}", id);
    }

    public async Task DeleteSupplierAsync(int id)
    {
        var supplier = await _supplierRepository.GetSupplierWithOrdersAsync(id);
        if (supplier == null)
        {
            throw new ArgumentException("Supplier not found");
        }

        // Check if supplier has purchase orders
        if (supplier.PurchaseOrders != null && supplier.PurchaseOrders.Any())
        {
            throw new InvalidOperationException("Cannot delete supplier with existing purchase orders. Please remove or reassign purchase orders first.");
        }

        await _supplierRepository.DeleteAsync(supplier);
        _logger.LogInformation("Deleted supplier: {SupplierId}", id);
    }

    private static SupplierDto MapToDto(Supplier supplier)
    {
        return new SupplierDto
        {
            Id = supplier.Id,
            Name = supplier.Name,
            ContactPerson = supplier.ContactPerson,
            Email = supplier.Email,
            PhoneNumber = supplier.PhoneNumber,
            Address = supplier.Address,
            City = supplier.City,
            State = supplier.State,
            ZipCode = supplier.ZipCode,
            Country = supplier.Country,
            TaxId = supplier.TaxId,
            Notes = supplier.Notes,
            IsActive = supplier.IsActive,
            CreatedAt = supplier.CreatedAt,
            UpdatedAt = supplier.UpdatedAt,
            TotalOrders = supplier.PurchaseOrders?.Count ?? 0
        };
    }
}

