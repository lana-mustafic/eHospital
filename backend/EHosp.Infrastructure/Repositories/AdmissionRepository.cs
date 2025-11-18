using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class AdmissionRepository : BaseRepository<Admission>, IAdmissionRepository
{
    public AdmissionRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Admission?> GetAdmissionWithDetailsAsync(int id)
        => await _dbSet.Include(a => a.Patient)
                      .ThenInclude(p => p.User)
                      .Include(a => a.Room)
                      .ThenInclude(r => r.RoomType)
                      .Include(a => a.Bed)
                      .Include(a => a.AdmittingDoctor)
                      .ThenInclude(d => d.User)
                      .Include(a => a.DischargingDoctor)
                      .ThenInclude(d => d.User)
                      .Include(a => a.CreatedBy)
                      .Include(a => a.RoomTransfers)
                      .FirstOrDefaultAsync(a => a.Id == id);

    public async Task<IEnumerable<Admission>> GetAllAdmissionsWithDetailsAsync()
        => await _dbSet.Include(a => a.Patient)
                      .ThenInclude(p => p.User)
                      .Include(a => a.Room)
                      .ThenInclude(r => r.RoomType)
                      .Include(a => a.Bed)
                      .Include(a => a.AdmittingDoctor)
                      .ThenInclude(d => d.User)
                      .Include(a => a.DischargingDoctor)
                      .ThenInclude(d => d.User)
                      .OrderByDescending(a => a.AdmissionDate)
                      .ToListAsync();

    public async Task<IEnumerable<Admission>> GetAdmissionsByPatientAsync(int patientId)
        => await _dbSet.Include(a => a.Patient)
                      .ThenInclude(p => p.User)
                      .Include(a => a.Room)
                      .ThenInclude(r => r.RoomType)
                      .Include(a => a.Bed)
                      .Include(a => a.AdmittingDoctor)
                      .ThenInclude(d => d.User)
                      .Where(a => a.PatientId == patientId)
                      .OrderByDescending(a => a.AdmissionDate)
                      .ToListAsync();

    public async Task<IEnumerable<Admission>> GetAdmissionsByStatusAsync(string status)
        => await _dbSet.Include(a => a.Patient)
                      .ThenInclude(p => p.User)
                      .Include(a => a.Room)
                      .ThenInclude(r => r.RoomType)
                      .Include(a => a.Bed)
                      .Include(a => a.AdmittingDoctor)
                      .ThenInclude(d => d.User)
                      .Where(a => a.Status == status)
                      .OrderByDescending(a => a.AdmissionDate)
                      .ToListAsync();

    public async Task<IEnumerable<Admission>> GetActiveAdmissionsAsync()
        => await _dbSet.Include(a => a.Patient)
                      .ThenInclude(p => p.User)
                      .Include(a => a.Room)
                      .ThenInclude(r => r.RoomType)
                      .Include(a => a.Bed)
                      .Include(a => a.AdmittingDoctor)
                      .ThenInclude(d => d.User)
                      .Where(a => a.Status == "Admitted")
                      .OrderByDescending(a => a.AdmissionDate)
                      .ToListAsync();

    public async Task<IEnumerable<Admission>> GetAdmissionsByRoomAsync(int roomId)
        => await _dbSet.Include(a => a.Patient)
                      .ThenInclude(p => p.User)
                      .Include(a => a.Room)
                      .ThenInclude(r => r.RoomType)
                      .Include(a => a.Bed)
                      .Include(a => a.AdmittingDoctor)
                      .ThenInclude(d => d.User)
                      .Where(a => a.RoomId == roomId && a.Status == "Admitted")
                      .OrderByDescending(a => a.AdmissionDate)
                      .ToListAsync();

    public async Task<IEnumerable<Admission>> GetAdmissionsByBedAsync(int bedId)
        => await _dbSet.Include(a => a.Patient)
                      .ThenInclude(p => p.User)
                      .Include(a => a.Room)
                      .ThenInclude(r => r.RoomType)
                      .Include(a => a.Bed)
                      .Include(a => a.AdmittingDoctor)
                      .ThenInclude(d => d.User)
                      .Where(a => a.BedId == bedId && a.Status == "Admitted")
                      .OrderByDescending(a => a.AdmissionDate)
                      .ToListAsync();

    public async Task<Admission?> GetActiveAdmissionByPatientAsync(int patientId)
        => await _dbSet.Include(a => a.Patient)
                      .ThenInclude(p => p.User)
                      .Include(a => a.Room)
                      .ThenInclude(r => r.RoomType)
                      .Include(a => a.Bed)
                      .Include(a => a.AdmittingDoctor)
                      .ThenInclude(d => d.User)
                      .FirstOrDefaultAsync(a => a.PatientId == patientId && a.Status == "Admitted");

    public async Task<Admission?> GetActiveAdmissionByBedAsync(int bedId)
        => await _dbSet.Include(a => a.Patient)
                      .ThenInclude(p => p.User)
                      .Include(a => a.Room)
                      .ThenInclude(r => r.RoomType)
                      .Include(a => a.Bed)
                      .Include(a => a.AdmittingDoctor)
                      .ThenInclude(d => d.User)
                      .FirstOrDefaultAsync(a => a.BedId == bedId && a.Status == "Admitted");
}

