using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class PurchaseOrderService : IPurchaseOrderService
{
    private readonly IPurchaseOrderRepository _purchaseOrderRepository;
    private readonly ISupplierRepository _supplierRepository;
    private readonly IInventoryItemRepository _inventoryItemRepository;
    private readonly IStockMovementRepository _stockMovementRepository;
    private readonly ILogger<PurchaseOrderService> _logger;
    private readonly IAuditService _auditService;

    public PurchaseOrderService(
        IPurchaseOrderRepository purchaseOrderRepository,
        ISupplierRepository supplierRepository,
        IInventoryItemRepository inventoryItemRepository,
        IStockMovementRepository stockMovementRepository,
        ILogger<PurchaseOrderService> logger,
        IAuditService auditService)
    {
        _purchaseOrderRepository = purchaseOrderRepository;
        _supplierRepository = supplierRepository;
        _inventoryItemRepository = inventoryItemRepository;
        _stockMovementRepository = stockMovementRepository;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<IEnumerable<PurchaseOrderDto>> GetAllPurchaseOrdersAsync()
    {
        var orders = await _purchaseOrderRepository.GetAllPurchaseOrdersWithDetailsAsync();
        return orders.Select(MapToDto);
    }

    public async Task<PurchaseOrderDto?> GetPurchaseOrderByIdAsync(int id)
    {
        var order = await _purchaseOrderRepository.GetPurchaseOrderWithDetailsAsync(id);
        return order != null ? MapToDto(order) : null;
    }

    public async Task<IEnumerable<PurchaseOrderDto>> GetPurchaseOrdersBySupplierAsync(int supplierId)
    {
        var orders = await _purchaseOrderRepository.GetPurchaseOrdersBySupplierAsync(supplierId);
        return orders.Select(MapToDto);
    }

    public async Task<IEnumerable<PurchaseOrderDto>> GetPurchaseOrdersByStatusAsync(string status)
    {
        var orders = await _purchaseOrderRepository.GetPurchaseOrdersByStatusAsync(status);
        return orders.Select(MapToDto);
    }

    public async Task<PurchaseOrderDto> CreatePurchaseOrderAsync(CreatePurchaseOrderDto createPurchaseOrderDto)
    {
        // Verify supplier exists
        var supplier = await _supplierRepository.GetByIdAsync(createPurchaseOrderDto.SupplierId);
        if (supplier == null)
        {
            throw new ArgumentException("Supplier not found");
        }

        if (createPurchaseOrderDto.Items == null || !createPurchaseOrderDto.Items.Any())
        {
            throw new InvalidOperationException("Purchase order must have at least one item");
        }

        // Generate order number
        var orderNumber = await _purchaseOrderRepository.GenerateOrderNumberAsync();

        var purchaseOrder = new PurchaseOrder
        {
            OrderNumber = orderNumber,
            OrderDate = createPurchaseOrderDto.OrderDate,
            ExpectedDeliveryDate = createPurchaseOrderDto.ExpectedDeliveryDate,
            Status = "Pending",
            Notes = createPurchaseOrderDto.Notes,
            SupplierId = createPurchaseOrderDto.SupplierId,
            CreatedByUserId = createPurchaseOrderDto.CreatedByUserId
        };

        decimal totalAmount = 0;
        foreach (var itemDto in createPurchaseOrderDto.Items)
        {
            // Verify inventory item exists
            var inventoryItem = await _inventoryItemRepository.GetByIdAsync(itemDto.InventoryItemId);
            if (inventoryItem == null)
            {
                throw new ArgumentException($"Inventory item with ID {itemDto.InventoryItemId} not found");
            }

            var discount = itemDto.DiscountPercent ?? 0;
            var lineTotal = itemDto.Quantity * itemDto.UnitPrice * (1 - discount / 100);

            var orderItem = new PurchaseOrderItem
            {
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                DiscountPercent = discount,
                LineTotal = lineTotal,
                ExpiryDate = itemDto.ExpiryDate,
                BatchNumber = itemDto.BatchNumber,
                Notes = itemDto.Notes,
                InventoryItemId = itemDto.InventoryItemId
            };

            purchaseOrder.Items.Add(orderItem);
            totalAmount += lineTotal;
        }

        purchaseOrder.TotalAmount = totalAmount;
        purchaseOrder.GrandTotal = totalAmount;

        var createdOrder = await _purchaseOrderRepository.AddAsync(purchaseOrder);
        _logger.LogInformation("Created purchase order: {OrderNumber}", createdOrder.OrderNumber);
        await _auditService.WriteAsync(createPurchaseOrderDto.CreatedByUserId?.ToString() ?? "system", "User", "Create", "PurchaseOrder", createdOrder.Id.ToString(), $"Created purchase order {createdOrder.OrderNumber}");

        var orderWithDetails = await _purchaseOrderRepository.GetPurchaseOrderWithDetailsAsync(createdOrder.Id);
        return MapToDto(orderWithDetails!);
    }

    public async Task UpdatePurchaseOrderAsync(int id, UpdatePurchaseOrderDto updatePurchaseOrderDto)
    {
        var order = await _purchaseOrderRepository.GetPurchaseOrderWithDetailsAsync(id);
        if (order == null)
        {
            throw new ArgumentException("Purchase order not found");
        }

        if (order.Status != "Pending")
        {
            throw new InvalidOperationException("Can only update pending purchase orders");
        }

        if (updatePurchaseOrderDto.ExpectedDeliveryDate.HasValue)
            order.ExpectedDeliveryDate = updatePurchaseOrderDto.ExpectedDeliveryDate;
        if (!string.IsNullOrEmpty(updatePurchaseOrderDto.Notes))
            order.Notes = updatePurchaseOrderDto.Notes;

        order.UpdatedAt = DateTime.UtcNow;
        await _purchaseOrderRepository.UpdateAsync(order);
        _logger.LogInformation("Updated purchase order: {OrderId}", id);
    }

    public async Task ApprovePurchaseOrderAsync(int id, int approvedByUserId)
    {
        var order = await _purchaseOrderRepository.GetPurchaseOrderWithDetailsAsync(id);
        if (order == null)
        {
            throw new ArgumentException("Purchase order not found");
        }

        if (order.Status != "Pending")
        {
            throw new InvalidOperationException("Can only approve pending purchase orders");
        }

        order.Status = "Approved";
        order.ApprovedByUserId = approvedByUserId;
        order.UpdatedAt = DateTime.UtcNow;

        await _purchaseOrderRepository.UpdateAsync(order);
        _logger.LogInformation("Approved purchase order: {OrderNumber}", order.OrderNumber);
        await _auditService.WriteAsync(approvedByUserId.ToString(), "User", "Approve", "PurchaseOrder", id.ToString(), $"Approved purchase order {order.OrderNumber}");
    }

    public async Task ReceivePurchaseOrderAsync(int id, ReceivePurchaseOrderDto receiveDto)
    {
        var order = await _purchaseOrderRepository.GetPurchaseOrderWithDetailsAsync(id);
        if (order == null)
        {
            throw new ArgumentException("Purchase order not found");
        }

        if (order.Status != "Approved" && order.Status != "Ordered")
        {
            throw new InvalidOperationException("Can only receive approved or ordered purchase orders");
        }

        foreach (var receivedItem in receiveDto.Items)
        {
            var orderItem = order.Items.FirstOrDefault(i => i.Id == receivedItem.PurchaseOrderItemId);
            if (orderItem == null)
            {
                throw new ArgumentException($"Purchase order item with ID {receivedItem.PurchaseOrderItemId} not found");
            }

            if (receivedItem.ReceivedQuantity > orderItem.Quantity)
            {
                throw new InvalidOperationException($"Received quantity cannot exceed ordered quantity for item {orderItem.InventoryItem.Name}");
            }

            orderItem.ReceivedQuantity = receivedItem.ReceivedQuantity;
            if (receivedItem.ExpiryDate.HasValue)
                orderItem.ExpiryDate = receivedItem.ExpiryDate;
            if (!string.IsNullOrEmpty(receivedItem.BatchNumber))
                orderItem.BatchNumber = receivedItem.BatchNumber;

            // Update inventory stock
            var inventoryItem = await _inventoryItemRepository.GetByIdAsync(orderItem.InventoryItemId);
            if (inventoryItem != null)
            {
                inventoryItem.CurrentStock += receivedItem.ReceivedQuantity;
                if (receivedItem.ExpiryDate.HasValue && (!inventoryItem.ExpiryDate.HasValue || receivedItem.ExpiryDate < inventoryItem.ExpiryDate))
                {
                    inventoryItem.ExpiryDate = receivedItem.ExpiryDate;
                }
                if (!string.IsNullOrEmpty(receivedItem.BatchNumber))
                {
                    inventoryItem.BatchNumber = receivedItem.BatchNumber;
                }
                inventoryItem.UpdatedAt = DateTime.UtcNow;
                await _inventoryItemRepository.UpdateAsync(inventoryItem);

                // Create stock movement
                var stockMovement = new StockMovement
                {
                    MovementType = "In",
                    Quantity = receivedItem.ReceivedQuantity,
                    UnitPrice = orderItem.UnitPrice,
                    Reason = "Purchase Order Receipt",
                    ReferenceNumber = order.OrderNumber,
                    BatchNumber = receivedItem.BatchNumber,
                    ExpiryDate = receivedItem.ExpiryDate,
                    MovementDate = receiveDto.ReceivedDate,
                    InventoryItemId = inventoryItem.Id,
                    CreatedByUserId = receiveDto.ReceivedByUserId
                };
                await _stockMovementRepository.AddAsync(stockMovement);
            }
        }

        // Check if all items are fully received
        var allReceived = order.Items.All(i => i.ReceivedQuantity.HasValue && i.ReceivedQuantity >= i.Quantity);
        order.Status = allReceived ? "Received" : "Partially Received";
        order.ReceivedDate = receiveDto.ReceivedDate;
        order.ReceivedByUserId = receiveDto.ReceivedByUserId;
        order.UpdatedAt = DateTime.UtcNow;

        await _purchaseOrderRepository.UpdateAsync(order);
        _logger.LogInformation("Received purchase order: {OrderNumber}", order.OrderNumber);
        await _auditService.WriteAsync(receiveDto.ReceivedByUserId.ToString(), "User", "Receive", "PurchaseOrder", id.ToString(), $"Received purchase order {order.OrderNumber}");
    }

    public async Task CancelPurchaseOrderAsync(int id)
    {
        var order = await _purchaseOrderRepository.GetPurchaseOrderWithDetailsAsync(id);
        if (order == null)
        {
            throw new ArgumentException("Purchase order not found");
        }

        if (order.Status == "Received" || order.Status == "Cancelled")
        {
            throw new InvalidOperationException("Cannot cancel a received or already cancelled purchase order");
        }

        order.Status = "Cancelled";
        order.UpdatedAt = DateTime.UtcNow;

        await _purchaseOrderRepository.UpdateAsync(order);
        _logger.LogInformation("Cancelled purchase order: {OrderNumber}", order.OrderNumber);
    }

    public async Task DeletePurchaseOrderAsync(int id)
    {
        var order = await _purchaseOrderRepository.GetPurchaseOrderWithDetailsAsync(id);
        if (order == null)
        {
            throw new ArgumentException("Purchase order not found");
        }

        if (order.Status != "Pending" && order.Status != "Cancelled")
        {
            throw new InvalidOperationException("Can only delete pending or cancelled purchase orders");
        }

        await _purchaseOrderRepository.DeleteAsync(order);
        _logger.LogInformation("Deleted purchase order: {OrderId}", id);
    }

    private static PurchaseOrderDto MapToDto(PurchaseOrder order)
    {
        return new PurchaseOrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            OrderDate = order.OrderDate,
            ExpectedDeliveryDate = order.ExpectedDeliveryDate,
            ReceivedDate = order.ReceivedDate,
            Status = order.Status,
            TotalAmount = order.TotalAmount,
            DiscountAmount = order.DiscountAmount,
            TaxAmount = order.TaxAmount,
            GrandTotal = order.GrandTotal,
            Notes = order.Notes,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            SupplierId = order.SupplierId,
            SupplierName = order.Supplier?.Name,
            CreatedByUserId = order.CreatedByUserId,
            CreatedByUserName = order.CreatedBy != null ? $"{order.CreatedBy.FirstName} {order.CreatedBy.LastName}" : null,
            ApprovedByUserId = order.ApprovedByUserId,
            ApprovedByUserName = order.ApprovedBy != null ? $"{order.ApprovedBy.FirstName} {order.ApprovedBy.LastName}" : null,
            ReceivedByUserId = order.ReceivedByUserId,
            ReceivedByUserName = order.ReceivedBy != null ? $"{order.ReceivedBy.FirstName} {order.ReceivedBy.LastName}" : null,
            Items = order.Items.Select(item => new PurchaseOrderItemDto
            {
                Id = item.Id,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                DiscountPercent = item.DiscountPercent,
                LineTotal = item.LineTotal,
                ReceivedQuantity = item.ReceivedQuantity,
                ExpiryDate = item.ExpiryDate,
                BatchNumber = item.BatchNumber,
                Notes = item.Notes,
                PurchaseOrderId = item.PurchaseOrderId,
                InventoryItemId = item.InventoryItemId,
                InventoryItemName = item.InventoryItem?.Name,
                InventoryItemCode = item.InventoryItem?.ItemCode
            }).ToList()
        };
    }
}

