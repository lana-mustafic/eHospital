using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PrescriptionsController : ControllerBase
    {
        private readonly IPrescriptionService _prescriptionService;
        private readonly ILogger<PrescriptionsController> _logger;

        public PrescriptionsController(IPrescriptionService prescriptionService, ILogger<PrescriptionsController> logger)
        {
            _prescriptionService = prescriptionService;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<IEnumerable<PrescriptionDto>>> GetAllPrescriptions()
        {
            var prescriptions = await _prescriptionService.GetAllPrescriptionsAsync();
            return Ok(prescriptions);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")] // Nurse can view (cannot prescribe)
        public async Task<ActionResult<PrescriptionDto>> GetPrescription(int id)
        {
            var prescription = await _prescriptionService.GetPrescriptionByIdAsync(id);
            if (prescription == null)
            {
                return NotFound();
            }
            return Ok(prescription);
        }

        [HttpGet("medical-record/{medicalRecordId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")] // Nurse can view
        public async Task<ActionResult<IEnumerable<PrescriptionDto>>> GetPrescriptionsByMedicalRecord(int medicalRecordId)
        {
            var prescriptions = await _prescriptionService.GetPrescriptionsByMedicalRecordAsync(medicalRecordId);
            return Ok(prescriptions);
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")] // Nurse can view
        public async Task<ActionResult<IEnumerable<PrescriptionDto>>> GetPrescriptionsByPatient(int patientId)
        {
            var prescriptions = await _prescriptionService.GetPrescriptionsByPatientAsync(patientId);
            return Ok(prescriptions);
        }

        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse")] // Nurse can view
        public async Task<ActionResult<IEnumerable<PrescriptionDto>>> GetPrescriptionsByDoctor(int doctorId)
        {
            var prescriptions = await _prescriptionService.GetPrescriptionsByDoctorAsync(doctorId);
            return Ok(prescriptions);
        }

        [HttpGet("medication/{medicationId}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<IEnumerable<PrescriptionDto>>> GetPrescriptionsByMedication(int medicationId)
        {
            var prescriptions = await _prescriptionService.GetPrescriptionsByMedicationAsync(medicationId);
            return Ok(prescriptions);
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Admin,Pharmacist,Nurse")]
        public async Task<ActionResult<IEnumerable<PrescriptionDto>>> GetPendingPrescriptions()
        {
            var prescriptions = await _prescriptionService.GetPendingPrescriptionsAsync();
            return Ok(prescriptions);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<PrescriptionDto>> CreatePrescription(CreatePrescriptionDto createPrescriptionDto)
        {
            try
            {
                var prescription = await _prescriptionService.CreatePrescriptionAsync(createPrescriptionDto);
                return CreatedAtAction(nameof(GetPrescription), new { id = prescription.Id }, prescription);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating prescription");
                return BadRequest(new { message = "Error creating prescription", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> UpdatePrescription(int id, UpdatePrescriptionDto updatePrescriptionDto)
        {
            try
            {
                await _prescriptionService.UpdatePrescriptionAsync(id, updatePrescriptionDto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating prescription");
                return BadRequest(new { message = "Error updating prescription", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Only Admin can delete (Nurse cannot delete)
        public async Task<IActionResult> DeletePrescription(int id)
        {
            try
            {
                await _prescriptionService.DeletePrescriptionAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting prescription");
                return BadRequest(new { message = "Error deleting prescription", error = ex.Message });
            }
        }

        [HttpPost("{id}/verify")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<PrescriptionDto>> VerifyPrescription(int id, [FromBody] VerifyPrescriptionRequest request)
        {
            try
            {
                var prescription = await _prescriptionService.VerifyPrescriptionAsync(id, request.VerifiedByUserId, request.Notes);
                return Ok(prescription);
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
                _logger.LogError(ex, "Error verifying prescription");
                return BadRequest(new { message = "Error verifying prescription", error = ex.Message });
            }
        }

        [HttpPost("{id}/dispense")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<PrescriptionDto>> DispensePrescription(int id, [FromBody] DispensePrescriptionRequest request)
        {
            try
            {
                var prescription = await _prescriptionService.DispensePrescriptionAsync(id, request.DispensedByUserId, request.Notes);
                return Ok(prescription);
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
                _logger.LogError(ex, "Error dispensing prescription");
                return BadRequest(new { message = "Error dispensing prescription", error = ex.Message });
            }
        }

        [HttpPost("{id}/cancel")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<PrescriptionDto>> CancelPrescription(int id, [FromBody] CancelPrescriptionRequest? request = null)
        {
            try
            {
                var prescription = await _prescriptionService.CancelPrescriptionAsync(id, request?.Reason);
                return Ok(prescription);
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
                _logger.LogError(ex, "Error cancelling prescription");
                return BadRequest(new { message = "Error cancelling prescription", error = ex.Message });
            }
        }
    }
}

public class VerifyPrescriptionRequest
{
    public int VerifiedByUserId { get; set; }
    public string? Notes { get; set; }
}

public class DispensePrescriptionRequest
{
    public int DispensedByUserId { get; set; }
    public string? Notes { get; set; }
}

public class CancelPrescriptionRequest
{
    public string? Reason { get; set; }
}

