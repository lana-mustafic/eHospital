using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IAdmissionRepository : IRepository<Admission>
{
    Task<Admission?> GetAdmissionWithDetailsAsync(int id);
    Task<IEnumerable<Admission>> GetAllAdmissionsWithDetailsAsync();
    Task<IEnumerable<Admission>> GetAdmissionsByPatientAsync(int patientId);
    Task<IEnumerable<Admission>> GetAdmissionsByStatusAsync(string status);
    Task<IEnumerable<Admission>> GetActiveAdmissionsAsync();
    Task<IEnumerable<Admission>> GetAdmissionsByRoomAsync(int roomId);
    Task<IEnumerable<Admission>> GetAdmissionsByBedAsync(int bedId);
    Task<Admission?> GetActiveAdmissionByPatientAsync(int patientId);
    Task<Admission?> GetActiveAdmissionByBedAsync(int bedId);
}

