using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientInsurancesController : ControllerBase
{
    private readonly IPatientInsuranceService _patientInsuranceService;
    private readonly ILogger<PatientInsurancesController> _logger;

    public PatientInsurancesController(
        IPatientInsuranceService patientInsuranceService,
        ILogger<PatientInsurancesController> logger)
    {
        _patientInsuranceService = patientInsuranceService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<IEnumerable<PatientInsuranceDto>>> GetAllPatientInsurances()
    {
        var insurances = await _patientInsuranceService.GetAllPatientInsurancesAsync();
        return Ok(insurances);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Receptionist,Patient")]
    public async Task<ActionResult<PatientInsuranceDto>> GetPatientInsurance(int id)
    {
        var insurance = await _patientInsuranceService.GetPatientInsuranceByIdAsync(id);
        if (insurance == null)
        {
            return NotFound();
        }
        return Ok(insurance);
    }

    [HttpGet("patient/{patientId}")]
    [Authorize(Roles = "Admin,Receptionist,Patient")]
    public async Task<ActionResult<IEnumerable<PatientInsuranceDto>>> GetPatientInsurancesByPatient(int patientId, [FromQuery] bool activeOnly = false)
    {
        var insurances = activeOnly
            ? await _patientInsuranceService.GetActivePatientInsurancesByPatientAsync(patientId)
            : await _patientInsuranceService.GetPatientInsurancesByPatientAsync(patientId);
        return Ok(insurances);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<PatientInsuranceDto>> CreatePatientInsurance(CreatePatientInsuranceDto createDto)
    {
        try
        {
            var insurance = await _patientInsuranceService.CreatePatientInsuranceAsync(createDto);
            return CreatedAtAction(nameof(GetPatientInsurance), new { id = insurance.Id }, insurance);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<IActionResult> UpdatePatientInsurance(int id, UpdatePatientInsuranceDto updateDto)
    {
        try
        {
            await _patientInsuranceService.UpdatePatientInsuranceAsync(id, updateDto);
            return NoContent();
        }
        catch (ArgumentException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/verify")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<PatientInsuranceDto>> VerifyInsurance(int id, VerifyInsuranceDto verifyDto)
    {
        try
        {
            var insurance = await _patientInsuranceService.VerifyInsuranceAsync(id, verifyDto);
            return Ok(insurance);
        }
        catch (ArgumentException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeletePatientInsurance(int id)
    {
        try
        {
            await _patientInsuranceService.DeletePatientInsuranceAsync(id);
            return NoContent();
        }
        catch (ArgumentException)
        {
            return NotFound();
        }
    }
}

