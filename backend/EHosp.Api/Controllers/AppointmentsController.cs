using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;
        private readonly ILogger<AppointmentsController> _logger;

        public AppointmentsController(IAppointmentService appointmentService, ILogger<AppointmentsController> logger)
        {
            _appointmentService = appointmentService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetAppointments()
        {
            var appointments = await _appointmentService.GetAppointmentsByDateAsync(DateTime.Today);
            return Ok(appointments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AppointmentDto>> GetAppointment(int id)
        {
            var appointment = await _appointmentService.GetAppointmentByIdAsync(id);
            if (appointment == null)
            {
                return NotFound();
            }
            return Ok(appointment);
        }

        [HttpGet("doctor/{doctorId}/{date}")]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetAppointmentsByDoctor(int doctorId, DateTime date)
        {
            var appointments = await _appointmentService.GetAppointmentsByDoctorAsync(doctorId, date);
            return Ok(appointments);
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetAppointmentsByPatient(int patientId)
        {
            var appointments = await _appointmentService.GetAppointmentsByPatientAsync(patientId);
            return Ok(appointments);
        }

        [HttpPost]
        public async Task<ActionResult<AppointmentDto>> CreateAppointment(CreateAppointmentDto createAppointmentDto)
        {
            try
            {
                var appointment = await _appointmentService.CreateAppointmentAsync(createAppointmentDto);
                return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, appointment);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating appointment");
                return BadRequest(new { message = "Error creating appointment", error = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateAppointmentStatus(int id, UpdateAppointmentDto updateAppointmentDto)
        {
            try
            {
                await _appointmentService.UpdateAppointmentStatusAsync(id, updateAppointmentDto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating appointment status");
                return BadRequest(new { message = "Error updating appointment", error = ex.Message });
            }
        }

        [HttpGet("availability/{doctorId}/{date}/{startTime}/{endTime}")]
        public async Task<ActionResult<bool>> CheckTimeSlotAvailability(int doctorId, DateTime date, TimeSpan startTime, TimeSpan endTime)
        {
            var isAvailable = await _appointmentService.IsTimeSlotAvailableAsync(doctorId, date, startTime, endTime);
            return Ok(isAvailable);
        }
    }
}