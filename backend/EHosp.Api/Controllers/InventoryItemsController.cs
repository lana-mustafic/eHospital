using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoryItemsController : ControllerBase
{
    private readonly IInventoryItemService _inventoryItemService;
    private readonly ILogger<InventoryItemsController> _logger;

    public InventoryItemsController(IInventoryItemService inventoryItemService, ILogger<InventoryItemsController> logger)
    {
        _inventoryItemService = inventoryItemService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryItemDto>>> GetInventoryItems()
    {
        var items = await _inventoryItemService.GetAllInventoryItemsAsync();
        return Ok(items);
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<LowStockAlertDto>>> GetLowStockItems()
    {
        var items = await _inventoryItemService.GetLowStockItemsAsync();
        return Ok(items);
    }

    [HttpGet("expiring")]
    public async Task<ActionResult<IEnumerable<ExpiringItemsDto>>> GetExpiringItems([FromQuery] int daysAhead = 30)
    {
        var items = await _inventoryItemService.GetExpiringItemsAsync(daysAhead);
        return Ok(items);
    }

    [HttpGet("out-of-stock")]
    public async Task<ActionResult<IEnumerable<InventoryItemDto>>> GetOutOfStockItems()
    {
        var items = await _inventoryItemService.GetOutOfStockItemsAsync();
        return Ok(items);
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult<IEnumerable<InventoryItemDto>>> GetInventoryItemsByCategory(string category)
    {
        var items = await _inventoryItemService.GetInventoryItemsByCategoryAsync(category);
        return Ok(items);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<InventoryItemDto>>> SearchInventoryItems([FromQuery] string term)
    {
        var items = await _inventoryItemService.SearchInventoryItemsAsync(term);
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InventoryItemDto>> GetInventoryItem(int id)
    {
        var item = await _inventoryItemService.GetInventoryItemByIdAsync(id);
        if (item == null)
        {
            return NotFound();
        }
        return Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<InventoryItemDto>> CreateInventoryItem(CreateInventoryItemDto createInventoryItemDto)
    {
        try
        {
            var item = await _inventoryItemService.CreateInventoryItemAsync(createInventoryItemDto);
            return CreatedAtAction(nameof(GetInventoryItem), new { id = item.Id }, item);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating inventory item");
            return BadRequest(new { message = "Error creating inventory item", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateInventoryItem(int id, UpdateInventoryItemDto updateInventoryItemDto)
    {
        try
        {
            await _inventoryItemService.UpdateInventoryItemAsync(id, updateInventoryItemDto);
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
            _logger.LogError(ex, "Error updating inventory item");
            return BadRequest(new { message = "Error updating inventory item", error = ex.Message });
        }
    }

    [HttpPost("{id}/adjust-stock")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<IActionResult> AdjustStock(int id, [FromBody] AdjustStockRequest request)
    {
        try
        {
            await _inventoryItemService.AdjustStockAsync(id, request.Quantity, request.Reason, request.UserId);
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
            _logger.LogError(ex, "Error adjusting stock");
            return BadRequest(new { message = "Error adjusting stock", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteInventoryItem(int id)
    {
        try
        {
            await _inventoryItemService.DeleteInventoryItemAsync(id);
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
            _logger.LogError(ex, "Error deleting inventory item");
            return BadRequest(new { message = "Error deleting inventory item", error = ex.Message });
        }
    }

    public class AdjustStockRequest
    {
        public int Quantity { get; set; }
        public string Reason { get; set; } = string.Empty;
        public int? UserId { get; set; }
    }
}

