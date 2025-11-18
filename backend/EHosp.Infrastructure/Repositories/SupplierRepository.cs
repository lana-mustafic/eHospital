using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class SupplierRepository : BaseRepository<Supplier>, ISupplierRepository
{
    public SupplierRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Supplier?> GetSupplierWithOrdersAsync(int id)
        => await _dbSet.Include(s => s.PurchaseOrders)
                      .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<IEnumerable<Supplier>> GetActiveSuppliersAsync()
        => await _dbSet.Where(s => s.IsActive)
                      .OrderBy(s => s.Name)
                      .ToListAsync();

    public async Task<Supplier?> GetSupplierByEmailAsync(string email)
        => await _dbSet.FirstOrDefaultAsync(s => s.Email == email);
}

