using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationPreferencesController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationPreferencesController> _logger;

        public NotificationPreferencesController(INotificationService notificationService, ILogger<NotificationPreferencesController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<NotificationPreferenceDto>> GetNotificationPreference(int userId)
        {
            var preference = await _notificationService.GetNotificationPreferenceByUserAsync(userId);
            if (preference == null)
            {
                return NotFound();
            }
            return Ok(preference);
        }

        [HttpPost("user/{userId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<NotificationPreferenceDto>> CreateOrUpdateNotificationPreference(int userId, UpdateNotificationPreferenceDto updateDto)
        {
            try
            {
                var preference = await _notificationService.CreateOrUpdateNotificationPreferenceAsync(userId, updateDto);
                return Ok(preference);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification preferences");
                return BadRequest(new { message = "Error updating notification preferences", error = ex.Message });
            }
        }
    }
}

