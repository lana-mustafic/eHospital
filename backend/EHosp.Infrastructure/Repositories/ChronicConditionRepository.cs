using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class ChronicConditionRepository : BaseRepository<ChronicCondition>, IChronicConditionRepository
{
    public ChronicConditionRepository(ApplicationDbContext context) : base(context) { }

    public async Task<ChronicCondition?> GetChronicConditionWithDetailsAsync(int id)
        => await _dbSet.Include(cc => cc.Patient)
                      .ThenInclude(p => p.User)
                      .Include(cc => cc.DiagnosedByDoctor)
                      .ThenInclude(d => d.User)
                      .Include(cc => cc.RecordedByUser)
                      .FirstOrDefaultAsync(cc => cc.Id == id);

    public async Task<IEnumerable<ChronicCondition>> GetAllChronicConditionsWithDetailsAsync()
        => await _dbSet.Include(cc => cc.Patient)
                      .ThenInclude(p => p.User)
                      .Include(cc => cc.DiagnosedByDoctor)
                      .ThenInclude(d => d.User)
                      .Include(cc => cc.RecordedByUser)
                      .OrderByDescending(cc => cc.CreatedAt)
                      .ToListAsync();

    public async Task<IEnumerable<ChronicCondition>> GetChronicConditionsByPatientAsync(int patientId)
        => await _dbSet.Include(cc => cc.Patient)
                      .ThenInclude(p => p.User)
                      .Include(cc => cc.DiagnosedByDoctor)
                      .ThenInclude(d => d.User)
                      .Include(cc => cc.RecordedByUser)
                      .Where(cc => cc.PatientId == patientId)
                      .OrderByDescending(cc => cc.CreatedAt)
                      .ToListAsync();

    public async Task<IEnumerable<ChronicCondition>> GetActiveChronicConditionsByPatientAsync(int patientId)
        => await _dbSet.Include(cc => cc.Patient)
                      .ThenInclude(p => p.User)
                      .Include(cc => cc.DiagnosedByDoctor)
                      .ThenInclude(d => d.User)
                      .Include(cc => cc.RecordedByUser)
                      .Where(cc => cc.PatientId == patientId && cc.IsActive)
                      .OrderByDescending(cc => cc.CreatedAt)
                      .ToListAsync();
}

