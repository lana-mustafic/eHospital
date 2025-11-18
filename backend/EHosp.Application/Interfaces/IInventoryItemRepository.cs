using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IInventoryItemRepository : IRepository<InventoryItem>
{
    Task<InventoryItem?> GetInventoryItemWithDetailsAsync(int id);
    Task<IEnumerable<InventoryItem>> GetAllInventoryItemsWithDetailsAsync();
    Task<IEnumerable<InventoryItem>> GetInventoryItemsByCategoryAsync(string category);
    Task<IEnumerable<InventoryItem>> GetLowStockItemsAsync();
    Task<IEnumerable<InventoryItem>> GetExpiringItemsAsync(int daysAhead = 30);
    Task<IEnumerable<InventoryItem>> GetOutOfStockItemsAsync();
    Task<InventoryItem?> GetInventoryItemByCodeAsync(string itemCode);
    Task<IEnumerable<InventoryItem>> SearchInventoryItemsAsync(string searchTerm);
}

