using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MedicalRecordsController : ControllerBase
    {
        private readonly IMedicalRecordService _medicalRecordService;
        private readonly ILogger<MedicalRecordsController> _logger;

        public MedicalRecordsController(IMedicalRecordService medicalRecordService, ILogger<MedicalRecordsController> logger)
        {
            _medicalRecordService = medicalRecordService;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<IEnumerable<MedicalRecordDto>>> GetAllMedicalRecords()
        {
            var medicalRecords = await _medicalRecordService.GetAllMedicalRecordsAsync();
            return Ok(medicalRecords);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")] // Nurse can view (assist doctor workflows)
        public async Task<ActionResult<MedicalRecordDto>> GetMedicalRecord(int id)
        {
            var medicalRecord = await _medicalRecordService.GetMedicalRecordByIdAsync(id);
            if (medicalRecord == null)
            {
                return NotFound();
            }
            return Ok(medicalRecord);
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")] // Nurse can view assigned patients
        public async Task<ActionResult<IEnumerable<MedicalRecordDto>>> GetMedicalRecordsByPatient(int patientId)
        {
            var medicalRecords = await _medicalRecordService.GetMedicalRecordsByPatientAsync(patientId);
            return Ok(medicalRecords);
        }

        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse")] // Nurse can view records by doctor
        public async Task<ActionResult<IEnumerable<MedicalRecordDto>>> GetMedicalRecordsByDoctor(int doctorId)
        {
            var medicalRecords = await _medicalRecordService.GetMedicalRecordsByDoctorAsync(doctorId);
            return Ok(medicalRecords);
        }

        [HttpGet("patient/{patientId}/doctor/{doctorId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse")] // Nurse can view
        public async Task<ActionResult<IEnumerable<MedicalRecordDto>>> GetMedicalRecordsByPatientAndDoctor(int patientId, int doctorId)
        {
            var medicalRecords = await _medicalRecordService.GetMedicalRecordsByPatientAndDoctorAsync(patientId, doctorId);
            return Ok(medicalRecords);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<MedicalRecordDto>> CreateMedicalRecord(CreateMedicalRecordDto createMedicalRecordDto)
        {
            try
            {
                var medicalRecord = await _medicalRecordService.CreateMedicalRecordAsync(createMedicalRecordDto);
                return CreatedAtAction(nameof(GetMedicalRecord), new { id = medicalRecord.Id }, medicalRecord);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating medical record");
                return BadRequest(new { message = "Error creating medical record", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> UpdateMedicalRecord(int id, UpdateMedicalRecordDto updateMedicalRecordDto)
        {
            try
            {
                await _medicalRecordService.UpdateMedicalRecordAsync(id, updateMedicalRecordDto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating medical record");
                return BadRequest(new { message = "Error updating medical record", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Only Admin can delete (Nurse cannot delete)
        public async Task<IActionResult> DeleteMedicalRecord(int id)
        {
            try
            {
                await _medicalRecordService.DeleteMedicalRecordAsync(id);
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
                _logger.LogError(ex, "Error deleting medical record");
                return BadRequest(new { message = "Error deleting medical record", error = ex.Message });
            }
        }
    }
}

