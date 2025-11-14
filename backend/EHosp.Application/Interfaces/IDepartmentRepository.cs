using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces
{
    public interface IDepartmentRepository : IRepository<Department>
    {
        Task<Department?> GetDepartmentWithDoctorsAsync(int id);
    }
}

