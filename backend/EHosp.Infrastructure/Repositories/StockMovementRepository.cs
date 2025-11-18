using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class StockMovementRepository : BaseRepository<StockMovement>, IStockMovementRepository
{
    public StockMovementRepository(ApplicationDbContext context) : base(context) { }

    public async Task<StockMovement?> GetStockMovementWithDetailsAsync(int id)
        => await _dbSet.Include(sm => sm.InventoryItem)
                      .ThenInclude(i => i.Medication)
                      .Include(sm => sm.CreatedBy)
                      .Include(sm => sm.Prescription)
                      .FirstOrDefaultAsync(sm => sm.Id == id);

    public async Task<IEnumerable<StockMovement>> GetAllStockMovementsWithDetailsAsync()
        => await _dbSet.Include(sm => sm.InventoryItem)
                      .ThenInclude(i => i.Medication)
                      .Include(sm => sm.CreatedBy)
                      .Include(sm => sm.Prescription)
                      .OrderByDescending(sm => sm.MovementDate)
                      .ToListAsync();

    public async Task<IEnumerable<StockMovement>> GetStockMovementsByItemAsync(int inventoryItemId)
        => await _dbSet.Include(sm => sm.InventoryItem)
                      .ThenInclude(i => i.Medication)
                      .Include(sm => sm.CreatedBy)
                      .Where(sm => sm.InventoryItemId == inventoryItemId)
                      .OrderByDescending(sm => sm.MovementDate)
                      .ToListAsync();

    public async Task<IEnumerable<StockMovement>> GetStockMovementsByTypeAsync(string movementType)
        => await _dbSet.Include(sm => sm.InventoryItem)
                      .ThenInclude(i => i.Medication)
                      .Include(sm => sm.CreatedBy)
                      .Where(sm => sm.MovementType == movementType)
                      .OrderByDescending(sm => sm.MovementDate)
                      .ToListAsync();

    public async Task<IEnumerable<StockMovement>> GetStockMovementsByDateRangeAsync(DateTime startDate, DateTime endDate)
        => await _dbSet.Include(sm => sm.InventoryItem)
                      .ThenInclude(i => i.Medication)
                      .Include(sm => sm.CreatedBy)
                      .Where(sm => sm.MovementDate >= startDate && sm.MovementDate <= endDate)
                      .OrderByDescending(sm => sm.MovementDate)
                      .ToListAsync();
}

