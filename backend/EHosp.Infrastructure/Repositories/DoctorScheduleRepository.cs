using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories
{
    public class DoctorScheduleRepository : BaseRepository<DoctorSchedule>, IDoctorScheduleRepository
    {
        public DoctorScheduleRepository(ApplicationDbContext context) : base(context) { }

        public async Task<DoctorSchedule?> GetDoctorScheduleWithDetailsAsync(int id)
            => await _dbSet.Include(ds => ds.Doctor)
                          .ThenInclude(d => d.User)
                          .Include(ds => ds.Doctor)
                          .ThenInclude(d => d.Department)
                          .FirstOrDefaultAsync(ds => ds.Id == id);

        public async Task<IEnumerable<DoctorSchedule>> GetSchedulesByDoctorAsync(int doctorId)
            => await _dbSet.Include(ds => ds.Doctor)
                          .ThenInclude(d => d.User)
                          .Where(ds => ds.DoctorId == doctorId)
                          .OrderBy(ds => ds.DayOfWeek)
                          .ThenBy(ds => ds.StartTime)
                          .ToListAsync();

        public async Task<IEnumerable<DoctorSchedule>> GetAvailableSchedulesByDoctorAsync(int doctorId)
            => await _dbSet.Include(ds => ds.Doctor)
                          .ThenInclude(d => d.User)
                          .Where(ds => ds.DoctorId == doctorId && ds.IsAvailable)
                          .OrderBy(ds => ds.DayOfWeek)
                          .ThenBy(ds => ds.StartTime)
                          .ToListAsync();

        public async Task<IEnumerable<DoctorSchedule>> GetSchedulesByDayOfWeekAsync(int doctorId, DayOfWeek dayOfWeek)
            => await _dbSet.Include(ds => ds.Doctor)
                          .ThenInclude(d => d.User)
                          .Where(ds => ds.DoctorId == doctorId && ds.DayOfWeek == dayOfWeek)
                          .OrderBy(ds => ds.StartTime)
                          .ToListAsync();
    }
}

