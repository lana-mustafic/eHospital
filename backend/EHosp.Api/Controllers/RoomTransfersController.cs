using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoomTransfersController : ControllerBase
{
    private readonly IRoomTransferService _roomTransferService;
    private readonly ILogger<RoomTransfersController> _logger;

    public RoomTransfersController(IRoomTransferService roomTransferService, ILogger<RoomTransfersController> logger)
    {
        _roomTransferService = roomTransferService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomTransferDto>>> GetRoomTransfers()
    {
        var transfers = await _roomTransferService.GetAllRoomTransfersAsync();
        return Ok(transfers);
    }

    [HttpGet("admission/{admissionId}")]
    public async Task<ActionResult<IEnumerable<RoomTransferDto>>> GetRoomTransfersByAdmission(int admissionId)
    {
        var transfers = await _roomTransferService.GetRoomTransfersByAdmissionAsync(admissionId);
        return Ok(transfers);
    }

    [HttpGet("room/{roomId}")]
    public async Task<ActionResult<IEnumerable<RoomTransferDto>>> GetRoomTransfersByRoom(int roomId)
    {
        var transfers = await _roomTransferService.GetRoomTransfersByRoomAsync(roomId);
        return Ok(transfers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RoomTransferDto>> GetRoomTransfer(int id)
    {
        var transfer = await _roomTransferService.GetRoomTransferByIdAsync(id);
        if (transfer == null)
        {
            return NotFound();
        }
        return Ok(transfer);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<ActionResult<RoomTransferDto>> CreateRoomTransfer(CreateRoomTransferDto createRoomTransferDto)
    {
        try
        {
            var transfer = await _roomTransferService.CreateRoomTransferAsync(createRoomTransferDto);
            return CreatedAtAction(nameof(GetRoomTransfer), new { id = transfer.Id }, transfer);
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
            _logger.LogError(ex, "Error creating room transfer");
            return BadRequest(new { message = "Error creating room transfer", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteRoomTransfer(int id)
    {
        try
        {
            await _roomTransferService.DeleteRoomTransferAsync(id);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting room transfer");
            return BadRequest(new { message = "Error deleting room transfer", error = ex.Message });
        }
    }
}

