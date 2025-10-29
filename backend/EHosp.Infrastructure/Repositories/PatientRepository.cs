using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories
{
    public class PatientRepository : BaseRepository<Patient>, IPatientRepository
    {
        public PatientRepository(ApplicationDbContext context) : base(context) { }

        public async Task<Patient?> GetPatientWithDetailsAsync(int id)
            => await _dbSet.Include(p => p.User)
                          .Include(p => p.MedicalRecords)
                          .Include(p => p.Appointments)
                          .FirstOrDefaultAsync(p => p.Id == id);

        public async Task<IEnumerable<Patient>> GetPatientsByDoctorAsync(int doctorId)
            => await _dbSet.Include(p => p.User)
                          .Where(p => p.Appointments.Any(a => a.DoctorId == doctorId))
                          .ToListAsync();
    }
}