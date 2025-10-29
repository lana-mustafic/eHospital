using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<bool> UserExistsAsync(string email);
        Task<IEnumerable<User>> GetUsersByRoleAsync(string roleName);
    }
}