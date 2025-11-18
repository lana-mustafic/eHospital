using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class InventoryItemRepository : BaseRepository<InventoryItem>, IInventoryItemRepository
{
    public InventoryItemRepository(ApplicationDbContext context) : base(context) { }

    public async Task<InventoryItem?> GetInventoryItemWithDetailsAsync(int id)
        => await _dbSet.Include(i => i.Medication)
                      .Include(i => i.Supplier)
                      .FirstOrDefaultAsync(i => i.Id == id);

    public async Task<IEnumerable<InventoryItem>> GetAllInventoryItemsWithDetailsAsync()
        => await _dbSet.Include(i => i.Medication)
                      .Include(i => i.Supplier)
                      .OrderBy(i => i.Name)
                      .ToListAsync();

    public async Task<IEnumerable<InventoryItem>> GetInventoryItemsByCategoryAsync(string category)
        => await _dbSet.Include(i => i.Medication)
                      .Include(i => i.Supplier)
                      .Where(i => i.Category == category && i.IsActive)
                      .OrderBy(i => i.Name)
                      .ToListAsync();

    public async Task<IEnumerable<InventoryItem>> GetLowStockItemsAsync()
        => await _dbSet.Include(i => i.Medication)
                      .Include(i => i.Supplier)
                      .Where(i => i.IsActive && i.CurrentStock <= i.MinimumStockLevel && i.CurrentStock > 0)
                      .OrderBy(i => i.CurrentStock)
                      .ToListAsync();

    public async Task<IEnumerable<InventoryItem>> GetExpiringItemsAsync(int daysAhead = 30)
    {
        var expiryDate = DateTime.UtcNow.AddDays(daysAhead);
        return await _dbSet.Include(i => i.Medication)
                          .Include(i => i.Supplier)
                          .Where(i => i.IsActive && 
                                     i.ExpiryDate.HasValue && 
                                     i.ExpiryDate.Value <= expiryDate &&
                                     i.CurrentStock > 0)
                          .OrderBy(i => i.ExpiryDate)
                          .ToListAsync();
    }

    public async Task<IEnumerable<InventoryItem>> GetOutOfStockItemsAsync()
        => await _dbSet.Include(i => i.Medication)
                      .Include(i => i.Supplier)
                      .Where(i => i.IsActive && i.CurrentStock == 0)
                      .OrderBy(i => i.Name)
                      .ToListAsync();

    public async Task<InventoryItem?> GetInventoryItemByCodeAsync(string itemCode)
        => await _dbSet.Include(i => i.Medication)
                      .Include(i => i.Supplier)
                      .FirstOrDefaultAsync(i => i.ItemCode == itemCode);

    public async Task<IEnumerable<InventoryItem>> SearchInventoryItemsAsync(string searchTerm)
    {
        var term = searchTerm.ToLower();
        return await _dbSet.Include(i => i.Medication)
                          .Include(i => i.Supplier)
                          .Where(i => i.IsActive && 
                                     (i.Name.ToLower().Contains(term) ||
                                      i.ItemCode.ToLower().Contains(term) ||
                                      i.Description.ToLower().Contains(term) ||
                                      i.Category.ToLower().Contains(term)))
                          .OrderBy(i => i.Name)
                          .ToListAsync();
    }
}

