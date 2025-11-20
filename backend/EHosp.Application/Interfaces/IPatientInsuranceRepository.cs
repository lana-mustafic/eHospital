using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IPatientInsuranceRepository : IRepository<PatientInsurance>
{
    Task<PatientInsurance?> GetPatientInsuranceWithDetailsAsync(int id);
    Task<IEnumerable<PatientInsurance>> GetPatientInsurancesByPatientAsync(int patientId);
    Task<IEnumerable<PatientInsurance>> GetActivePatientInsurancesByPatientAsync(int patientId);
    Task<IEnumerable<PatientInsurance>> GetAllPatientInsurancesWithDetailsAsync();
}

