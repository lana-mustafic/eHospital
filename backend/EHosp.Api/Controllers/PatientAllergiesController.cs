using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PatientAllergiesController : ControllerBase
    {
        private readonly IPatientAllergyService _patientAllergyService;
        private readonly ILogger<PatientAllergiesController> _logger;

        public PatientAllergiesController(IPatientAllergyService patientAllergyService, ILogger<PatientAllergiesController> logger)
        {
            _patientAllergyService = patientAllergyService;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<IEnumerable<PatientAllergyDto>>> GetAllPatientAllergies()
        {
            var allergies = await _patientAllergyService.GetAllPatientAllergiesAsync();
            return Ok(allergies);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<PatientAllergyDto>> GetPatientAllergy(int id)
        {
            var allergy = await _patientAllergyService.GetPatientAllergyByIdAsync(id);
            if (allergy == null)
            {
                return NotFound();
            }
            return Ok(allergy);
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<IEnumerable<PatientAllergyDto>>> GetPatientAllergiesByPatient(int patientId)
        {
            var allergies = await _patientAllergyService.GetPatientAllergiesByPatientAsync(patientId);
            return Ok(allergies);
        }

        [HttpGet("patient/{patientId}/active")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<IEnumerable<PatientAllergyDto>>> GetActivePatientAllergiesByPatient(int patientId)
        {
            var allergies = await _patientAllergyService.GetActivePatientAllergiesByPatientAsync(patientId);
            return Ok(allergies);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<PatientAllergyDto>> CreatePatientAllergy(CreatePatientAllergyDto createPatientAllergyDto)
        {
            try
            {
                var allergy = await _patientAllergyService.CreatePatientAllergyAsync(createPatientAllergyDto);
                return CreatedAtAction(nameof(GetPatientAllergy), new { id = allergy.Id }, allergy);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating patient allergy");
                return BadRequest(new { message = "Error creating patient allergy", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<IActionResult> UpdatePatientAllergy(int id, UpdatePatientAllergyDto updatePatientAllergyDto)
        {
            try
            {
                await _patientAllergyService.UpdatePatientAllergyAsync(id, updatePatientAllergyDto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating patient allergy");
                return BadRequest(new { message = "Error updating patient allergy", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePatientAllergy(int id)
        {
            try
            {
                await _patientAllergyService.DeletePatientAllergyAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting patient allergy");
                return BadRequest(new { message = "Error deleting patient allergy", error = ex.Message });
            }
        }
    }
}

