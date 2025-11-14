using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DoctorSchedulesController : ControllerBase
    {
        private readonly IDoctorScheduleService _doctorScheduleService;
        private readonly ILogger<DoctorSchedulesController> _logger;

        public DoctorSchedulesController(IDoctorScheduleService doctorScheduleService, ILogger<DoctorSchedulesController> logger)
        {
            _doctorScheduleService = doctorScheduleService;
            _logger = logger;
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<DoctorScheduleDto>> GetDoctorSchedule(int id)
        {
            var schedule = await _doctorScheduleService.GetDoctorScheduleByIdAsync(id);
            if (schedule == null)
            {
                return NotFound();
            }
            return Ok(schedule);
        }

        [HttpGet("doctor/{doctorId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<DoctorScheduleDto>>> GetSchedulesByDoctor(
            int doctorId, 
            [FromQuery] bool availableOnly = false)
        {
            var schedules = availableOnly
                ? await _doctorScheduleService.GetAvailableSchedulesByDoctorAsync(doctorId)
                : await _doctorScheduleService.GetSchedulesByDoctorAsync(doctorId);
            return Ok(schedules);
        }

        [HttpGet("doctor/{doctorId}/day/{dayOfWeek}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<DoctorScheduleDto>>> GetSchedulesByDayOfWeek(
            int doctorId, 
            DayOfWeek dayOfWeek)
        {
            var schedules = await _doctorScheduleService.GetSchedulesByDayOfWeekAsync(doctorId, dayOfWeek);
            return Ok(schedules);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<DoctorScheduleDto>> CreateDoctorSchedule(CreateDoctorScheduleDto createDoctorScheduleDto)
        {
            try
            {
                var schedule = await _doctorScheduleService.CreateDoctorScheduleAsync(createDoctorScheduleDto);
                return CreatedAtAction(nameof(GetDoctorSchedule), new { id = schedule.Id }, schedule);
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
                _logger.LogError(ex, "Error creating doctor schedule");
                return BadRequest(new { message = "Error creating doctor schedule", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> UpdateDoctorSchedule(int id, UpdateDoctorScheduleDto updateDoctorScheduleDto)
        {
            try
            {
                await _doctorScheduleService.UpdateDoctorScheduleAsync(id, updateDoctorScheduleDto);
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
                _logger.LogError(ex, "Error updating doctor schedule");
                return BadRequest(new { message = "Error updating doctor schedule", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> DeleteDoctorSchedule(int id)
        {
            try
            {
                await _doctorScheduleService.DeleteDoctorScheduleAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting doctor schedule");
                return BadRequest(new { message = "Error deleting doctor schedule", error = ex.Message });
            }
        }
    }
}

