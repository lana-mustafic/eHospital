using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface ISupplierService
{
    Task<IEnumerable<SupplierDto>> GetAllSuppliersAsync();
    Task<SupplierDto?> GetSupplierByIdAsync(int id);
    Task<IEnumerable<SupplierDto>> GetActiveSuppliersAsync();
    Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto createSupplierDto);
    Task UpdateSupplierAsync(int id, UpdateSupplierDto updateSupplierDto);
    Task DeleteSupplierAsync(int id);
}

