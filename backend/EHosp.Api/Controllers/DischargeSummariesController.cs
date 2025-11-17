using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DischargeSummariesController : ControllerBase
    {
        private readonly IDischargeSummaryService _dischargeSummaryService;
        private readonly ILogger<DischargeSummariesController> _logger;

        public DischargeSummariesController(IDischargeSummaryService dischargeSummaryService, ILogger<DischargeSummariesController> logger)
        {
            _dischargeSummaryService = dischargeSummaryService;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<IEnumerable<DischargeSummaryDto>>> GetAllDischargeSummaries()
        {
            var summaries = await _dischargeSummaryService.GetAllDischargeSummariesAsync();
            return Ok(summaries);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<DischargeSummaryDto>> GetDischargeSummary(int id)
        {
            var summary = await _dischargeSummaryService.GetDischargeSummaryByIdAsync(id);
            if (summary == null)
            {
                return NotFound();
            }
            return Ok(summary);
        }

        [HttpGet("number/{dischargeNumber}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<DischargeSummaryDto>> GetDischargeSummaryByNumber(string dischargeNumber)
        {
            var summary = await _dischargeSummaryService.GetDischargeSummaryByDischargeNumberAsync(dischargeNumber);
            if (summary == null)
            {
                return NotFound();
            }
            return Ok(summary);
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<IEnumerable<DischargeSummaryDto>>> GetDischargeSummariesByPatient(int patientId)
        {
            var summaries = await _dischargeSummaryService.GetDischargeSummariesByPatientAsync(patientId);
            return Ok(summaries);
        }

        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<IEnumerable<DischargeSummaryDto>>> GetDischargeSummariesByDoctor(int doctorId)
        {
            var summaries = await _dischargeSummaryService.GetDischargeSummariesByDoctorAsync(doctorId);
            return Ok(summaries);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<DischargeSummaryDto>> CreateDischargeSummary(CreateDischargeSummaryDto createDischargeSummaryDto)
        {
            try
            {
                var summary = await _dischargeSummaryService.CreateDischargeSummaryAsync(createDischargeSummaryDto);
                return CreatedAtAction(nameof(GetDischargeSummary), new { id = summary.Id }, summary);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating discharge summary");
                return BadRequest(new { message = "Error creating discharge summary", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> UpdateDischargeSummary(int id, UpdateDischargeSummaryDto updateDischargeSummaryDto)
        {
            try
            {
                await _dischargeSummaryService.UpdateDischargeSummaryAsync(id, updateDischargeSummaryDto);
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
                _logger.LogError(ex, "Error updating discharge summary");
                return BadRequest(new { message = "Error updating discharge summary", error = ex.Message });
            }
        }

        [HttpPost("{id}/finalize")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> FinalizeDischargeSummary(int id)
        {
            try
            {
                await _dischargeSummaryService.FinalizeDischargeSummaryAsync(id);
                return Ok(new { message = "Discharge summary finalized successfully" });
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
                _logger.LogError(ex, "Error finalizing discharge summary");
                return BadRequest(new { message = "Error finalizing discharge summary", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDischargeSummary(int id)
        {
            try
            {
                await _dischargeSummaryService.DeleteDischargeSummaryAsync(id);
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
                _logger.LogError(ex, "Error deleting discharge summary");
                return BadRequest(new { message = "Error deleting discharge summary", error = ex.Message });
            }
        }

        [HttpGet("generate-number")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<string>> GenerateDischargeNumber()
        {
            var number = await _dischargeSummaryService.GenerateDischargeNumberAsync();
            return Ok(new { dischargeNumber = number });
        }

        [HttpGet("{id}/pdf")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<IActionResult> GeneratePdf(int id)
        {
            try
            {
                var pdfBytes = await _dischargeSummaryService.GenerateDischargeSummaryPdfAsync(id);
                return File(pdfBytes, "application/pdf", $"discharge-summary-{id}.pdf");
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF");
                return BadRequest(new { message = "Error generating PDF", error = ex.Message });
            }
        }
    }
}

