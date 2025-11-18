using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IInventoryItemService
{
    Task<IEnumerable<InventoryItemDto>> GetAllInventoryItemsAsync();
    Task<InventoryItemDto?> GetInventoryItemByIdAsync(int id);
    Task<IEnumerable<InventoryItemDto>> GetInventoryItemsByCategoryAsync(string category);
    Task<IEnumerable<LowStockAlertDto>> GetLowStockItemsAsync();
    Task<IEnumerable<ExpiringItemsDto>> GetExpiringItemsAsync(int daysAhead = 30);
    Task<IEnumerable<InventoryItemDto>> GetOutOfStockItemsAsync();
    Task<IEnumerable<InventoryItemDto>> SearchInventoryItemsAsync(string searchTerm);
    Task<InventoryItemDto> CreateInventoryItemAsync(CreateInventoryItemDto createInventoryItemDto);
    Task UpdateInventoryItemAsync(int id, UpdateInventoryItemDto updateInventoryItemDto);
    Task DeleteInventoryItemAsync(int id);
    Task AdjustStockAsync(int inventoryItemId, int quantity, string reason, int? userId);
}

