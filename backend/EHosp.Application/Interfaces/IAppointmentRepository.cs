using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces
{
    public interface IAppointmentRepository : IRepository<Appointment>
    {
        Task<IEnumerable<Appointment>> GetAppointmentsByDoctorAsync(int doctorId, DateTime date);
        Task<IEnumerable<Appointment>> GetAppointmentsByPatientAsync(int patientId);
        Task<IEnumerable<Appointment>> GetAppointmentsByDateAsync(DateTime date);
        Task<bool> IsTimeSlotAvailableAsync(int doctorId, DateTime date, TimeSpan startTime, TimeSpan endTime);
        Task<IEnumerable<Appointment>> GetUpcomingAppointmentsAsync(DateTime fromDate, DateTime toDate);
        Task<Appointment?> GetAppointmentWithDetailsAsync(int id);
    }
}