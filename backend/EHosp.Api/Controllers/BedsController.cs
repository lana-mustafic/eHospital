using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BedsController : ControllerBase
{
    private readonly IBedService _bedService;
    private readonly ILogger<BedsController> _logger;

    public BedsController(IBedService bedService, ILogger<BedsController> logger)
    {
        _bedService = bedService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BedDto>>> GetBeds()
    {
        var beds = await _bedService.GetAllBedsAsync();
        return Ok(beds);
    }

    [HttpGet("available")]
    public async Task<ActionResult<IEnumerable<BedDto>>> GetAvailableBeds()
    {
        var beds = await _bedService.GetAvailableBedsAsync();
        return Ok(beds);
    }

    [HttpGet("room/{roomId}")]
    public async Task<ActionResult<IEnumerable<BedDto>>> GetBedsByRoom(int roomId)
    {
        var beds = await _bedService.GetBedsByRoomAsync(roomId);
        return Ok(beds);
    }

    [HttpGet("room/{roomId}/available")]
    public async Task<ActionResult<IEnumerable<BedDto>>> GetAvailableBedsByRoom(int roomId)
    {
        var beds = await _bedService.GetAvailableBedsByRoomAsync(roomId);
        return Ok(beds);
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<BedDto>>> GetBedsByStatus(string status)
    {
        var beds = await _bedService.GetBedsByStatusAsync(status);
        return Ok(beds);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BedDto>> GetBed(int id)
    {
        var bed = await _bedService.GetBedByIdAsync(id);
        if (bed == null)
        {
            return NotFound();
        }
        return Ok(bed);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<BedDto>> CreateBed(CreateBedDto createBedDto)
    {
        try
        {
            var bed = await _bedService.CreateBedAsync(createBedDto);
            return CreatedAtAction(nameof(GetBed), new { id = bed.Id }, bed);
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
            _logger.LogError(ex, "Error creating bed");
            return BadRequest(new { message = "Error creating bed", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateBed(int id, UpdateBedDto updateBedDto)
    {
        try
        {
            await _bedService.UpdateBedAsync(id, updateBedDto);
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
            _logger.LogError(ex, "Error updating bed");
            return BadRequest(new { message = "Error updating bed", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteBed(int id)
    {
        try
        {
            await _bedService.DeleteBedAsync(id);
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
            _logger.LogError(ex, "Error deleting bed");
            return BadRequest(new { message = "Error deleting bed", error = ex.Message });
        }
    }
}

