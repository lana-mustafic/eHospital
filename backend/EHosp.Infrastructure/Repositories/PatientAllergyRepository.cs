using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class PatientAllergyRepository : BaseRepository<PatientAllergy>, IPatientAllergyRepository
{
    public PatientAllergyRepository(ApplicationDbContext context) : base(context) { }

    public async Task<PatientAllergy?> GetPatientAllergyWithDetailsAsync(int id)
        => await _dbSet.Include(pa => pa.Patient)
                      .ThenInclude(p => p.User)
                      .Include(pa => pa.RecordedByUser)
                      .FirstOrDefaultAsync(pa => pa.Id == id);

    public async Task<IEnumerable<PatientAllergy>> GetAllPatientAllergiesWithDetailsAsync()
        => await _dbSet.Include(pa => pa.Patient)
                      .ThenInclude(p => p.User)
                      .Include(pa => pa.RecordedByUser)
                      .OrderByDescending(pa => pa.CreatedAt)
                      .ToListAsync();

    public async Task<IEnumerable<PatientAllergy>> GetPatientAllergiesByPatientAsync(int patientId)
        => await _dbSet.Include(pa => pa.Patient)
                      .ThenInclude(p => p.User)
                      .Include(pa => pa.RecordedByUser)
                      .Where(pa => pa.PatientId == patientId)
                      .OrderByDescending(pa => pa.CreatedAt)
                      .ToListAsync();

    public async Task<IEnumerable<PatientAllergy>> GetActivePatientAllergiesByPatientAsync(int patientId)
        => await _dbSet.Include(pa => pa.Patient)
                      .ThenInclude(p => p.User)
                      .Include(pa => pa.RecordedByUser)
                      .Where(pa => pa.PatientId == patientId && pa.IsActive)
                      .OrderByDescending(pa => pa.CreatedAt)
                      .ToListAsync();
}

