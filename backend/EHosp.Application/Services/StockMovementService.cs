using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class StockMovementService : IStockMovementService
{
    private readonly IStockMovementRepository _stockMovementRepository;
    private readonly IInventoryItemRepository _inventoryItemRepository;
    private readonly ILogger<StockMovementService> _logger;

    public StockMovementService(
        IStockMovementRepository stockMovementRepository,
        IInventoryItemRepository inventoryItemRepository,
        ILogger<StockMovementService> logger)
    {
        _stockMovementRepository = stockMovementRepository;
        _inventoryItemRepository = inventoryItemRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<StockMovementDto>> GetAllStockMovementsAsync()
    {
        var movements = await _stockMovementRepository.GetAllStockMovementsWithDetailsAsync();
        return movements.Select(MapToDto);
    }

    public async Task<StockMovementDto?> GetStockMovementByIdAsync(int id)
    {
        var movement = await _stockMovementRepository.GetStockMovementWithDetailsAsync(id);
        return movement != null ? MapToDto(movement) : null;
    }

    public async Task<IEnumerable<StockMovementDto>> GetStockMovementsByItemAsync(int inventoryItemId)
    {
        var movements = await _stockMovementRepository.GetStockMovementsByItemAsync(inventoryItemId);
        return movements.Select(MapToDto);
    }

    public async Task<IEnumerable<StockMovementDto>> GetStockMovementsByTypeAsync(string movementType)
    {
        var movements = await _stockMovementRepository.GetStockMovementsByTypeAsync(movementType);
        return movements.Select(MapToDto);
    }

    public async Task<IEnumerable<StockMovementDto>> GetStockMovementsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var movements = await _stockMovementRepository.GetStockMovementsByDateRangeAsync(startDate, endDate);
        return movements.Select(MapToDto);
    }

    public async Task<StockMovementDto> CreateStockMovementAsync(CreateStockMovementDto createStockMovementDto)
    {
        // Verify inventory item exists
        var inventoryItem = await _inventoryItemRepository.GetByIdAsync(createStockMovementDto.InventoryItemId);
        if (inventoryItem == null)
        {
            throw new ArgumentException("Inventory item not found");
        }

        // Update stock based on movement type
        var quantityChange = createStockMovementDto.MovementType switch
        {
            "In" or "Return" => createStockMovementDto.Quantity,
            "Out" or "Adjustment" when createStockMovementDto.Quantity < 0 => createStockMovementDto.Quantity,
            "Adjustment" => createStockMovementDto.Quantity, // Can be positive or negative
            _ => -createStockMovementDto.Quantity // Default: Out
        };

        // For Out movements, check if sufficient stock exists
        if (quantityChange < 0 && Math.Abs(quantityChange) > inventoryItem.CurrentStock)
        {
            throw new InvalidOperationException($"Insufficient stock. Available: {inventoryItem.CurrentStock}, Requested: {Math.Abs(quantityChange)}");
        }

        inventoryItem.CurrentStock += quantityChange;
        if (inventoryItem.CurrentStock < 0)
        {
            throw new InvalidOperationException("Stock adjustment would result in negative stock");
        }

        inventoryItem.UpdatedAt = DateTime.UtcNow;
        await _inventoryItemRepository.UpdateAsync(inventoryItem);

        var stockMovement = new StockMovement
        {
            MovementType = createStockMovementDto.MovementType,
            Quantity = Math.Abs(createStockMovementDto.Quantity),
            UnitPrice = createStockMovementDto.UnitPrice ?? inventoryItem.UnitPrice,
            Reason = createStockMovementDto.Reason,
            ReferenceNumber = createStockMovementDto.ReferenceNumber,
            BatchNumber = createStockMovementDto.BatchNumber,
            ExpiryDate = createStockMovementDto.ExpiryDate,
            Notes = createStockMovementDto.Notes,
            MovementDate = createStockMovementDto.MovementDate,
            InventoryItemId = createStockMovementDto.InventoryItemId,
            CreatedByUserId = createStockMovementDto.CreatedByUserId,
            PrescriptionId = createStockMovementDto.PrescriptionId
        };

        var createdMovement = await _stockMovementRepository.AddAsync(stockMovement);
        _logger.LogInformation("Created stock movement: {MovementId} for item {ItemId}", createdMovement.Id, createStockMovementDto.InventoryItemId);

        var movementWithDetails = await _stockMovementRepository.GetStockMovementWithDetailsAsync(createdMovement.Id);
        return MapToDto(movementWithDetails!);
    }

    public async Task DeleteStockMovementAsync(int id)
    {
        var movement = await _stockMovementRepository.GetStockMovementWithDetailsAsync(id);
        if (movement == null)
        {
            throw new ArgumentException("Stock movement not found");
        }

        // Note: Deleting stock movements can affect inventory accuracy
        // In production, you might want to prevent deletion or create a reversal entry instead
        await _stockMovementRepository.DeleteAsync(movement);
        _logger.LogInformation("Deleted stock movement: {MovementId}", id);
    }

    private static StockMovementDto MapToDto(StockMovement movement)
    {
        return new StockMovementDto
        {
            Id = movement.Id,
            MovementType = movement.MovementType,
            Quantity = movement.Quantity,
            UnitPrice = movement.UnitPrice,
            Reason = movement.Reason,
            ReferenceNumber = movement.ReferenceNumber,
            BatchNumber = movement.BatchNumber,
            ExpiryDate = movement.ExpiryDate,
            Notes = movement.Notes,
            MovementDate = movement.MovementDate,
            CreatedAt = movement.CreatedAt,
            InventoryItemId = movement.InventoryItemId,
            InventoryItemName = movement.InventoryItem?.Name,
            InventoryItemCode = movement.InventoryItem?.ItemCode,
            CreatedByUserId = movement.CreatedByUserId,
            CreatedByUserName = movement.CreatedBy != null ? $"{movement.CreatedBy.FirstName} {movement.CreatedBy.LastName}" : null,
            PrescriptionId = movement.PrescriptionId
        };
    }
}

