using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IStockMovementRepository : IRepository<StockMovement>
{
    Task<StockMovement?> GetStockMovementWithDetailsAsync(int id);
    Task<IEnumerable<StockMovement>> GetAllStockMovementsWithDetailsAsync();
    Task<IEnumerable<StockMovement>> GetStockMovementsByItemAsync(int inventoryItemId);
    Task<IEnumerable<StockMovement>> GetStockMovementsByTypeAsync(string movementType);
    Task<IEnumerable<StockMovement>> GetStockMovementsByDateRangeAsync(DateTime startDate, DateTime endDate);
}

