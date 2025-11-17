using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class FamilyMedicalHistoryRepository : BaseRepository<FamilyMedicalHistory>, IFamilyMedicalHistoryRepository
{
    public FamilyMedicalHistoryRepository(ApplicationDbContext context) : base(context) { }

    public async Task<FamilyMedicalHistory?> GetFamilyMedicalHistoryWithDetailsAsync(int id)
        => await _dbSet.Include(fmh => fmh.Patient)
                      .ThenInclude(p => p.User)
                      .Include(fmh => fmh.RecordedByUser)
                      .FirstOrDefaultAsync(fmh => fmh.Id == id);

    public async Task<IEnumerable<FamilyMedicalHistory>> GetAllFamilyMedicalHistoriesWithDetailsAsync()
        => await _dbSet.Include(fmh => fmh.Patient)
                      .ThenInclude(p => p.User)
                      .Include(fmh => fmh.RecordedByUser)
                      .OrderByDescending(fmh => fmh.CreatedAt)
                      .ToListAsync();

    public async Task<IEnumerable<FamilyMedicalHistory>> GetFamilyMedicalHistoriesByPatientAsync(int patientId)
        => await _dbSet.Include(fmh => fmh.Patient)
                      .ThenInclude(p => p.User)
                      .Include(fmh => fmh.RecordedByUser)
                      .Where(fmh => fmh.PatientId == patientId)
                      .OrderByDescending(fmh => fmh.CreatedAt)
                      .ToListAsync();
}

