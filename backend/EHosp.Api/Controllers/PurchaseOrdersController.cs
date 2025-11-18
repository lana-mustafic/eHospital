using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PurchaseOrdersController : ControllerBase
{
    private readonly IPurchaseOrderService _purchaseOrderService;
    private readonly ILogger<PurchaseOrdersController> _logger;

    public PurchaseOrdersController(IPurchaseOrderService purchaseOrderService, ILogger<PurchaseOrdersController> logger)
    {
        _purchaseOrderService = purchaseOrderService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PurchaseOrderDto>>> GetPurchaseOrders()
    {
        var orders = await _purchaseOrderService.GetAllPurchaseOrdersAsync();
        return Ok(orders);
    }

    [HttpGet("supplier/{supplierId}")]
    public async Task<ActionResult<IEnumerable<PurchaseOrderDto>>> GetPurchaseOrdersBySupplier(int supplierId)
    {
        var orders = await _purchaseOrderService.GetPurchaseOrdersBySupplierAsync(supplierId);
        return Ok(orders);
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<PurchaseOrderDto>>> GetPurchaseOrdersByStatus(string status)
    {
        var orders = await _purchaseOrderService.GetPurchaseOrdersByStatusAsync(status);
        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PurchaseOrderDto>> GetPurchaseOrder(int id)
    {
        var order = await _purchaseOrderService.GetPurchaseOrderByIdAsync(id);
        if (order == null)
        {
            return NotFound();
        }
        return Ok(order);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PurchaseOrderDto>> CreatePurchaseOrder(CreatePurchaseOrderDto createPurchaseOrderDto)
    {
        try
        {
            var order = await _purchaseOrderService.CreatePurchaseOrderAsync(createPurchaseOrderDto);
            return CreatedAtAction(nameof(GetPurchaseOrder), new { id = order.Id }, order);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating purchase order");
            return BadRequest(new { message = "Error creating purchase order", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdatePurchaseOrder(int id, UpdatePurchaseOrderDto updatePurchaseOrderDto)
    {
        try
        {
            await _purchaseOrderService.UpdatePurchaseOrderAsync(id, updatePurchaseOrderDto);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating purchase order");
            return BadRequest(new { message = "Error updating purchase order", error = ex.Message });
        }
    }

    [HttpPost("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApprovePurchaseOrder(int id, [FromBody] ApproveOrderRequest request)
    {
        try
        {
            await _purchaseOrderService.ApprovePurchaseOrderAsync(id, request.ApprovedByUserId);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving purchase order");
            return BadRequest(new { message = "Error approving purchase order", error = ex.Message });
        }
    }

    [HttpPost("{id}/receive")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ReceivePurchaseOrder(int id, ReceivePurchaseOrderDto receiveDto)
    {
        try
        {
            await _purchaseOrderService.ReceivePurchaseOrderAsync(id, receiveDto);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error receiving purchase order");
            return BadRequest(new { message = "Error receiving purchase order", error = ex.Message });
        }
    }

    [HttpPost("{id}/cancel")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CancelPurchaseOrder(int id)
    {
        try
        {
            await _purchaseOrderService.CancelPurchaseOrderAsync(id);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling purchase order");
            return BadRequest(new { message = "Error cancelling purchase order", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeletePurchaseOrder(int id)
    {
        try
        {
            await _purchaseOrderService.DeletePurchaseOrderAsync(id);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting purchase order");
            return BadRequest(new { message = "Error deleting purchase order", error = ex.Message });
        }
    }

    public class ApproveOrderRequest
    {
        public int ApprovedByUserId { get; set; }
    }
}

