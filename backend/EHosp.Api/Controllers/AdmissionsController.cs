using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdmissionsController : ControllerBase
{
    private readonly IAdmissionService _admissionService;
    private readonly ILogger<AdmissionsController> _logger;

    public AdmissionsController(IAdmissionService admissionService, ILogger<AdmissionsController> logger)
    {
        _admissionService = admissionService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AdmissionDto>>> GetAdmissions()
    {
        var admissions = await _admissionService.GetAllAdmissionsAsync();
        return Ok(admissions);
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<AdmissionDto>>> GetActiveAdmissions()
    {
        var admissions = await _admissionService.GetActiveAdmissionsAsync();
        return Ok(admissions);
    }

    [HttpGet("patient/{patientId}")]
    public async Task<ActionResult<IEnumerable<AdmissionDto>>> GetAdmissionsByPatient(int patientId)
    {
        var admissions = await _admissionService.GetAdmissionsByPatientAsync(patientId);
        return Ok(admissions);
    }

    [HttpGet("patient/{patientId}/active")]
    public async Task<ActionResult<AdmissionDto>> GetActiveAdmissionByPatient(int patientId)
    {
        var admission = await _admissionService.GetActiveAdmissionByPatientAsync(patientId);
        if (admission == null)
        {
            return NotFound();
        }
        return Ok(admission);
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<AdmissionDto>>> GetAdmissionsByStatus(string status)
    {
        var admissions = await _admissionService.GetAdmissionsByStatusAsync(status);
        return Ok(admissions);
    }

    [HttpGet("room/{roomId}")]
    public async Task<ActionResult<IEnumerable<AdmissionDto>>> GetAdmissionsByRoom(int roomId)
    {
        var admissions = await _admissionService.GetAdmissionsByRoomAsync(roomId);
        return Ok(admissions);
    }

    [HttpGet("bed/{bedId}")]
    public async Task<ActionResult<IEnumerable<AdmissionDto>>> GetAdmissionsByBed(int bedId)
    {
        var admissions = await _admissionService.GetAdmissionsByBedAsync(bedId);
        return Ok(admissions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AdmissionDto>> GetAdmission(int id)
    {
        var admission = await _admissionService.GetAdmissionByIdAsync(id);
        if (admission == null)
        {
            return NotFound();
        }
        return Ok(admission);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<ActionResult<AdmissionDto>> CreateAdmission(CreateAdmissionDto createAdmissionDto)
    {
        try
        {
            var admission = await _admissionService.CreateAdmissionAsync(createAdmissionDto);
            return CreatedAtAction(nameof(GetAdmission), new { id = admission.Id }, admission);
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
            _logger.LogError(ex, "Error creating admission");
            return BadRequest(new { message = "Error creating admission", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Doctor,Nurse")]
    public async Task<IActionResult> UpdateAdmission(int id, UpdateAdmissionDto updateAdmissionDto)
    {
        try
        {
            await _admissionService.UpdateAdmissionAsync(id, updateAdmissionDto);
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
            _logger.LogError(ex, "Error updating admission");
            return BadRequest(new { message = "Error updating admission", error = ex.Message });
        }
    }

    [HttpPost("{id}/discharge")]
    [Authorize(Roles = "Admin,Doctor")]
    public async Task<IActionResult> DischargePatient(int id, DischargePatientDto dischargeDto)
    {
        try
        {
            await _admissionService.DischargePatientAsync(id, dischargeDto);
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
            _logger.LogError(ex, "Error discharging patient");
            return BadRequest(new { message = "Error discharging patient", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteAdmission(int id)
    {
        try
        {
            await _admissionService.DeleteAdmissionAsync(id);
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
            _logger.LogError(ex, "Error deleting admission");
            return BadRequest(new { message = "Error deleting admission", error = ex.Message });
        }
    }
}

