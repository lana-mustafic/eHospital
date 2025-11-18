using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IStockMovementService
{
    Task<IEnumerable<StockMovementDto>> GetAllStockMovementsAsync();
    Task<StockMovementDto?> GetStockMovementByIdAsync(int id);
    Task<IEnumerable<StockMovementDto>> GetStockMovementsByItemAsync(int inventoryItemId);
    Task<IEnumerable<StockMovementDto>> GetStockMovementsByTypeAsync(string movementType);
    Task<IEnumerable<StockMovementDto>> GetStockMovementsByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<StockMovementDto> CreateStockMovementAsync(CreateStockMovementDto createStockMovementDto);
    Task DeleteStockMovementAsync(int id);
}

