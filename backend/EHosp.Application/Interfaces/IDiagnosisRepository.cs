using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces
{
    public interface IDiagnosisRepository : IRepository<Diagnosis>
    {
        Task<Diagnosis?> GetDiagnosisWithMedicalRecordsAsync(int id);
        Task<Diagnosis?> GetDiagnosisByCodeAsync(string code);
        Task<IEnumerable<Diagnosis>> SearchDiagnosesAsync(string searchTerm);
    }
}

