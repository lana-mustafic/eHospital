using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<User?> GetByIdAsync(int id)
            => await _dbSet.Include(u => u.Role)
                           .FirstOrDefaultAsync(u => u.Id == id);

        public override async Task<IEnumerable<User>> GetAllAsync()
            => await _dbSet.Include(u => u.Role)
                           .ToListAsync();

        public async Task<User?> GetByEmailAsync(string email)
            => await _dbSet.Include(u => u.Role)
                          .FirstOrDefaultAsync(u => u.Email == email);

        public async Task<bool> UserExistsAsync(string email)
            => await _dbSet.AnyAsync(u => u.Email == email);

        public async Task<IEnumerable<User>> GetUsersByRoleAsync(string roleName)
            => await _dbSet.Include(u => u.Role)
                          .Where(u => u.Role.Name == roleName)
                          .ToListAsync();
    }
}