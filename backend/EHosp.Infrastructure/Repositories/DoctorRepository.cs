using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories
{
    public class DoctorRepository : BaseRepository<Doctor>, IDoctorRepository
    {
        public DoctorRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<Doctor>> GetDoctorsByDepartmentAsync(int departmentId)
            => await _dbSet.Include(d => d.User)
                          .Include(d => d.Department)
                          .Where(d => d.DepartmentId == departmentId)
                          .ToListAsync();

        public async Task<IEnumerable<Doctor>> GetDoctorsBySpecializationAsync(string specialization)
            => await _dbSet.Include(d => d.User)
                          .Include(d => d.Department)
                          .Where(d => d.Specialization.Contains(specialization))
                          .ToListAsync();

        public async Task<Doctor?> GetDoctorWithDetailsAsync(int id)
            => await _dbSet.Include(d => d.User)
                          .Include(d => d.Department)
                          .Include(d => d.Schedules)
                          .FirstOrDefaultAsync(d => d.Id == id);
    }
}