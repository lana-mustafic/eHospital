using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface ISupplierRepository : IRepository<Supplier>
{
    Task<Supplier?> GetSupplierWithOrdersAsync(int id);
    Task<IEnumerable<Supplier>> GetActiveSuppliersAsync();
    Task<Supplier?> GetSupplierByEmailAsync(string email);
}

