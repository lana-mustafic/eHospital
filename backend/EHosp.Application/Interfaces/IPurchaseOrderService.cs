using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IPurchaseOrderService
{
    Task<IEnumerable<PurchaseOrderDto>> GetAllPurchaseOrdersAsync();
    Task<PurchaseOrderDto?> GetPurchaseOrderByIdAsync(int id);
    Task<IEnumerable<PurchaseOrderDto>> GetPurchaseOrdersBySupplierAsync(int supplierId);
    Task<IEnumerable<PurchaseOrderDto>> GetPurchaseOrdersByStatusAsync(string status);
    Task<PurchaseOrderDto> CreatePurchaseOrderAsync(CreatePurchaseOrderDto createPurchaseOrderDto);
    Task UpdatePurchaseOrderAsync(int id, UpdatePurchaseOrderDto updatePurchaseOrderDto);
    Task ApprovePurchaseOrderAsync(int id, int approvedByUserId);
    Task ReceivePurchaseOrderAsync(int id, ReceivePurchaseOrderDto receiveDto);
    Task CancelPurchaseOrderAsync(int id);
    Task DeletePurchaseOrderAsync(int id);
}

