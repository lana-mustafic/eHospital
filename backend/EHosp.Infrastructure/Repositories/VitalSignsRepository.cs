using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class VitalSignsRepository : BaseRepository<VitalSigns>, IVitalSignsRepository
{
    public VitalSignsRepository(ApplicationDbContext context) : base(context) { }

    public async Task<VitalSigns?> GetVitalSignsWithDetailsAsync(int id)
        => await _dbSet.Include(vs => vs.Patient)
                      .ThenInclude(p => p.User)
                      .Include(vs => vs.MedicalRecord)
                      .Include(vs => vs.RecordedBy)
                      .FirstOrDefaultAsync(vs => vs.Id == id);

    public async Task<IEnumerable<VitalSigns>> GetAllVitalSignsWithDetailsAsync()
        => await _dbSet.Include(vs => vs.Patient)
                      .ThenInclude(p => p.User)
                      .Include(vs => vs.MedicalRecord)
                      .Include(vs => vs.RecordedBy)
                      .OrderByDescending(vs => vs.RecordedDate)
                      .ToListAsync();

    public async Task<IEnumerable<VitalSigns>> GetVitalSignsByPatientAsync(int patientId)
        => await _dbSet.Include(vs => vs.Patient)
                      .ThenInclude(p => p.User)
                      .Include(vs => vs.MedicalRecord)
                      .Include(vs => vs.RecordedBy)
                      .Where(vs => vs.PatientId == patientId)
                      .OrderByDescending(vs => vs.RecordedDate)
                      .ToListAsync();

    public async Task<IEnumerable<VitalSigns>> GetVitalSignsByPatientAndDateRangeAsync(int patientId, DateTime startDate, DateTime endDate)
        => await _dbSet.Include(vs => vs.Patient)
                      .ThenInclude(p => p.User)
                      .Include(vs => vs.MedicalRecord)
                      .Include(vs => vs.RecordedBy)
                      .Where(vs => vs.PatientId == patientId && vs.RecordedDate >= startDate && vs.RecordedDate <= endDate)
                      .OrderByDescending(vs => vs.RecordedDate)
                      .ToListAsync();
}

