using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FamilyMedicalHistoriesController : ControllerBase
    {
        private readonly IFamilyMedicalHistoryService _familyMedicalHistoryService;
        private readonly ILogger<FamilyMedicalHistoriesController> _logger;

        public FamilyMedicalHistoriesController(IFamilyMedicalHistoryService familyMedicalHistoryService, ILogger<FamilyMedicalHistoriesController> logger)
        {
            _familyMedicalHistoryService = familyMedicalHistoryService;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<IEnumerable<FamilyMedicalHistoryDto>>> GetAllFamilyMedicalHistories()
        {
            var histories = await _familyMedicalHistoryService.GetAllFamilyMedicalHistoriesAsync();
            return Ok(histories);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<FamilyMedicalHistoryDto>> GetFamilyMedicalHistory(int id)
        {
            var history = await _familyMedicalHistoryService.GetFamilyMedicalHistoryByIdAsync(id);
            if (history == null)
            {
                return NotFound();
            }
            return Ok(history);
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<IEnumerable<FamilyMedicalHistoryDto>>> GetFamilyMedicalHistoriesByPatient(int patientId)
        {
            var histories = await _familyMedicalHistoryService.GetFamilyMedicalHistoriesByPatientAsync(patientId);
            return Ok(histories);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<FamilyMedicalHistoryDto>> CreateFamilyMedicalHistory(CreateFamilyMedicalHistoryDto createFamilyMedicalHistoryDto)
        {
            try
            {
                var history = await _familyMedicalHistoryService.CreateFamilyMedicalHistoryAsync(createFamilyMedicalHistoryDto);
                return CreatedAtAction(nameof(GetFamilyMedicalHistory), new { id = history.Id }, history);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating family medical history");
                return BadRequest(new { message = "Error creating family medical history", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<IActionResult> UpdateFamilyMedicalHistory(int id, UpdateFamilyMedicalHistoryDto updateFamilyMedicalHistoryDto)
        {
            try
            {
                await _familyMedicalHistoryService.UpdateFamilyMedicalHistoryAsync(id, updateFamilyMedicalHistoryDto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating family medical history");
                return BadRequest(new { message = "Error updating family medical history", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteFamilyMedicalHistory(int id)
        {
            try
            {
                await _familyMedicalHistoryService.DeleteFamilyMedicalHistoryAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting family medical history");
                return BadRequest(new { message = "Error deleting family medical history", error = ex.Message });
            }
        }
    }
}

