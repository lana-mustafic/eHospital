using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChronicConditionsController : ControllerBase
    {
        private readonly IChronicConditionService _chronicConditionService;
        private readonly ILogger<ChronicConditionsController> _logger;

        public ChronicConditionsController(IChronicConditionService chronicConditionService, ILogger<ChronicConditionsController> logger)
        {
            _chronicConditionService = chronicConditionService;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<IEnumerable<ChronicConditionDto>>> GetAllChronicConditions()
        {
            var conditions = await _chronicConditionService.GetAllChronicConditionsAsync();
            return Ok(conditions);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<ChronicConditionDto>> GetChronicCondition(int id)
        {
            var condition = await _chronicConditionService.GetChronicConditionByIdAsync(id);
            if (condition == null)
            {
                return NotFound();
            }
            return Ok(condition);
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<IEnumerable<ChronicConditionDto>>> GetChronicConditionsByPatient(int patientId)
        {
            var conditions = await _chronicConditionService.GetChronicConditionsByPatientAsync(patientId);
            return Ok(conditions);
        }

        [HttpGet("patient/{patientId}/active")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<IEnumerable<ChronicConditionDto>>> GetActiveChronicConditionsByPatient(int patientId)
        {
            var conditions = await _chronicConditionService.GetActiveChronicConditionsByPatientAsync(patientId);
            return Ok(conditions);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<ChronicConditionDto>> CreateChronicCondition(CreateChronicConditionDto createChronicConditionDto)
        {
            try
            {
                var condition = await _chronicConditionService.CreateChronicConditionAsync(createChronicConditionDto);
                return CreatedAtAction(nameof(GetChronicCondition), new { id = condition.Id }, condition);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating chronic condition");
                return BadRequest(new { message = "Error creating chronic condition", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<IActionResult> UpdateChronicCondition(int id, UpdateChronicConditionDto updateChronicConditionDto)
        {
            try
            {
                await _chronicConditionService.UpdateChronicConditionAsync(id, updateChronicConditionDto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating chronic condition");
                return BadRequest(new { message = "Error updating chronic condition", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteChronicCondition(int id)
        {
            try
            {
                await _chronicConditionService.DeleteChronicConditionAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting chronic condition");
                return BadRequest(new { message = "Error deleting chronic condition", error = ex.Message });
            }
        }
    }
}

