using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories
{
    public class DepartmentRepository : BaseRepository<Department>, IDepartmentRepository
    {
        public DepartmentRepository(ApplicationDbContext context) : base(context) { }

        public async Task<Department?> GetDepartmentWithDoctorsAsync(int id)
            => await _dbSet.Include(d => d.Doctors)
                          .ThenInclude(doc => doc.User)
                          .FirstOrDefaultAsync(d => d.Id == id);
    }
}

