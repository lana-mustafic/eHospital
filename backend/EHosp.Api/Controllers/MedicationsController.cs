using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MedicationsController : ControllerBase
    {
        private readonly IMedicationService _medicationService;
        private readonly ILogger<MedicationsController> _logger;

        public MedicationsController(IMedicationService medicationService, ILogger<MedicationsController> logger)
        {
            _medicationService = medicationService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<MedicationDto>>> GetMedications([FromQuery] bool activeOnly = false)
        {
            var medications = activeOnly
                ? await _medicationService.GetActiveMedicationsAsync()
                : await _medicationService.GetAllMedicationsAsync();
            return Ok(medications);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<MedicationDto>> GetMedication(int id)
        {
            var medication = await _medicationService.GetMedicationByIdAsync(id);
            if (medication == null)
            {
                return NotFound();
            }
            return Ok(medication);
        }

        [HttpGet("form/{form}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<MedicationDto>>> GetMedicationsByForm(string form)
        {
            var medications = await _medicationService.GetMedicationsByFormAsync(form);
            return Ok(medications);
        }

        [HttpGet("low-stock")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<IEnumerable<MedicationDto>>> GetLowStockMedications([FromQuery] int threshold = 10)
        {
            var medications = await _medicationService.GetLowStockMedicationsAsync(threshold);
            return Ok(medications);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<MedicationDto>> CreateMedication(CreateMedicationDto createMedicationDto)
        {
            try
            {
                var medication = await _medicationService.CreateMedicationAsync(createMedicationDto);
                return CreatedAtAction(nameof(GetMedication), new { id = medication.Id }, medication);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating medication");
                return BadRequest(new { message = "Error creating medication", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateMedication(int id, UpdateMedicationDto updateMedicationDto)
        {
            try
            {
                await _medicationService.UpdateMedicationAsync(id, updateMedicationDto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating medication");
                return BadRequest(new { message = "Error updating medication", error = ex.Message });
            }
        }

        [HttpPut("{id}/stock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStockQuantity(int id, [FromBody] int quantity)
        {
            try
            {
                await _medicationService.UpdateStockQuantityAsync(id, quantity);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stock quantity");
                return BadRequest(new { message = "Error updating stock quantity", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMedication(int id)
        {
            try
            {
                await _medicationService.DeleteMedicationAsync(id);
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
                _logger.LogError(ex, "Error deleting medication");
                return BadRequest(new { message = "Error deleting medication", error = ex.Message });
            }
        }
    }
}

