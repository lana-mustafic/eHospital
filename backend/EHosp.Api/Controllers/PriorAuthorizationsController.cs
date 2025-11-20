using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PriorAuthorizationsController : ControllerBase
{
    private readonly IPriorAuthorizationService _priorAuthService;
    private readonly ILogger<PriorAuthorizationsController> _logger;

    public PriorAuthorizationsController(
        IPriorAuthorizationService priorAuthService,
        ILogger<PriorAuthorizationsController> logger)
    {
        _priorAuthService = priorAuthService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<IEnumerable<PriorAuthorizationDto>>> GetAllPriorAuthorizations()
    {
        var authorizations = await _priorAuthService.GetAllPriorAuthorizationsAsync();
        return Ok(authorizations);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<PriorAuthorizationDto>> GetPriorAuthorization(int id)
    {
        var authorization = await _priorAuthService.GetPriorAuthorizationByIdAsync(id);
        if (authorization == null)
        {
            return NotFound();
        }
        return Ok(authorization);
    }

    [HttpGet("patient/{patientId}")]
    [Authorize(Roles = "Admin,Receptionist,Patient")]
    public async Task<ActionResult<IEnumerable<PriorAuthorizationDto>>> GetPriorAuthorizationsByPatient(int patientId)
    {
        var authorizations = await _priorAuthService.GetPriorAuthorizationsByPatientAsync(patientId);
        return Ok(authorizations);
    }

    [HttpGet("status/{status}")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<IEnumerable<PriorAuthorizationDto>>> GetPriorAuthorizationsByStatus(string status)
    {
        var authorizations = await _priorAuthService.GetPriorAuthorizationsByStatusAsync(status);
        return Ok(authorizations);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<PriorAuthorizationDto>> CreatePriorAuthorization(CreatePriorAuthorizationDto createDto)
    {
        try
        {
            var authorization = await _priorAuthService.CreatePriorAuthorizationAsync(createDto);
            return CreatedAtAction(nameof(GetPriorAuthorization), new { id = authorization.Id }, authorization);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<IActionResult> UpdatePriorAuthorization(int id, UpdatePriorAuthorizationDto updateDto)
    {
        try
        {
            await _priorAuthService.UpdatePriorAuthorizationAsync(id, updateDto);
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

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeletePriorAuthorization(int id)
    {
        try
        {
            await _priorAuthService.DeletePriorAuthorizationAsync(id);
            return NoContent();
        }
        catch (ArgumentException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

