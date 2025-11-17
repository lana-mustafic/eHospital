using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IPatientAllergyRepository : IRepository<PatientAllergy>
{
    Task<PatientAllergy?> GetPatientAllergyWithDetailsAsync(int id);
    Task<IEnumerable<PatientAllergy>> GetAllPatientAllergiesWithDetailsAsync();
    Task<IEnumerable<PatientAllergy>> GetPatientAllergiesByPatientAsync(int patientId);
    Task<IEnumerable<PatientAllergy>> GetActivePatientAllergiesByPatientAsync(int patientId);
}

