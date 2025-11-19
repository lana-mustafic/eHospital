using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EDVisitsController : ControllerBase
{
    private readonly IEDVisitService _edVisitService;
    private readonly ILogger<EDVisitsController> _logger;

    public EDVisitsController(IEDVisitService edVisitService, ILogger<EDVisitsController> logger)
    {
        _edVisitService = edVisitService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Doctor,Nurse,Receptionist")]
    public async Task<ActionResult<IEnumerable<EDVisitDto>>> GetAllVisits(
        [FromQuery] string? status = null,
        [FromQuery] string? priority = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        IEnumerable<EDVisitDto> visits;

        if (startDate.HasValue && endDate.HasValue)
        {
            visits = await _edVisitService.GetByDateRangeAsync(startDate.Value, endDate.Value);
        }
        else if (!string.IsNullOrEmpty(status))
        {
            visits = await _edVisitService.GetByStatusAsync(status);
        }
        else if (!string.IsNullOrEmpty(priority))
        {
            visits = await _edVisitService.GetByTriagePriorityAsync(priority);
        }
        else
        {
            visits = await _edVisitService.GetAllVisitsAsync();
        }

        return Ok(visits);
    }

    [HttpGet("active")]
    [Authorize(Roles = "Admin,Doctor,Nurse,Receptionist")]
    public async Task<ActionResult<IEnumerable<EDVisitDto>>> GetActiveVisits()
    {
        var visits = await _edVisitService.GetActiveVisitsAsync();
        return Ok(visits);
    }

    [HttpGet("statistics")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<ActionResult<Dictionary<string, int>>> GetStatistics()
    {
        var statistics = await _edVisitService.GetEDStatisticsAsync();
        return Ok(statistics);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Doctor,Nurse,Receptionist")]
    public async Task<ActionResult<EDVisitDto>> GetVisitById(int id)
    {
        var visit = await _edVisitService.GetVisitByIdAsync(id);
        if (visit == null)
        {
            return NotFound();
        }
        return Ok(visit);
    }

    [HttpGet("patient/{patientId}")]
    [Authorize(Roles = "Admin,Doctor,Nurse,Receptionist")]
    public async Task<ActionResult<IEnumerable<EDVisitDto>>> GetVisitsByPatient(int patientId)
    {
        var visits = await _edVisitService.GetByPatientAsync(patientId);
        return Ok(visits);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Nurse,Receptionist")]
    public async Task<ActionResult<EDVisitDto>> CreateVisit(CreateEDVisitDto createDto)
    {
        try
        {
            var visit = await _edVisitService.CreateVisitAsync(createDto);
            return CreatedAtAction(nameof(GetVisitById), new { id = visit.Id }, visit);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating ED visit");
            return StatusCode(500, new { message = "Error creating ED visit", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<ActionResult<EDVisitDto>> UpdateVisit(int id, UpdateEDVisitDto updateDto)
    {
        try
        {
            var visit = await _edVisitService.UpdateVisitAsync(id, updateDto);
            return Ok(visit);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating ED visit");
            return StatusCode(500, new { message = "Error updating ED visit", error = ex.Message });
        }
    }

    [HttpPost("{id}/triage")]
    [Authorize(Roles = "Admin,Nurse")]
    public async Task<ActionResult<EDVisitDto>> PerformTriage(int id, TriageDto triageDto)
    {
        try
        {
            var visit = await _edVisitService.PerformTriageAsync(id, triageDto);
            return Ok(visit);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing triage");
            return StatusCode(500, new { message = "Error performing triage", error = ex.Message });
        }
    }

    [HttpPost("{id}/start-treatment")]
    [Authorize(Roles = "Admin,Doctor")]
    public async Task<ActionResult<EDVisitDto>> StartTreatment(int id, [FromBody] int doctorId)
    {
        try
        {
            var visit = await _edVisitService.StartTreatmentAsync(id, doctorId);
            return Ok(visit);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting treatment");
            return StatusCode(500, new { message = "Error starting treatment", error = ex.Message });
        }
    }

    [HttpPost("{id}/discharge")]
    [Authorize(Roles = "Admin,Doctor")]
    public async Task<ActionResult<EDVisitDto>> DischargePatient(int id, [FromBody] DischargeRequest request)
    {
        try
        {
            var visit = await _edVisitService.DischargePatientAsync(id, request.Disposition, request.Notes);
            return Ok(visit);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error discharging patient");
            return StatusCode(500, new { message = "Error discharging patient", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteVisit(int id)
    {
        try
        {
            await _edVisitService.DeleteVisitAsync(id);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting ED visit");
            return StatusCode(500, new { message = "Error deleting ED visit", error = ex.Message });
        }
    }
}

public class DischargeRequest
{
    public string Disposition { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

