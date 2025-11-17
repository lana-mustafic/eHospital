using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class DischargeSummaryRepository : BaseRepository<DischargeSummary>, IDischargeSummaryRepository
{
    public DischargeSummaryRepository(ApplicationDbContext context) : base(context) { }

    public async Task<DischargeSummary?> GetDischargeSummaryWithDetailsAsync(int id)
        => await _dbSet.Include(ds => ds.Patient)
                      .ThenInclude(p => p.User)
                      .Include(ds => ds.DischargingDoctor)
                      .ThenInclude(d => d.User)
                      .Include(ds => ds.FollowUpDoctor)
                      .ThenInclude(d => d.User)
                      .Include(ds => ds.MedicalRecord)
                      .Include(ds => ds.Appointment)
                      .Include(ds => ds.CreatedByUser)
                      .FirstOrDefaultAsync(ds => ds.Id == id);

    public async Task<IEnumerable<DischargeSummary>> GetAllDischargeSummariesWithDetailsAsync()
        => await _dbSet.Include(ds => ds.Patient)
                      .ThenInclude(p => p.User)
                      .Include(ds => ds.DischargingDoctor)
                      .ThenInclude(d => d.User)
                      .Include(ds => ds.FollowUpDoctor)
                      .ThenInclude(d => d.User)
                      .Include(ds => ds.MedicalRecord)
                      .Include(ds => ds.Appointment)
                      .OrderByDescending(ds => ds.DischargeDate)
                      .ToListAsync();

    public async Task<IEnumerable<DischargeSummary>> GetDischargeSummariesByPatientAsync(int patientId)
        => await _dbSet.Include(ds => ds.Patient)
                      .ThenInclude(p => p.User)
                      .Include(ds => ds.DischargingDoctor)
                      .ThenInclude(d => d.User)
                      .Include(ds => ds.FollowUpDoctor)
                      .ThenInclude(d => d.User)
                      .Where(ds => ds.PatientId == patientId)
                      .OrderByDescending(ds => ds.DischargeDate)
                      .ToListAsync();

    public async Task<IEnumerable<DischargeSummary>> GetDischargeSummariesByDoctorAsync(int doctorId)
        => await _dbSet.Include(ds => ds.Patient)
                      .ThenInclude(p => p.User)
                      .Include(ds => ds.DischargingDoctor)
                      .ThenInclude(d => d.User)
                      .Include(ds => ds.FollowUpDoctor)
                      .ThenInclude(d => d.User)
                      .Where(ds => ds.DischargingDoctorId == doctorId)
                      .OrderByDescending(ds => ds.DischargeDate)
                      .ToListAsync();

    public async Task<DischargeSummary?> GetDischargeSummaryByDischargeNumberAsync(string dischargeNumber)
        => await _dbSet.Include(ds => ds.Patient)
                      .ThenInclude(p => p.User)
                      .Include(ds => ds.DischargingDoctor)
                      .ThenInclude(d => d.User)
                      .Include(ds => ds.FollowUpDoctor)
                      .ThenInclude(d => d.User)
                      .FirstOrDefaultAsync(ds => ds.DischargeNumber == dischargeNumber);

    public async Task<string> GenerateNextDischargeNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        var lastSummary = await _dbSet
            .Where(ds => ds.DischargeNumber.StartsWith($"DS{year}"))
            .OrderByDescending(ds => ds.DischargeNumber)
            .FirstOrDefaultAsync();

        if (lastSummary == null)
        {
            return $"DS{year}0001";
        }

        var lastNumber = int.Parse(lastSummary.DischargeNumber.Substring(6));
        return $"DS{year}{(lastNumber + 1):D4}";
    }
}

