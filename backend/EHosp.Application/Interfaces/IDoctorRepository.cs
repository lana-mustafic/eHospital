using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces
{
    public interface IDoctorRepository : IRepository<Doctor>
    {
        Task<IEnumerable<Doctor>> GetDoctorsByDepartmentAsync(int departmentId);
        Task<IEnumerable<Doctor>> GetDoctorsBySpecializationAsync(string specialization);
        Task<Doctor?> GetDoctorWithDetailsAsync(int id);
        Task<Doctor?> GetByUserIdAsync(int userId);
    }
}