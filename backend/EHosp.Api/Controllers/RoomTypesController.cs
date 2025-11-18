using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoomTypesController : ControllerBase
{
    private readonly IRoomTypeService _roomTypeService;
    private readonly ILogger<RoomTypesController> _logger;

    public RoomTypesController(IRoomTypeService roomTypeService, ILogger<RoomTypesController> logger)
    {
        _roomTypeService = roomTypeService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomTypeDto>>> GetRoomTypes()
    {
        var roomTypes = await _roomTypeService.GetAllRoomTypesAsync();
        return Ok(roomTypes);
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<RoomTypeDto>>> GetActiveRoomTypes()
    {
        var roomTypes = await _roomTypeService.GetActiveRoomTypesAsync();
        return Ok(roomTypes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RoomTypeDto>> GetRoomType(int id)
    {
        var roomType = await _roomTypeService.GetRoomTypeByIdAsync(id);
        if (roomType == null)
        {
            return NotFound();
        }
        return Ok(roomType);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RoomTypeDto>> CreateRoomType(CreateRoomTypeDto createRoomTypeDto)
    {
        try
        {
            var roomType = await _roomTypeService.CreateRoomTypeAsync(createRoomTypeDto);
            return CreatedAtAction(nameof(GetRoomType), new { id = roomType.Id }, roomType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating room type");
            return BadRequest(new { message = "Error creating room type", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRoomType(int id, UpdateRoomTypeDto updateRoomTypeDto)
    {
        try
        {
            await _roomTypeService.UpdateRoomTypeAsync(id, updateRoomTypeDto);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating room type");
            return BadRequest(new { message = "Error updating room type", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteRoomType(int id)
    {
        try
        {
            await _roomTypeService.DeleteRoomTypeAsync(id);
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
            _logger.LogError(ex, "Error deleting room type");
            return BadRequest(new { message = "Error deleting room type", error = ex.Message });
        }
    }
}

