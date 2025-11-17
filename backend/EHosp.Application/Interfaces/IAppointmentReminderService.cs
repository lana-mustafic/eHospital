namespace EHosp.Application.Interfaces;

public interface IAppointmentReminderService
{
    Task SendAppointmentRemindersAsync();
    Task SendAppointmentReminderAsync(int appointmentId);
}

