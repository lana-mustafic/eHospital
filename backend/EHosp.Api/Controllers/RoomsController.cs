using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoomsController : ControllerBase
{
    private readonly IRoomService _roomService;
    private readonly ILogger<RoomsController> _logger;

    public RoomsController(IRoomService roomService, ILogger<RoomsController> logger)
    {
        _roomService = roomService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetRooms()
    {
        var rooms = await _roomService.GetAllRoomsAsync();
        return Ok(rooms);
    }

    [HttpGet("availability")]
    public async Task<ActionResult<IEnumerable<RoomAvailabilityDto>>> GetRoomAvailability()
    {
        var availability = await _roomService.GetRoomAvailabilityAsync();
        return Ok(availability);
    }

    [HttpGet("available")]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetAvailableRooms()
    {
        var rooms = await _roomService.GetAvailableRoomsAsync();
        return Ok(rooms);
    }

    [HttpGet("type/{roomTypeId}")]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetRoomsByType(int roomTypeId)
    {
        var rooms = await _roomService.GetRoomsByTypeAsync(roomTypeId);
        return Ok(rooms);
    }

    [HttpGet("department/{departmentId}")]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetRoomsByDepartment(int departmentId)
    {
        var rooms = await _roomService.GetRoomsByDepartmentAsync(departmentId);
        return Ok(rooms);
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetRoomsByStatus(string status)
    {
        var rooms = await _roomService.GetRoomsByStatusAsync(status);
        return Ok(rooms);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RoomDto>> GetRoom(int id)
    {
        var room = await _roomService.GetRoomByIdAsync(id);
        if (room == null)
        {
            return NotFound();
        }
        return Ok(room);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RoomDto>> CreateRoom(CreateRoomDto createRoomDto)
    {
        try
        {
            var room = await _roomService.CreateRoomAsync(createRoomDto);
            return CreatedAtAction(nameof(GetRoom), new { id = room.Id }, room);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating room");
            return BadRequest(new { message = "Error creating room", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRoom(int id, UpdateRoomDto updateRoomDto)
    {
        try
        {
            await _roomService.UpdateRoomAsync(id, updateRoomDto);
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
            _logger.LogError(ex, "Error updating room");
            return BadRequest(new { message = "Error updating room", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteRoom(int id)
    {
        try
        {
            await _roomService.DeleteRoomAsync(id);
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
            _logger.LogError(ex, "Error deleting room");
            return BadRequest(new { message = "Error deleting room", error = ex.Message });
        }
    }
}

