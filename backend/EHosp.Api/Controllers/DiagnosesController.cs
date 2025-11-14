using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DiagnosesController : ControllerBase
    {
        private readonly IDiagnosisService _diagnosisService;
        private readonly ILogger<DiagnosesController> _logger;

        public DiagnosesController(IDiagnosisService diagnosisService, ILogger<DiagnosesController> logger)
        {
            _diagnosisService = diagnosisService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<DiagnosisDto>>> GetDiagnoses([FromQuery] string? search = null)
        {
            var diagnoses = string.IsNullOrWhiteSpace(search)
                ? await _diagnosisService.GetAllDiagnosesAsync()
                : await _diagnosisService.SearchDiagnosesAsync(search);
            return Ok(diagnoses);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<DiagnosisDto>> GetDiagnosis(int id)
        {
            var diagnosis = await _diagnosisService.GetDiagnosisByIdAsync(id);
            if (diagnosis == null)
            {
                return NotFound();
            }
            return Ok(diagnosis);
        }

        [HttpGet("code/{code}")]
        [AllowAnonymous]
        public async Task<ActionResult<DiagnosisDto>> GetDiagnosisByCode(string code)
        {
            var diagnosis = await _diagnosisService.GetDiagnosisByCodeAsync(code);
            if (diagnosis == null)
            {
                return NotFound();
            }
            return Ok(diagnosis);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<DiagnosisDto>> CreateDiagnosis(CreateDiagnosisDto createDiagnosisDto)
        {
            try
            {
                var diagnosis = await _diagnosisService.CreateDiagnosisAsync(createDiagnosisDto);
                return CreatedAtAction(nameof(GetDiagnosis), new { id = diagnosis.Id }, diagnosis);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating diagnosis");
                return BadRequest(new { message = "Error creating diagnosis", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> UpdateDiagnosis(int id, UpdateDiagnosisDto updateDiagnosisDto)
        {
            try
            {
                await _diagnosisService.UpdateDiagnosisAsync(id, updateDiagnosisDto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating diagnosis");
                return BadRequest(new { message = "Error updating diagnosis", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDiagnosis(int id)
        {
            try
            {
                await _diagnosisService.DeleteDiagnosisAsync(id);
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
                _logger.LogError(ex, "Error deleting diagnosis");
                return BadRequest(new { message = "Error deleting diagnosis", error = ex.Message });
            }
        }
    }
}

