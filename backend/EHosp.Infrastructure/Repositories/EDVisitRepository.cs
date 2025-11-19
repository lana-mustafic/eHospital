using Microsoft.EntityFrameworkCore;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;

namespace EHosp.Infrastructure.Repositories;

public class EDVisitRepository : IEDVisitRepository
{
    private readonly ApplicationDbContext _context;

    public EDVisitRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EDVisit?> GetByIdAsync(int id)
    {
        return await _context.Set<EDVisit>()
            .Include(e => e.Patient)
                .ThenInclude(p => p.User)
            .Include(e => e.TriageNurse)
            .Include(e => e.AssignedDoctor)
                .ThenInclude(d => d.User)
            .Include(e => e.TreatedByDoctor)
                .ThenInclude(d => d.User)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<IEnumerable<EDVisit>> GetAllAsync()
    {
        return await _context.Set<EDVisit>()
            .Include(e => e.Patient)
                .ThenInclude(p => p.User)
            .Include(e => e.TriageNurse)
            .Include(e => e.AssignedDoctor)
                .ThenInclude(d => d.User)
            .Include(e => e.TreatedByDoctor)
                .ThenInclude(d => d.User)
            .OrderByDescending(e => e.ArrivalTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<EDVisit>> GetActiveVisitsAsync()
    {
        return await _context.Set<EDVisit>()
            .Include(e => e.Patient)
                .ThenInclude(p => p.User)
            .Include(e => e.TriageNurse)
            .Include(e => e.AssignedDoctor)
                .ThenInclude(d => d.User)
            .Include(e => e.TreatedByDoctor)
                .ThenInclude(d => d.User)
            .Where(e => e.Status != "Discharged" && e.Status != "Admitted" && e.Status != "Transferred" && e.Status != "Deceased")
            .OrderBy(e => e.TriagePriority == "Critical" ? 1 : e.TriagePriority == "Urgent" ? 2 : 3)
            .ThenBy(e => e.ArrivalTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<EDVisit>> GetByPatientAsync(int patientId)
    {
        return await _context.Set<EDVisit>()
            .Include(e => e.Patient)
                .ThenInclude(p => p.User)
            .Include(e => e.TriageNurse)
            .Include(e => e.AssignedDoctor)
                .ThenInclude(d => d.User)
            .Include(e => e.TreatedByDoctor)
                .ThenInclude(d => d.User)
            .Where(e => e.PatientId == patientId)
            .OrderByDescending(e => e.ArrivalTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<EDVisit>> GetByStatusAsync(string status)
    {
        return await _context.Set<EDVisit>()
            .Include(e => e.Patient)
                .ThenInclude(p => p.User)
            .Include(e => e.TriageNurse)
            .Include(e => e.AssignedDoctor)
                .ThenInclude(d => d.User)
            .Include(e => e.TreatedByDoctor)
                .ThenInclude(d => d.User)
            .Where(e => e.Status == status)
            .OrderByDescending(e => e.ArrivalTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<EDVisit>> GetByTriagePriorityAsync(string priority)
    {
        return await _context.Set<EDVisit>()
            .Include(e => e.Patient)
                .ThenInclude(p => p.User)
            .Include(e => e.TriageNurse)
            .Include(e => e.AssignedDoctor)
                .ThenInclude(d => d.User)
            .Include(e => e.TreatedByDoctor)
                .ThenInclude(d => d.User)
            .Where(e => e.TriagePriority == priority)
            .OrderByDescending(e => e.ArrivalTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<EDVisit>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.Set<EDVisit>()
            .Include(e => e.Patient)
                .ThenInclude(p => p.User)
            .Include(e => e.TriageNurse)
            .Include(e => e.AssignedDoctor)
                .ThenInclude(d => d.User)
            .Include(e => e.TreatedByDoctor)
                .ThenInclude(d => d.User)
            .Where(e => e.ArrivalTime >= startDate && e.ArrivalTime <= endDate)
            .OrderByDescending(e => e.ArrivalTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<EDVisit>> GetByDoctorAsync(int doctorId)
    {
        return await _context.Set<EDVisit>()
            .Include(e => e.Patient)
                .ThenInclude(p => p.User)
            .Include(e => e.TriageNurse)
            .Include(e => e.AssignedDoctor)
                .ThenInclude(d => d.User)
            .Include(e => e.TreatedByDoctor)
                .ThenInclude(d => d.User)
            .Where(e => e.AssignedDoctorId == doctorId || e.TreatedByDoctorId == doctorId)
            .OrderByDescending(e => e.ArrivalTime)
            .ToListAsync();
    }

    public async Task<EDVisit> AddAsync(EDVisit edVisit)
    {
        await _context.Set<EDVisit>().AddAsync(edVisit);
        await _context.SaveChangesAsync();
        return edVisit;
    }

    public async Task UpdateAsync(EDVisit edVisit)
    {
        edVisit.UpdatedAt = DateTime.UtcNow;
        _context.Set<EDVisit>().Update(edVisit);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(EDVisit edVisit)
    {
        _context.Set<EDVisit>().Remove(edVisit);
        await _context.SaveChangesAsync();
    }

    public async Task<int> GetActiveVisitCountAsync()
    {
        return await _context.Set<EDVisit>()
            .CountAsync(e => e.Status != "Discharged" && e.Status != "Admitted" && e.Status != "Transferred" && e.Status != "Deceased");
    }

    public async Task<int> GetVisitCountByPriorityAsync(string priority)
    {
        return await _context.Set<EDVisit>()
            .CountAsync(e => e.TriagePriority == priority && 
                           e.Status != "Discharged" && 
                           e.Status != "Admitted" && 
                           e.Status != "Transferred" && 
                           e.Status != "Deceased");
    }
}

