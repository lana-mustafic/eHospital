using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientService _patientService;
        private readonly ILogger<PatientsController> _logger;

        public PatientsController(IPatientService patientService, ILogger<PatientsController> logger)
        {
            _patientService = patientService;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatients()
        {
            var patients = await _patientService.GetAllPatientsAsync();
            return Ok(patients);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<ActionResult<PatientDto>> GetPatient(int id)
        {
            var patient = await _patientService.GetPatientByIdAsync(id);
            if (patient == null)
            {
                return NotFound();
            }
            return Ok(patient);
        }

        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatientsByDoctor(int doctorId)
        {
            var patients = await _patientService.GetPatientsByDoctorAsync(doctorId);
            return Ok(patients);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult<PatientDto>> CreatePatient(CreatePatientDto createPatientDto)
        {
            try
            {
                var patient = await _patientService.CreatePatientAsync(createPatientDto);
                return CreatedAtAction(nameof(GetPatient), new { id = patient.Id }, patient);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating patient");
                return BadRequest(new { message = "Error creating patient", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Patient")]
        public async Task<IActionResult> UpdatePatient(int id, UpdatePatientDto updatePatientDto)
        {
            try
            {
                await _patientService.UpdatePatientAsync(id, updatePatientDto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating patient");
                return BadRequest(new { message = "Error updating patient", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            try
            {
                await _patientService.DeletePatientAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting patient");
                return BadRequest(new { message = "Error deleting patient", error = ex.Message });
            }
        }
    }
}
