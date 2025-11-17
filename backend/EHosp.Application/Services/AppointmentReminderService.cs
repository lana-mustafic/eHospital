using EHosp.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class AppointmentReminderService : IAppointmentReminderService
{
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly INotificationService _notificationService;
    private readonly INotificationPreferenceRepository _notificationPreferenceRepository;
    private readonly ILogger<AppointmentReminderService> _logger;

    public AppointmentReminderService(
        IAppointmentRepository appointmentRepository,
        INotificationService notificationService,
        INotificationPreferenceRepository notificationPreferenceRepository,
        ILogger<AppointmentReminderService> logger)
    {
        _appointmentRepository = appointmentRepository;
        _notificationService = notificationService;
        _notificationPreferenceRepository = notificationPreferenceRepository;
        _logger = logger;
    }

    public async Task SendAppointmentRemindersAsync()
    {
        try
        {
            var now = DateTime.UtcNow;
            var tomorrow = now.AddDays(1);
            
            // Get all scheduled appointments for the next 48 hours
            var upcomingAppointments = await _appointmentRepository.GetUpcomingAppointmentsAsync(
                now,
                tomorrow.AddDays(1)
            );

            var scheduledAppointments = upcomingAppointments
                .Where(a => a.Status == "Scheduled")
                .ToList();

            foreach (var appointment in scheduledAppointments)
            {
                var appointmentDateTime = appointment.AppointmentDate.Date.Add(appointment.StartTime);
                var hoursUntilAppointment = (appointmentDateTime - now).TotalHours;

                // Get user preferences for reminder timing
                var patientPreference = await _notificationPreferenceRepository.GetNotificationPreferenceByUserAsync(
                    appointment.Patient?.UserId ?? 0
                );

                var reminderHours = patientPreference?.AppointmentReminderHoursBefore ?? 24;

                // Send reminder if within the reminder window
                if (hoursUntilAppointment > 0 && hoursUntilAppointment <= reminderHours)
                {
                    await SendAppointmentReminderAsync(appointment.Id);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending appointment reminders");
        }
    }

    public async Task SendAppointmentReminderAsync(int appointmentId)
    {
        try
        {
            var appointment = await _appointmentRepository.GetAppointmentWithDetailsAsync(appointmentId);
            if (appointment == null || appointment.Status != "Scheduled")
            {
                return;
            }

            var appointmentDateTime = appointment.AppointmentDate.Date.Add(appointment.StartTime);
            var patientName = $"{appointment.Patient?.User?.FirstName} {appointment.Patient?.User?.LastName}";
            var doctorName = $"{appointment.Doctor?.User?.FirstName} {appointment.Doctor?.User?.LastName}";

            // Send reminder to patient
            if (appointment.Patient?.UserId > 0)
            {
                var patientMessage = $"Reminder: You have an appointment with Dr. {doctorName} on {appointmentDateTime:MMMM dd, yyyy} at {appointment.StartTime:hh\\:mm}. Reason: {appointment.Reason}";
                
                await _notificationService.SendNotificationAsync(
                    appointment.Patient.UserId,
                    "Appointment Reminder",
                    patientMessage,
                    "Info",
                    "Appointment",
                    "Normal",
                    "Appointment",
                    appointment.Id
                );
            }

            // Send reminder to doctor
            if (appointment.Doctor?.UserId > 0)
            {
                var doctorMessage = $"Reminder: You have an appointment with {patientName} on {appointmentDateTime:MMMM dd, yyyy} at {appointment.StartTime:hh\\:mm}. Reason: {appointment.Reason}";
                
                await _notificationService.SendNotificationAsync(
                    appointment.Doctor.UserId,
                    "Appointment Reminder",
                    doctorMessage,
                    "Info",
                    "Appointment",
                    "Normal",
                    "Appointment",
                    appointment.Id
                );
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error sending appointment reminder for appointment {appointmentId}");
        }
    }
}

