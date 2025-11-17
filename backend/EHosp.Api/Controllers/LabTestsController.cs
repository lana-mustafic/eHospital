using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LabTestsController : ControllerBase
    {
        private readonly ILabTestService _labTestService;
        private readonly ILogger<LabTestsController> _logger;

        public LabTestsController(ILabTestService labTestService, ILogger<LabTestsController> logger)
        {
            _labTestService = labTestService;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<IEnumerable<LabTestDto>>> GetAllLabTests()
        {
            var labTests = await _labTestService.GetAllLabTestsAsync();
            return Ok(labTests);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<LabTestDto>> GetLabTest(int id)
        {
            var labTest = await _labTestService.GetLabTestByIdAsync(id);
            if (labTest == null)
            {
                return NotFound();
            }
            return Ok(labTest);
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<IEnumerable<LabTestDto>>> GetLabTestsByPatient(int patientId)
        {
            var labTests = await _labTestService.GetLabTestsByPatientAsync(patientId);
            return Ok(labTests);
        }

        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<IEnumerable<LabTestDto>>> GetLabTestsByDoctor(int doctorId)
        {
            var labTests = await _labTestService.GetLabTestsByDoctorAsync(doctorId);
            return Ok(labTests);
        }

        [HttpGet("status/{status}")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<IEnumerable<LabTestDto>>> GetLabTestsByStatus(string status)
        {
            var labTests = await _labTestService.GetLabTestsByStatusAsync(status);
            return Ok(labTests);
        }

        [HttpGet("patient/{patientId}/status/{status}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<IEnumerable<LabTestDto>>> GetLabTestsByPatientAndStatus(int patientId, string status)
        {
            var labTests = await _labTestService.GetLabTestsByPatientAndStatusAsync(patientId, status);
            return Ok(labTests);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<LabTestDto>> CreateLabTest(CreateLabTestDto createLabTestDto)
        {
            try
            {
                var labTest = await _labTestService.CreateLabTestAsync(createLabTestDto);
                return CreatedAtAction(nameof(GetLabTest), new { id = labTest.Id }, labTest);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating lab test");
                return BadRequest(new { message = "Error creating lab test", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<IActionResult> UpdateLabTest(int id, UpdateLabTestDto updateLabTestDto)
        {
            try
            {
                await _labTestService.UpdateLabTestAsync(id, updateLabTestDto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating lab test");
                return BadRequest(new { message = "Error updating lab test", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteLabTest(int id)
        {
            try
            {
                await _labTestService.DeleteLabTestAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting lab test");
                return BadRequest(new { message = "Error deleting lab test", error = ex.Message });
            }
        }

        [HttpPost("{id}/upload")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult> UploadLabTestFile(int id, IFormFile file)
        {
            try
            {
                var filePath = await _labTestService.UploadLabTestFileAsync(id, file);
                return Ok(new { message = "File uploaded successfully", filePath });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading lab test file");
                return BadRequest(new { message = "Error uploading file", error = ex.Message });
            }
        }

        [HttpGet("{id}/download")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<IActionResult> DownloadLabTestFile(int id)
        {
            try
            {
                var (fileBytes, fileName, contentType) = await _labTestService.DownloadLabTestFileAsync(id);
                return File(fileBytes, contentType, fileName);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading lab test file");
                return BadRequest(new { message = "Error downloading file", error = ex.Message });
            }
        }
    }
}

