using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Require authentication
    public class DoctorsController : ControllerBase
    {
        private readonly IDoctorService _doctorService;
        private readonly ILogger<DoctorsController> _logger;

        public DoctorsController(IDoctorService doctorService, ILogger<DoctorsController> logger)
        {
            _doctorService = doctorService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous] // Anyone can see doctors list
        public async Task<ActionResult<IEnumerable<DoctorDto>>> GetDoctors()
        {
            var doctors = await _doctorService.GetAllDoctorsAsync();
            return Ok(doctors);
        }

        [HttpGet("{id}")]
        [AllowAnonymous] // Anyone can view doctor details
        public async Task<ActionResult<DoctorDto>> GetDoctor(int id)
        {
            var doctor = await _doctorService.GetDoctorByIdAsync(id);
            if (doctor == null)
            {
                return NotFound();
            }
            return Ok(doctor);
        }

        [HttpGet("department/{departmentId}")]
        [AllowAnonymous] // Public access
        public async Task<ActionResult<IEnumerable<DoctorDto>>> GetDoctorsByDepartment(int departmentId)
        {
            var doctors = await _doctorService.GetDoctorsByDepartmentAsync(departmentId);
            return Ok(doctors);
        }

        [HttpGet("specialization/{specialization}")]
        [AllowAnonymous] // Public access
        public async Task<ActionResult<IEnumerable<DoctorDto>>> GetDoctorsBySpecialization(string specialization)
        {
            var doctors = await _doctorService.GetDoctorsBySpecializationAsync(specialization);
            return Ok(doctors);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")] // Only admins can create doctors
        public async Task<ActionResult<DoctorDto>> CreateDoctor(CreateDoctorDto createDoctorDto)
        {
            try
            {
                var doctor = await _doctorService.CreateDoctorAsync(createDoctorDto);
                return CreatedAtAction(nameof(GetDoctor), new { id = doctor.Id }, doctor);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating doctor");
                return BadRequest(new { message = "Error creating doctor", error = ex.Message });
            }
        }
    }
}