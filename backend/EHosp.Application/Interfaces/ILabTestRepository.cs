using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface ILabTestRepository : IRepository<LabTest>
{
    Task<LabTest?> GetLabTestWithDetailsAsync(int id);
    Task<IEnumerable<LabTest>> GetAllLabTestsWithDetailsAsync();
    Task<IEnumerable<LabTest>> GetLabTestsByPatientAsync(int patientId);
    Task<IEnumerable<LabTest>> GetLabTestsByDoctorAsync(int doctorId);
    Task<IEnumerable<LabTest>> GetLabTestsByStatusAsync(string status);
    Task<IEnumerable<LabTest>> GetLabTestsByPatientAndStatusAsync(int patientId, string status);
}

