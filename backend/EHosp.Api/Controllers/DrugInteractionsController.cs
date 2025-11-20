using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DrugInteractionsController : ControllerBase
{
    private readonly IDrugInteractionService _interactionService;
    private readonly ILogger<DrugInteractionsController> _logger;

    public DrugInteractionsController(
        IDrugInteractionService interactionService,
        ILogger<DrugInteractionsController> logger)
    {
        _interactionService = interactionService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Doctor,Pharmacist")]
    public async Task<ActionResult<IEnumerable<DrugInteractionDto>>> GetAllInteractions()
    {
        var interactions = await _interactionService.GetAllInteractionsAsync();
        return Ok(interactions);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Doctor,Pharmacist")]
    public async Task<ActionResult<DrugInteractionDto>> GetInteraction(int id)
    {
        var interaction = await _interactionService.GetInteractionByIdAsync(id);
        if (interaction == null)
        {
            return NotFound();
        }
        return Ok(interaction);
    }

    [HttpGet("medication/{medicationId}")]
    [Authorize(Roles = "Admin,Doctor,Pharmacist")]
    public async Task<ActionResult<IEnumerable<DrugInteractionDto>>> GetInteractionsByMedication(int medicationId)
    {
        var interactions = await _interactionService.GetInteractionsByMedicationAsync(medicationId);
        return Ok(interactions);
    }

    [HttpPost("check")]
    [Authorize(Roles = "Admin,Doctor,Pharmacist")]
    public async Task<ActionResult<DrugInteractionDto?>> CheckInteraction([FromBody] CheckInteractionRequest request)
    {
        var interaction = await _interactionService.CheckInteractionAsync(request.Medication1Id, request.Medication2Id);
        return Ok(interaction);
    }

    [HttpPost("check-prescription/{prescriptionId}")]
    [Authorize(Roles = "Admin,Doctor,Pharmacist")]
    public async Task<ActionResult<IEnumerable<DrugInteractionDto>>> CheckInteractionsForPrescription(int prescriptionId)
    {
        var interactions = await _interactionService.CheckInteractionsForPrescriptionAsync(prescriptionId);
        return Ok(interactions);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<DrugInteractionDto>> CreateInteraction(CreateDrugInteractionDto createDto)
    {
        try
        {
            var interaction = await _interactionService.CreateInteractionAsync(createDto);
            return CreatedAtAction(nameof(GetInteraction), new { id = interaction.Id }, interaction);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateInteraction(int id, UpdateDrugInteractionDto updateDto)
    {
        try
        {
            await _interactionService.UpdateInteractionAsync(id, updateDto);
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
    public async Task<IActionResult> DeleteInteraction(int id)
    {
        try
        {
            await _interactionService.DeleteInteractionAsync(id);
            return NoContent();
        }
        catch (ArgumentException)
        {
            return NotFound();
        }
    }
}

public class CheckInteractionRequest
{
    public int Medication1Id { get; set; }
    public int Medication2Id { get; set; }
}

