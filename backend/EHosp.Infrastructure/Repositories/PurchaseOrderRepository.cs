using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class PurchaseOrderRepository : BaseRepository<PurchaseOrder>, IPurchaseOrderRepository
{
    public PurchaseOrderRepository(ApplicationDbContext context) : base(context) { }

    public async Task<PurchaseOrder?> GetPurchaseOrderWithDetailsAsync(int id)
        => await _dbSet.Include(po => po.Supplier)
                      .Include(po => po.CreatedBy)
                      .Include(po => po.ApprovedBy)
                      .Include(po => po.ReceivedBy)
                      .Include(po => po.Items)
                      .ThenInclude(item => item.InventoryItem)
                      .FirstOrDefaultAsync(po => po.Id == id);

    public async Task<IEnumerable<PurchaseOrder>> GetAllPurchaseOrdersWithDetailsAsync()
        => await _dbSet.Include(po => po.Supplier)
                      .Include(po => po.CreatedBy)
                      .Include(po => po.Items)
                      .ThenInclude(item => item.InventoryItem)
                      .OrderByDescending(po => po.OrderDate)
                      .ToListAsync();

    public async Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersBySupplierAsync(int supplierId)
        => await _dbSet.Include(po => po.Supplier)
                      .Include(po => po.CreatedBy)
                      .Include(po => po.Items)
                      .ThenInclude(item => item.InventoryItem)
                      .Where(po => po.SupplierId == supplierId)
                      .OrderByDescending(po => po.OrderDate)
                      .ToListAsync();

    public async Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByStatusAsync(string status)
        => await _dbSet.Include(po => po.Supplier)
                      .Include(po => po.CreatedBy)
                      .Include(po => po.Items)
                      .ThenInclude(item => item.InventoryItem)
                      .Where(po => po.Status == status)
                      .OrderByDescending(po => po.OrderDate)
                      .ToListAsync();

    public async Task<PurchaseOrder?> GetPurchaseOrderByNumberAsync(string orderNumber)
        => await _dbSet.Include(po => po.Supplier)
                      .Include(po => po.Items)
                      .ThenInclude(item => item.InventoryItem)
                      .FirstOrDefaultAsync(po => po.OrderNumber == orderNumber);

    public async Task<string> GenerateOrderNumberAsync()
    {
        var today = DateTime.UtcNow;
        var year = today.Year;
        var month = today.Month.ToString("D2");
        
        // Get the last order number for this month
        var lastOrder = await _dbSet
            .Where(po => po.OrderNumber.StartsWith($"PO{year}{month}"))
            .OrderByDescending(po => po.OrderNumber)
            .FirstOrDefaultAsync();

        int sequence = 1;
        if (lastOrder != null)
        {
            // Extract sequence number from last order (format: PO2024110001)
            var lastSequence = lastOrder.OrderNumber.Substring(8); // After "PO202411"
            if (int.TryParse(lastSequence, out int lastSeq))
            {
                sequence = lastSeq + 1;
            }
        }

        return $"PO{year}{month}{sequence:D4}";
    }
}

