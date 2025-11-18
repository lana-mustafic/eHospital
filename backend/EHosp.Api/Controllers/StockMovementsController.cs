using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StockMovementsController : ControllerBase
{
    private readonly IStockMovementService _stockMovementService;
    private readonly ILogger<StockMovementsController> _logger;

    public StockMovementsController(IStockMovementService stockMovementService, ILogger<StockMovementsController> logger)
    {
        _stockMovementService = stockMovementService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StockMovementDto>>> GetStockMovements()
    {
        var movements = await _stockMovementService.GetAllStockMovementsAsync();
        return Ok(movements);
    }

    [HttpGet("item/{inventoryItemId}")]
    public async Task<ActionResult<IEnumerable<StockMovementDto>>> GetStockMovementsByItem(int inventoryItemId)
    {
        var movements = await _stockMovementService.GetStockMovementsByItemAsync(inventoryItemId);
        return Ok(movements);
    }

    [HttpGet("type/{movementType}")]
    public async Task<ActionResult<IEnumerable<StockMovementDto>>> GetStockMovementsByType(string movementType)
    {
        var movements = await _stockMovementService.GetStockMovementsByTypeAsync(movementType);
        return Ok(movements);
    }

    [HttpGet("date-range")]
    public async Task<ActionResult<IEnumerable<StockMovementDto>>> GetStockMovementsByDateRange(
        [FromQuery] DateTime startDate, 
        [FromQuery] DateTime endDate)
    {
        var movements = await _stockMovementService.GetStockMovementsByDateRangeAsync(startDate, endDate);
        return Ok(movements);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StockMovementDto>> GetStockMovement(int id)
    {
        var movement = await _stockMovementService.GetStockMovementByIdAsync(id);
        if (movement == null)
        {
            return NotFound();
        }
        return Ok(movement);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<ActionResult<StockMovementDto>> CreateStockMovement(CreateStockMovementDto createStockMovementDto)
    {
        try
        {
            var movement = await _stockMovementService.CreateStockMovementAsync(createStockMovementDto);
            return CreatedAtAction(nameof(GetStockMovement), new { id = movement.Id }, movement);
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
            _logger.LogError(ex, "Error creating stock movement");
            return BadRequest(new { message = "Error creating stock movement", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteStockMovement(int id)
    {
        try
        {
            await _stockMovementService.DeleteStockMovementAsync(id);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting stock movement");
            return BadRequest(new { message = "Error deleting stock movement", error = ex.Message });
        }
    }
}

