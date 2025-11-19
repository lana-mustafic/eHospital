using Microsoft.EntityFrameworkCore;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;

namespace EHosp.Infrastructure.Repositories;

public class QueueRepository : IQueueRepository
{
    private readonly ApplicationDbContext _context;

    public QueueRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Queue?> GetByIdAsync(int id)
    {
        return await _context.Set<Queue>()
            .Include(q => q.Appointment)
            .Include(q => q.Doctor)
                .ThenInclude(d => d.User)
            .Include(q => q.Patient)
                .ThenInclude(p => p.User)
            .FirstOrDefaultAsync(q => q.Id == id);
    }

    public async Task<IEnumerable<Queue>> GetAllAsync()
    {
        return await _context.Set<Queue>()
            .Include(q => q.Appointment)
            .Include(q => q.Doctor)
                .ThenInclude(d => d.User)
            .Include(q => q.Patient)
                .ThenInclude(p => p.User)
            .OrderBy(q => q.QueueDate)
            .ThenBy(q => q.QueueNumber)
            .ToListAsync();
    }

    public async Task<IEnumerable<Queue>> GetByDoctorAsync(int doctorId, DateTime? date = null)
    {
        var query = _context.Set<Queue>()
            .Include(q => q.Appointment)
            .Include(q => q.Doctor)
                .ThenInclude(d => d.User)
            .Include(q => q.Patient)
                .ThenInclude(p => p.User)
            .Where(q => q.DoctorId == doctorId);

        if (date.HasValue)
        {
            query = query.Where(q => q.QueueDate.Date == date.Value.Date);
        }

        return await query
            .OrderBy(q => q.QueueNumber)
            .ToListAsync();
    }

    public async Task<IEnumerable<Queue>> GetByDateAsync(DateTime date)
    {
        return await _context.Set<Queue>()
            .Include(q => q.Appointment)
            .Include(q => q.Doctor)
                .ThenInclude(d => d.User)
            .Include(q => q.Patient)
                .ThenInclude(p => p.User)
            .Where(q => q.QueueDate.Date == date.Date)
            .OrderBy(q => q.DoctorId)
            .ThenBy(q => q.QueueNumber)
            .ToListAsync();
    }

    public async Task<IEnumerable<Queue>> GetActiveQueuesAsync()
    {
        return await _context.Set<Queue>()
            .Include(q => q.Appointment)
            .Include(q => q.Doctor)
                .ThenInclude(d => d.User)
            .Include(q => q.Patient)
                .ThenInclude(p => p.User)
            .Where(q => q.Status == "Waiting" || q.Status == "InProgress")
            .OrderBy(q => q.QueueDate)
            .ThenBy(q => q.QueueNumber)
            .ToListAsync();
    }

    public async Task<Queue> AddAsync(Queue queue)
    {
        await _context.Set<Queue>().AddAsync(queue);
        await _context.SaveChangesAsync();
        return queue;
    }

    public async Task UpdateAsync(Queue queue)
    {
        queue.UpdatedAt = DateTime.UtcNow;
        _context.Set<Queue>().Update(queue);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Queue queue)
    {
        _context.Set<Queue>().Remove(queue);
        await _context.SaveChangesAsync();
    }

    public async Task<int> GetNextQueueNumberAsync(int doctorId, DateTime date)
    {
        var maxNumber = await _context.Set<Queue>()
            .Where(q => q.DoctorId == doctorId && q.QueueDate.Date == date.Date)
            .MaxAsync(q => (int?)q.QueueNumber) ?? 0;

        return maxNumber + 1;
    }

    public async Task<Queue?> GetCurrentPatientAsync(int doctorId)
    {
        return await _context.Set<Queue>()
            .Include(q => q.Appointment)
            .Include(q => q.Doctor)
                .ThenInclude(d => d.User)
            .Include(q => q.Patient)
                .ThenInclude(p => p.User)
            .Where(q => q.DoctorId == doctorId && q.Status == "InProgress")
            .FirstOrDefaultAsync();
    }
}

