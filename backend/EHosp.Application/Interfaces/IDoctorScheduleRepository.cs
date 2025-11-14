using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces
{
    public interface IDoctorScheduleRepository : IRepository<DoctorSchedule>
    {
        Task<DoctorSchedule?> GetDoctorScheduleWithDetailsAsync(int id);
        Task<IEnumerable<DoctorSchedule>> GetSchedulesByDoctorAsync(int doctorId);
        Task<IEnumerable<DoctorSchedule>> GetAvailableSchedulesByDoctorAsync(int doctorId);
        Task<IEnumerable<DoctorSchedule>> GetSchedulesByDayOfWeekAsync(int doctorId, DayOfWeek dayOfWeek);
    }
}

