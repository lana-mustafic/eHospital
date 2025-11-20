using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class PatientInsuranceRepository : BaseRepository<PatientInsurance>, IPatientInsuranceRepository
{
    public PatientInsuranceRepository(ApplicationDbContext context) : base(context) { }

    public async Task<PatientInsurance?> GetPatientInsuranceWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(pi => pi.Patient)
            .ThenInclude(p => p.User)
            .Include(pi => pi.InsuranceProvider)
            .Include(pi => pi.VerifiedByUser)
            .FirstOrDefaultAsync(pi => pi.Id == id);
    }

    public async Task<IEnumerable<PatientInsurance>> GetPatientInsurancesByPatientAsync(int patientId)
    {
        return await _dbSet
            .Include(pi => pi.InsuranceProvider)
            .Include(pi => pi.VerifiedByUser)
            .Where(pi => pi.PatientId == patientId)
            .OrderByDescending(pi => pi.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<PatientInsurance>> GetActivePatientInsurancesByPatientAsync(int patientId)
    {
        return await _dbSet
            .Include(pi => pi.InsuranceProvider)
            .Include(pi => pi.VerifiedByUser)
            .Where(pi => pi.PatientId == patientId && pi.IsActive)
            .OrderByDescending(pi => pi.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<PatientInsurance>> GetAllPatientInsurancesWithDetailsAsync()
    {
        return await _dbSet
            .Include(pi => pi.Patient)
            .ThenInclude(p => p.User)
            .Include(pi => pi.InsuranceProvider)
            .Include(pi => pi.VerifiedByUser)
            .OrderByDescending(pi => pi.CreatedAt)
            .ToListAsync();
    }
}

