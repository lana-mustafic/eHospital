using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/clinicaldecisionsupport")]
[Authorize]
public class ClinicalDecisionSupportController : ControllerBase
{
    private readonly IClinicalDecisionSupportService _cdsService;
    private readonly ILogger<ClinicalDecisionSupportController> _logger;

    public ClinicalDecisionSupportController(
        IClinicalDecisionSupportService cdsService,
        ILogger<ClinicalDecisionSupportController> logger)
    {
        _cdsService = cdsService;
        _logger = logger;
    }

    [HttpGet("dashboard")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<ActionResult<CDSDashboardDto>> GetDashboard()
    {
        var dashboard = await _cdsService.GetDashboardAsync();
        return Ok(dashboard);
    }

    [HttpPost("interactions/check")]
    [Authorize(Roles = "Admin,Doctor,Pharmacist")]
    public async Task<ActionResult<CheckInteractionResponseDto>> CheckInteractions([FromBody] CheckInteractionRequestDto request)
    {
        try
        {
            var result = await _cdsService.CheckInteractionsAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking interactions");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("interactions")]
    [Authorize(Roles = "Admin,Doctor,Pharmacist")]
    public async Task<ActionResult<IEnumerable<DrugInteractionDto>>> GetAllInteractions()
    {
        var interactions = await _cdsService.GetAllInteractionsAsync();
        return Ok(interactions);
    }

    [HttpGet("interactions/medication/{medicationId}")]
    [Authorize(Roles = "Admin,Doctor,Pharmacist")]
    public async Task<ActionResult<IEnumerable<DrugInteractionDto>>> GetInteractionsByMedication(int medicationId)
    {
        var interactions = await _cdsService.GetInteractionsByMedicationAsync(medicationId);
        return Ok(interactions);
    }

    [HttpGet("interactions/patient/{patientId}")]
    [Authorize(Roles = "Admin,Doctor,Pharmacist")]
    public async Task<ActionResult<IEnumerable<DrugInteractionDto>>> GetInteractionsByPatient(int patientId)
    {
        var interactions = await _cdsService.GetInteractionsByPatientAsync(patientId);
        return Ok(interactions);
    }

    [HttpGet("guidelines")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<ActionResult<IEnumerable<ClinicalGuidelineDto>>> GetGuidelines(
        [FromQuery] string? condition,
        [FromQuery] string? category,
        [FromQuery] int? patientId)
    {
        var request = new GetGuidelinesRequestDto
        {
            Condition = condition,
            Category = category,
            PatientId = patientId
        };
        var guidelines = await _cdsService.GetGuidelinesAsync(request);
        return Ok(guidelines);
    }

    [HttpGet("guidelines/{id}")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<ActionResult<ClinicalGuidelineDto>> GetGuidelineById(int id)
    {
        var guideline = await _cdsService.GetGuidelineByIdAsync(id);
        if (guideline == null)
        {
            return NotFound();
        }
        return Ok(guideline);
    }

    [HttpPost("protocols/suggest")]
    [Authorize(Roles = "Admin,Doctor")]
    public async Task<ActionResult<IEnumerable<ProtocolSuggestionDto>>> GetProtocolSuggestions([FromBody] GetProtocolSuggestionsRequestDto request)
    {
        try
        {
            var protocols = await _cdsService.GetProtocolSuggestionsAsync(request);
            return Ok(protocols);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting protocol suggestions");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("protocols")]
    [Authorize(Roles = "Admin,Doctor")]
    public async Task<ActionResult<IEnumerable<ProtocolSuggestionDto>>> GetAllProtocols()
    {
        var protocols = await _cdsService.GetAllProtocolsAsync();
        return Ok(protocols);
    }

    [HttpGet("alerts/critical")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<ActionResult<IEnumerable<CriticalValueAlertDto>>> GetCriticalAlerts()
    {
        var alerts = await _cdsService.GetCriticalAlertsAsync();
        return Ok(alerts);
    }

    [HttpGet("alerts/patient/{patientId}")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<ActionResult<IEnumerable<CriticalValueAlertDto>>> GetAlertsByPatient(int patientId)
    {
        var alerts = await _cdsService.GetAlertsByPatientAsync(patientId);
        return Ok(alerts);
    }

    [HttpPost("alerts/{alertId}/acknowledge")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<IActionResult> AcknowledgeAlert(int alertId, [FromBody] AcknowledgeAlertRequestDto request)
    {
        try
        {
            await _cdsService.AcknowledgeAlertAsync(alertId, request.AcknowledgedBy);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error acknowledging alert");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("reminders")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<ActionResult<IEnumerable<ClinicalGuidelineDto>>> GetReminders([FromQuery] int? patientId)
    {
        var reminders = await _cdsService.GetRemindersAsync(patientId);
        return Ok(reminders);
    }
}

