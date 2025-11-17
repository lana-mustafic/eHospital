using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VitalSignsController : ControllerBase
    {
        private readonly IVitalSignsService _vitalSignsService;
        private readonly ILogger<VitalSignsController> _logger;

        public VitalSignsController(IVitalSignsService vitalSignsService, ILogger<VitalSignsController> logger)
        {
            _vitalSignsService = vitalSignsService;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<IEnumerable<VitalSignsDto>>> GetAllVitalSigns()
        {
            var vitalSigns = await _vitalSignsService.GetAllVitalSignsAsync();
            return Ok(vitalSigns);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<VitalSignsDto>> GetVitalSigns(int id)
        {
            var vitalSigns = await _vitalSignsService.GetVitalSignsByIdAsync(id);
            if (vitalSigns == null)
            {
                return NotFound();
            }
            return Ok(vitalSigns);
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<IEnumerable<VitalSignsDto>>> GetVitalSignsByPatient(int patientId)
        {
            var vitalSigns = await _vitalSignsService.GetVitalSignsByPatientAsync(patientId);
            return Ok(vitalSigns);
        }

        [HttpGet("patient/{patientId}/date-range")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<IEnumerable<VitalSignsDto>>> GetVitalSignsByPatientAndDateRange(
            int patientId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var vitalSigns = await _vitalSignsService.GetVitalSignsByPatientAndDateRangeAsync(patientId, startDate, endDate);
            return Ok(vitalSigns);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<VitalSignsDto>> CreateVitalSigns(CreateVitalSignsDto createVitalSignsDto)
        {
            try
            {
                var vitalSigns = await _vitalSignsService.CreateVitalSignsAsync(createVitalSignsDto);
                return CreatedAtAction(nameof(GetVitalSigns), new { id = vitalSigns.Id }, vitalSigns);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating vital signs");
                return BadRequest(new { message = "Error creating vital signs", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<IActionResult> UpdateVitalSigns(int id, UpdateVitalSignsDto updateVitalSignsDto)
        {
            try
            {
                await _vitalSignsService.UpdateVitalSignsAsync(id, updateVitalSignsDto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating vital signs");
                return BadRequest(new { message = "Error updating vital signs", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteVitalSigns(int id)
        {
            try
            {
                await _vitalSignsService.DeleteVitalSignsAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting vital signs");
                return BadRequest(new { message = "Error deleting vital signs", error = ex.Message });
            }
        }
    }
}

