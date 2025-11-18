using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class InventoryItemService : IInventoryItemService
{
    private readonly IInventoryItemRepository _inventoryItemRepository;
    private readonly IStockMovementRepository _stockMovementRepository;
    private readonly ILogger<InventoryItemService> _logger;
    private readonly IAuditService _auditService;

    public InventoryItemService(
        IInventoryItemRepository inventoryItemRepository,
        IStockMovementRepository stockMovementRepository,
        ILogger<InventoryItemService> logger,
        IAuditService auditService)
    {
        _inventoryItemRepository = inventoryItemRepository;
        _stockMovementRepository = stockMovementRepository;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<IEnumerable<InventoryItemDto>> GetAllInventoryItemsAsync()
    {
        var items = await _inventoryItemRepository.GetAllInventoryItemsWithDetailsAsync();
        return items.Select(MapToDto);
    }

    public async Task<InventoryItemDto?> GetInventoryItemByIdAsync(int id)
    {
        var item = await _inventoryItemRepository.GetInventoryItemWithDetailsAsync(id);
        return item != null ? MapToDto(item) : null;
    }

    public async Task<IEnumerable<InventoryItemDto>> GetInventoryItemsByCategoryAsync(string category)
    {
        var items = await _inventoryItemRepository.GetInventoryItemsByCategoryAsync(category);
        return items.Select(MapToDto);
    }

    public async Task<IEnumerable<LowStockAlertDto>> GetLowStockItemsAsync()
    {
        var items = await _inventoryItemRepository.GetLowStockItemsAsync();
        return items.Select(item => new LowStockAlertDto
        {
            InventoryItemId = item.Id,
            ItemCode = item.ItemCode,
            Name = item.Name,
            CurrentStock = item.CurrentStock,
            MinimumStockLevel = item.MinimumStockLevel,
            ReorderQuantity = item.ReorderQuantity,
            SupplierName = item.Supplier?.Name,
            Category = item.Category
        });
    }

    public async Task<IEnumerable<ExpiringItemsDto>> GetExpiringItemsAsync(int daysAhead = 30)
    {
        var items = await _inventoryItemRepository.GetExpiringItemsAsync(daysAhead);
        return items.Where(item => item.ExpiryDate.HasValue).Select(item => new ExpiringItemsDto
        {
            InventoryItemId = item.Id,
            ItemCode = item.ItemCode,
            Name = item.Name,
            CurrentStock = item.CurrentStock,
            ExpiryDate = item.ExpiryDate!.Value,
            DaysUntilExpiry = (int)(item.ExpiryDate.Value - DateTime.UtcNow).TotalDays,
            Category = item.Category
        });
    }

    public async Task<IEnumerable<InventoryItemDto>> GetOutOfStockItemsAsync()
    {
        var items = await _inventoryItemRepository.GetOutOfStockItemsAsync();
        return items.Select(MapToDto);
    }

    public async Task<IEnumerable<InventoryItemDto>> SearchInventoryItemsAsync(string searchTerm)
    {
        var items = await _inventoryItemRepository.SearchInventoryItemsAsync(searchTerm);
        return items.Select(MapToDto);
    }

    public async Task<InventoryItemDto> CreateInventoryItemAsync(CreateInventoryItemDto createInventoryItemDto)
    {
        // Check if item code already exists
        var existingItem = await _inventoryItemRepository.GetInventoryItemByCodeAsync(createInventoryItemDto.ItemCode);
        if (existingItem != null)
        {
            throw new InvalidOperationException($"Inventory item with code {createInventoryItemDto.ItemCode} already exists");
        }

        var item = new InventoryItem
        {
            ItemCode = createInventoryItemDto.ItemCode,
            Name = createInventoryItemDto.Name,
            Description = createInventoryItemDto.Description,
            Category = createInventoryItemDto.Category,
            Unit = createInventoryItemDto.Unit,
            UnitPrice = createInventoryItemDto.UnitPrice,
            SellingPrice = createInventoryItemDto.SellingPrice,
            CurrentStock = createInventoryItemDto.CurrentStock,
            MinimumStockLevel = createInventoryItemDto.MinimumStockLevel,
            MaximumStockLevel = createInventoryItemDto.MaximumStockLevel,
            ReorderQuantity = createInventoryItemDto.ReorderQuantity,
            ExpiryDate = createInventoryItemDto.ExpiryDate,
            BatchNumber = createInventoryItemDto.BatchNumber,
            Manufacturer = createInventoryItemDto.Manufacturer,
            StorageLocation = createInventoryItemDto.StorageLocation,
            RequiresPrescription = createInventoryItemDto.RequiresPrescription,
            IsActive = createInventoryItemDto.IsActive,
            MedicationId = createInventoryItemDto.MedicationId,
            SupplierId = createInventoryItemDto.SupplierId
        };

        var createdItem = await _inventoryItemRepository.AddAsync(item);

        // Create initial stock movement if stock > 0
        if (createInventoryItemDto.CurrentStock > 0)
        {
            var stockMovement = new StockMovement
            {
                MovementType = "In",
                Quantity = createInventoryItemDto.CurrentStock,
                UnitPrice = createInventoryItemDto.UnitPrice,
                Reason = "Initial Stock",
                MovementDate = DateTime.UtcNow,
                InventoryItemId = createdItem.Id
            };
            await _stockMovementRepository.AddAsync(stockMovement);
        }

        _logger.LogInformation("Created inventory item: {ItemCode}", createdItem.ItemCode);
        await _auditService.WriteAsync("system", "System", "Create", "InventoryItem", createdItem.Id.ToString(), $"Created inventory item {createdItem.Name}");

        var itemWithDetails = await _inventoryItemRepository.GetInventoryItemWithDetailsAsync(createdItem.Id);
        return MapToDto(itemWithDetails!);
    }

    public async Task UpdateInventoryItemAsync(int id, UpdateInventoryItemDto updateInventoryItemDto)
    {
        var item = await _inventoryItemRepository.GetByIdAsync(id);
        if (item == null)
        {
            throw new ArgumentException("Inventory item not found");
        }

        if (!string.IsNullOrEmpty(updateInventoryItemDto.ItemCode) && updateInventoryItemDto.ItemCode != item.ItemCode)
        {
            var existingItem = await _inventoryItemRepository.GetInventoryItemByCodeAsync(updateInventoryItemDto.ItemCode);
            if (existingItem != null && existingItem.Id != id)
            {
                throw new InvalidOperationException($"Inventory item with code {updateInventoryItemDto.ItemCode} already exists");
            }
            item.ItemCode = updateInventoryItemDto.ItemCode;
        }

        if (!string.IsNullOrEmpty(updateInventoryItemDto.Name))
            item.Name = updateInventoryItemDto.Name;
        if (!string.IsNullOrEmpty(updateInventoryItemDto.Description))
            item.Description = updateInventoryItemDto.Description;
        if (!string.IsNullOrEmpty(updateInventoryItemDto.Category))
            item.Category = updateInventoryItemDto.Category;
        if (!string.IsNullOrEmpty(updateInventoryItemDto.Unit))
            item.Unit = updateInventoryItemDto.Unit;
        if (updateInventoryItemDto.UnitPrice.HasValue)
            item.UnitPrice = updateInventoryItemDto.UnitPrice.Value;
        if (updateInventoryItemDto.SellingPrice.HasValue)
            item.SellingPrice = updateInventoryItemDto.SellingPrice;
        if (updateInventoryItemDto.MinimumStockLevel.HasValue)
            item.MinimumStockLevel = updateInventoryItemDto.MinimumStockLevel.Value;
        if (updateInventoryItemDto.MaximumStockLevel.HasValue)
            item.MaximumStockLevel = updateInventoryItemDto.MaximumStockLevel.Value;
        if (updateInventoryItemDto.ReorderQuantity.HasValue)
            item.ReorderQuantity = updateInventoryItemDto.ReorderQuantity;
        if (updateInventoryItemDto.ExpiryDate.HasValue)
            item.ExpiryDate = updateInventoryItemDto.ExpiryDate;
        if (updateInventoryItemDto.BatchNumber != null)
            item.BatchNumber = updateInventoryItemDto.BatchNumber;
        if (updateInventoryItemDto.Manufacturer != null)
            item.Manufacturer = updateInventoryItemDto.Manufacturer;
        if (updateInventoryItemDto.StorageLocation != null)
            item.StorageLocation = updateInventoryItemDto.StorageLocation;
        if (updateInventoryItemDto.RequiresPrescription.HasValue)
            item.RequiresPrescription = updateInventoryItemDto.RequiresPrescription.Value;
        if (updateInventoryItemDto.IsActive.HasValue)
            item.IsActive = updateInventoryItemDto.IsActive.Value;
        if (updateInventoryItemDto.MedicationId.HasValue)
            item.MedicationId = updateInventoryItemDto.MedicationId;
        if (updateInventoryItemDto.SupplierId.HasValue)
            item.SupplierId = updateInventoryItemDto.SupplierId;

        item.UpdatedAt = DateTime.UtcNow;

        await _inventoryItemRepository.UpdateAsync(item);
        _logger.LogInformation("Updated inventory item: {ItemId}", id);
    }

    public async Task DeleteInventoryItemAsync(int id)
    {
        var item = await _inventoryItemRepository.GetInventoryItemWithDetailsAsync(id);
        if (item == null)
        {
            throw new ArgumentException("Inventory item not found");
        }

        // Check if item has stock movements
        var stockMovements = await _stockMovementRepository.GetStockMovementsByItemAsync(id);
        if (stockMovements.Any())
        {
            throw new InvalidOperationException("Cannot delete inventory item with stock movement history. Please deactivate it instead.");
        }

        await _inventoryItemRepository.DeleteAsync(item);
        _logger.LogInformation("Deleted inventory item: {ItemId}", id);
    }

    public async Task AdjustStockAsync(int inventoryItemId, int quantity, string reason, int? userId)
    {
        var item = await _inventoryItemRepository.GetByIdAsync(inventoryItemId);
        if (item == null)
        {
            throw new ArgumentException("Inventory item not found");
        }

        var oldStock = item.CurrentStock;
        item.CurrentStock += quantity;

        if (item.CurrentStock < 0)
        {
            throw new InvalidOperationException("Stock adjustment would result in negative stock");
        }

        item.UpdatedAt = DateTime.UtcNow;
        await _inventoryItemRepository.UpdateAsync(item);

        // Create stock movement record
        var stockMovement = new StockMovement
        {
            MovementType = quantity > 0 ? "Adjustment" : "Adjustment",
            Quantity = Math.Abs(quantity),
            UnitPrice = item.UnitPrice,
            Reason = reason,
            MovementDate = DateTime.UtcNow,
            InventoryItemId = inventoryItemId,
            CreatedByUserId = userId
        };
        await _stockMovementRepository.AddAsync(stockMovement);

        _logger.LogInformation("Adjusted stock for item {ItemId}: {OldStock} -> {NewStock}", inventoryItemId, oldStock, item.CurrentStock);
    }

    private static InventoryItemDto MapToDto(InventoryItem item)
    {
        var now = DateTime.UtcNow;
        var isLowStock = item.CurrentStock <= item.MinimumStockLevel && item.CurrentStock > 0;
        var isExpired = item.ExpiryDate.HasValue && item.ExpiryDate.Value < now;
        var isOutOfStock = item.CurrentStock == 0;

        string stockStatus = isOutOfStock ? "OutOfStock" :
                            isExpired ? "Expired" :
                            isLowStock ? "LowStock" : "InStock";

        return new InventoryItemDto
        {
            Id = item.Id,
            ItemCode = item.ItemCode,
            Name = item.Name,
            Description = item.Description,
            Category = item.Category,
            Unit = item.Unit,
            UnitPrice = item.UnitPrice,
            SellingPrice = item.SellingPrice,
            CurrentStock = item.CurrentStock,
            MinimumStockLevel = item.MinimumStockLevel,
            MaximumStockLevel = item.MaximumStockLevel,
            ReorderQuantity = item.ReorderQuantity,
            ExpiryDate = item.ExpiryDate,
            BatchNumber = item.BatchNumber,
            Manufacturer = item.Manufacturer,
            StorageLocation = item.StorageLocation,
            RequiresPrescription = item.RequiresPrescription,
            IsActive = item.IsActive,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt,
            MedicationId = item.MedicationId,
            MedicationName = item.Medication?.Name,
            SupplierId = item.SupplierId,
            SupplierName = item.Supplier?.Name,
            StockStatus = stockStatus,
            IsLowStock = isLowStock,
            IsExpired = isExpired
        };
    }
}

