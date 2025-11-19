using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QueuesController : ControllerBase
{
    private readonly IQueueService _queueService;
    private readonly ILogger<QueuesController> _logger;

    public QueuesController(IQueueService queueService, ILogger<QueuesController> logger)
    {
        _queueService = queueService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Doctor,Nurse,Receptionist")]
    public async Task<ActionResult<IEnumerable<QueueDto>>> GetQueues([FromQuery] int? doctorId, [FromQuery] DateTime? date)
    {
        try
        {
            IEnumerable<QueueDto> queues;
            if (doctorId.HasValue)
            {
                queues = await _queueService.GetQueuesByDoctorAsync(doctorId.Value, date);
            }
            else if (date.HasValue)
            {
                queues = await _queueService.GetQueuesByDateAsync(date.Value);
            }
            else
            {
                queues = await _queueService.GetAllQueuesAsync();
            }
            return Ok(queues);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving queues");
            return BadRequest(new { message = "Error retrieving queues", error = ex.Message });
        }
    }

    [HttpGet("active")]
    [Authorize(Roles = "Admin,Doctor,Nurse,Receptionist")]
    public async Task<ActionResult<IEnumerable<QueueDto>>> GetActiveQueues()
    {
        try
        {
            var queues = await _queueService.GetActiveQueuesAsync();
            return Ok(queues);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active queues");
            return BadRequest(new { message = "Error retrieving active queues", error = ex.Message });
        }
    }

    [HttpGet("doctor/{doctorId}")]
    [Authorize(Roles = "Admin,Doctor,Nurse,Receptionist")]
    public async Task<ActionResult<IEnumerable<QueueDto>>> GetQueuesByDoctor(int doctorId, [FromQuery] DateTime? date)
    {
        try
        {
            var queues = await _queueService.GetQueuesByDoctorAsync(doctorId, date);
            return Ok(queues);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving queues for doctor {DoctorId}", doctorId);
            return BadRequest(new { message = "Error retrieving queues", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Doctor,Nurse,Receptionist")]
    public async Task<ActionResult<QueueDto>> GetQueue(int id)
    {
        try
        {
            var queue = await _queueService.GetQueueByIdAsync(id);
            if (queue == null)
            {
                return NotFound(new { message = "Queue not found" });
            }
            return Ok(queue);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving queue {QueueId}", id);
            return BadRequest(new { message = "Error retrieving queue", error = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<QueueDto>> CreateQueue(CreateQueueDto createQueueDto)
    {
        try
        {
            var queue = await _queueService.CreateQueueAsync(createQueueDto);
            return CreatedAtAction(nameof(GetQueue), new { id = queue.Id }, queue);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating queue");
            return BadRequest(new { message = "Error creating queue", error = ex.Message });
        }
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,Doctor,Nurse,Receptionist")]
    public async Task<ActionResult<QueueDto>> UpdateQueueStatus(int id, UpdateQueueStatusDto updateDto)
    {
        try
        {
            var queue = await _queueService.UpdateQueueStatusAsync(id, updateDto);
            return Ok(queue);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating queue status");
            return BadRequest(new { message = "Error updating queue status", error = ex.Message });
        }
    }

    [HttpPost("doctor/{doctorId}/call-next")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<ActionResult<QueueDto>> CallNextPatient(int doctorId)
    {
        try
        {
            var queue = await _queueService.CallNextPatientAsync(doctorId);
            return Ok(queue);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling next patient for doctor {DoctorId}", doctorId);
            return BadRequest(new { message = "Error calling next patient", error = ex.Message });
        }
    }

    [HttpPut("doctor/{doctorId}/reorder")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<IActionResult> ReorderQueue(int doctorId, ReorderQueueDto reorderDto)
    {
        try
        {
            await _queueService.ReorderQueueAsync(doctorId, reorderDto);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reordering queue for doctor {DoctorId}", doctorId);
            return BadRequest(new { message = "Error reordering queue", error = ex.Message });
        }
    }

    [HttpPut("{id}/skip")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<ActionResult<QueueDto>> SkipQueue(int id)
    {
        try
        {
            var queue = await _queueService.SkipQueueAsync(id);
            return Ok(queue);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error skipping queue {QueueId}", id);
            return BadRequest(new { message = "Error skipping queue", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteQueue(int id)
    {
        try
        {
            var deleted = await _queueService.DeleteQueueAsync(id);
            if (!deleted)
            {
                return NotFound(new { message = "Queue not found" });
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting queue {QueueId}", id);
            return BadRequest(new { message = "Error deleting queue", error = ex.Message });
        }
    }
}

