using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(INotificationService notificationService, ILogger<NotificationsController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetNotificationsByUser(int userId)
        {
            var notifications = await _notificationService.GetNotificationsByUserAsync(userId);
            return Ok(notifications);
        }

        [HttpGet("user/{userId}/unread")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetUnreadNotificationsByUser(int userId)
        {
            var notifications = await _notificationService.GetUnreadNotificationsByUserAsync(userId);
            return Ok(notifications);
        }

        [HttpGet("user/{userId}/unread-count")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<int>> GetUnreadNotificationCount(int userId)
        {
            var count = await _notificationService.GetUnreadNotificationCountAsync(userId);
            return Ok(new { count });
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<NotificationDto>> GetNotification(int id)
        {
            var notification = await _notificationService.GetNotificationByIdAsync(id);
            if (notification == null)
            {
                return NotFound();
            }
            return Ok(notification);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<NotificationDto>> CreateNotification(CreateNotificationDto createNotificationDto)
        {
            try
            {
                var notification = await _notificationService.CreateNotificationAsync(createNotificationDto);
                return CreatedAtAction(nameof(GetNotification), new { id = notification.Id }, notification);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification");
                return BadRequest(new { message = "Error creating notification", error = ex.Message });
            }
        }

        [HttpPut("{id}/read")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                await _notificationService.MarkAsReadAsync(id);
                return Ok(new { message = "Notification marked as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification as read");
                return BadRequest(new { message = "Error marking notification as read", error = ex.Message });
            }
        }

        [HttpPut("user/{userId}/read-all")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<IActionResult> MarkAllAsRead(int userId)
        {
            try
            {
                await _notificationService.MarkAllAsReadAsync(userId);
                return Ok(new { message = "All notifications marked as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read");
                return BadRequest(new { message = "Error marking all notifications as read", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            try
            {
                await _notificationService.DeleteNotificationAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification");
                return BadRequest(new { message = "Error deleting notification", error = ex.Message });
            }
        }
    }
}

