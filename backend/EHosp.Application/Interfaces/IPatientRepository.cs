using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces
{
    public interface IPatientRepository : IRepository<Patient>
    {
        Task<Patient?> GetPatientWithDetailsAsync(int id);
        Task<IEnumerable<Patient>> GetPatientsByDoctorAsync(int doctorId);
        Task<Patient?> GetByUserIdAsync(int userId);
    }
}