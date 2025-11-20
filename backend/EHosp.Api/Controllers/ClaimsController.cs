using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClaimsController : ControllerBase
{
    private readonly IClaimService _claimService;
    private readonly ILogger<ClaimsController> _logger;

    public ClaimsController(
        IClaimService claimService,
        ILogger<ClaimsController> logger)
    {
        _claimService = claimService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<IEnumerable<ClaimDto>>> GetAllClaims()
    {
        var claims = await _claimService.GetAllClaimsAsync();
        return Ok(claims);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<ClaimDto>> GetClaim(int id)
    {
        var claim = await _claimService.GetClaimByIdAsync(id);
        if (claim == null)
        {
            return NotFound();
        }
        return Ok(claim);
    }

    [HttpGet("patient/{patientId}")]
    [Authorize(Roles = "Admin,Receptionist,Patient")]
    public async Task<ActionResult<IEnumerable<ClaimDto>>> GetClaimsByPatient(int patientId)
    {
        var claims = await _claimService.GetClaimsByPatientAsync(patientId);
        return Ok(claims);
    }

    [HttpGet("invoice/{invoiceId}")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<IEnumerable<ClaimDto>>> GetClaimsByInvoice(int invoiceId)
    {
        var claims = await _claimService.GetClaimsByInvoiceAsync(invoiceId);
        return Ok(claims);
    }

    [HttpGet("status/{status}")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<IEnumerable<ClaimDto>>> GetClaimsByStatus(string status)
    {
        var claims = await _claimService.GetClaimsByStatusAsync(status);
        return Ok(claims);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<ClaimDto>> CreateClaim(CreateClaimDto createDto)
    {
        try
        {
            var claim = await _claimService.CreateClaimAsync(createDto);
            return CreatedAtAction(nameof(GetClaim), new { id = claim.Id }, claim);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<IActionResult> UpdateClaim(int id, UpdateClaimDto updateDto)
    {
        try
        {
            await _claimService.UpdateClaimAsync(id, updateDto);
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

    [HttpPost("{id}/submit")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<ClaimDto>> SubmitClaim(int id, SubmitClaimDto submitDto)
    {
        try
        {
            var claim = await _claimService.SubmitClaimAsync(id, submitDto);
            return Ok(claim);
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

    [HttpPost("{id}/denial")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<ClaimDenialDto>> AddDenial(int id, CreateClaimDenialDto createDto)
    {
        try
        {
            var denial = await _claimService.AddDenialAsync(id, createDto);
            return Ok(denial);
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

    [HttpPost("{id}/payment")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<ClaimPaymentDto>> PostPayment(int id, CreateClaimPaymentDto createDto)
    {
        try
        {
            var payment = await _claimService.PostPaymentAsync(id, createDto);
            return Ok(payment);
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

    [HttpGet("{id}/denials")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<IEnumerable<ClaimDenialDto>>> GetDenials(int id)
    {
        var denials = await _claimService.GetDenialsByClaimAsync(id);
        return Ok(denials);
    }

    [HttpGet("{id}/payments")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<IEnumerable<ClaimPaymentDto>>> GetPayments(int id)
    {
        var payments = await _claimService.GetPaymentsByClaimAsync(id);
        return Ok(payments);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteClaim(int id)
    {
        try
        {
            await _claimService.DeleteClaimAsync(id);
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

