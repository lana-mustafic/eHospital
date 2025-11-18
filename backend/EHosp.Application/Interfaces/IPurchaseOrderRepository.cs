using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IPurchaseOrderRepository : IRepository<PurchaseOrder>
{
    Task<PurchaseOrder?> GetPurchaseOrderWithDetailsAsync(int id);
    Task<IEnumerable<PurchaseOrder>> GetAllPurchaseOrdersWithDetailsAsync();
    Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersBySupplierAsync(int supplierId);
    Task<IEnumerable<PurchaseOrder>> GetPurchaseOrdersByStatusAsync(string status);
    Task<PurchaseOrder?> GetPurchaseOrderByNumberAsync(string orderNumber);
    Task<string> GenerateOrderNumberAsync();
}

