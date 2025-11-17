using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories
{
    public class AppointmentRepository : BaseRepository<Appointment>, IAppointmentRepository
    {
        public AppointmentRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<Appointment>> GetAppointmentsByDoctorAsync(int doctorId, DateTime date)
            => await _dbSet.Include(a => a.Patient)
                          .ThenInclude(p => p.User)
                          .Include(a => a.Doctor)
                          .ThenInclude(d => d.User)
                          .Where(a => a.DoctorId == doctorId && a.AppointmentDate.Date == date.Date)
                          .ToListAsync();

        public async Task<IEnumerable<Appointment>> GetAppointmentsByPatientAsync(int patientId)
            => await _dbSet.Include(a => a.Doctor)
                          .ThenInclude(d => d.User)
                          .Include(a => a.Patient)
                          .ThenInclude(p => p.User)
                          .Where(a => a.PatientId == patientId)
                          .ToListAsync();

        public async Task<IEnumerable<Appointment>> GetAppointmentsByDateAsync(DateTime date)
            => await _dbSet.Include(a => a.Patient)
                          .ThenInclude(p => p.User)
                          .Include(a => a.Doctor)
                          .ThenInclude(d => d.User)
                          .Where(a => a.AppointmentDate.Date == date.Date)
                          .ToListAsync();

        public async Task<bool> IsTimeSlotAvailableAsync(int doctorId, DateTime date, TimeSpan startTime, TimeSpan endTime)
            => !await _dbSet.AnyAsync(a => a.DoctorId == doctorId &&
                                         a.AppointmentDate.Date == date.Date &&
                                         a.Status != "Cancelled" &&
                                         ((a.StartTime <= startTime && a.EndTime > startTime) ||
                                          (a.StartTime < endTime && a.EndTime >= endTime) ||
                                          (a.StartTime >= startTime && a.EndTime <= endTime)));

        public async Task<IEnumerable<Appointment>> GetUpcomingAppointmentsAsync(DateTime fromDate, DateTime toDate)
            => await _dbSet.Include(a => a.Patient)
                          .ThenInclude(p => p.User)
                          .Include(a => a.Doctor)
                          .ThenInclude(d => d.User)
                          .Where(a => a.AppointmentDate >= fromDate &&
                                     a.AppointmentDate <= toDate &&
                                     a.Status == "Scheduled")
                          .OrderBy(a => a.AppointmentDate)
                          .ThenBy(a => a.StartTime)
                          .ToListAsync();
    }
}