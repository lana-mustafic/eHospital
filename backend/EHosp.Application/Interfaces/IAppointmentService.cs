using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces
{
    public interface IAppointmentService
    {
        Task<AppointmentDto?> GetAppointmentByIdAsync(int id);
        Task<IEnumerable<AppointmentDto>> GetAppointmentsByDoctorAsync(int doctorId, DateTime date);
        Task<IEnumerable<AppointmentDto>> GetAppointmentsByPatientAsync(int patientId);
        Task<IEnumerable<AppointmentDto>> GetAppointmentsByDateAsync(DateTime date);
        Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentDto createAppointmentDto);
        Task UpdateAppointmentStatusAsync(int id, UpdateAppointmentDto updateAppointmentDto);
        Task<bool> IsTimeSlotAvailableAsync(int doctorId, DateTime date, TimeSpan startTime, TimeSpan endTime);
        Task RescheduleAppointmentAsync(int id, RescheduleAppointmentDto rescheduleAppointmentDto);
    }
}