using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AppointmentRemindersController : ControllerBase
    {
        private readonly IAppointmentReminderService _appointmentReminderService;
        private readonly ILogger<AppointmentRemindersController> _logger;

        public AppointmentRemindersController(
            IAppointmentReminderService appointmentReminderService,
            ILogger<AppointmentRemindersController> logger)
        {
            _appointmentReminderService = appointmentReminderService;
            _logger = logger;
        }

        [HttpPost("send-all")]
        public async Task<IActionResult> SendAllReminders()
        {
            try
            {
                await _appointmentReminderService.SendAppointmentRemindersAsync();
                return Ok(new { message = "Appointment reminders sent successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending appointment reminders");
                return BadRequest(new { message = "Error sending appointment reminders", error = ex.Message });
            }
        }

        [HttpPost("send/{appointmentId}")]
        public async Task<IActionResult> SendReminder(int appointmentId)
        {
            try
            {
                await _appointmentReminderService.SendAppointmentReminderAsync(appointmentId);
                return Ok(new { message = "Appointment reminder sent successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending appointment reminder for appointment {appointmentId}");
                return BadRequest(new { message = "Error sending appointment reminder", error = ex.Message });
            }
        }
    }
}

