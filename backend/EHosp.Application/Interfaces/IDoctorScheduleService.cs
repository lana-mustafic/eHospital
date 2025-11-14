using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces
{
    public interface IDoctorScheduleService
    {
        Task<DoctorScheduleDto?> GetDoctorScheduleByIdAsync(int id);
        Task<IEnumerable<DoctorScheduleDto>> GetSchedulesByDoctorAsync(int doctorId);
        Task<IEnumerable<DoctorScheduleDto>> GetAvailableSchedulesByDoctorAsync(int doctorId);
        Task<IEnumerable<DoctorScheduleDto>> GetSchedulesByDayOfWeekAsync(int doctorId, DayOfWeek dayOfWeek);
        Task<DoctorScheduleDto> CreateDoctorScheduleAsync(CreateDoctorScheduleDto createDoctorScheduleDto);
        Task UpdateDoctorScheduleAsync(int id, UpdateDoctorScheduleDto updateDoctorScheduleDto);
        Task DeleteDoctorScheduleAsync(int id);
    }
}

