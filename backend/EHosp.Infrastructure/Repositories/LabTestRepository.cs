using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class LabTestRepository : BaseRepository<LabTest>, ILabTestRepository
{
    public LabTestRepository(ApplicationDbContext context) : base(context) { }

    public async Task<LabTest?> GetLabTestWithDetailsAsync(int id)
        => await _dbSet.Include(lt => lt.Patient)
                      .ThenInclude(p => p.User)
                      .Include(lt => lt.Doctor)
                      .ThenInclude(d => d.User)
                      .Include(lt => lt.MedicalRecord)
                      .Include(lt => lt.PerformedBy)
                      .FirstOrDefaultAsync(lt => lt.Id == id);

    public async Task<IEnumerable<LabTest>> GetAllLabTestsWithDetailsAsync()
        => await _dbSet.Include(lt => lt.Patient)
                      .ThenInclude(p => p.User)
                      .Include(lt => lt.Doctor)
                      .ThenInclude(d => d.User)
                      .Include(lt => lt.MedicalRecord)
                      .Include(lt => lt.PerformedBy)
                      .OrderByDescending(lt => lt.OrderedDate)
                      .ToListAsync();

    public async Task<IEnumerable<LabTest>> GetLabTestsByPatientAsync(int patientId)
        => await _dbSet.Include(lt => lt.Patient)
                      .ThenInclude(p => p.User)
                      .Include(lt => lt.Doctor)
                      .ThenInclude(d => d.User)
                      .Include(lt => lt.MedicalRecord)
                      .Include(lt => lt.PerformedBy)
                      .Where(lt => lt.PatientId == patientId)
                      .OrderByDescending(lt => lt.OrderedDate)
                      .ToListAsync();

    public async Task<IEnumerable<LabTest>> GetLabTestsByDoctorAsync(int doctorId)
        => await _dbSet.Include(lt => lt.Patient)
                      .ThenInclude(p => p.User)
                      .Include(lt => lt.Doctor)
                      .ThenInclude(d => d.User)
                      .Include(lt => lt.MedicalRecord)
                      .Include(lt => lt.PerformedBy)
                      .Where(lt => lt.DoctorId == doctorId)
                      .OrderByDescending(lt => lt.OrderedDate)
                      .ToListAsync();

    public async Task<IEnumerable<LabTest>> GetLabTestsByStatusAsync(string status)
        => await _dbSet.Include(lt => lt.Patient)
                      .ThenInclude(p => p.User)
                      .Include(lt => lt.Doctor)
                      .ThenInclude(d => d.User)
                      .Include(lt => lt.MedicalRecord)
                      .Include(lt => lt.PerformedBy)
                      .Where(lt => lt.Status == status)
                      .OrderByDescending(lt => lt.OrderedDate)
                      .ToListAsync();

    public async Task<IEnumerable<LabTest>> GetLabTestsByPatientAndStatusAsync(int patientId, string status)
        => await _dbSet.Include(lt => lt.Patient)
                      .ThenInclude(p => p.User)
                      .Include(lt => lt.Doctor)
                      .ThenInclude(d => d.User)
                      .Include(lt => lt.MedicalRecord)
                      .Include(lt => lt.PerformedBy)
                      .Where(lt => lt.PatientId == patientId && lt.Status == status)
                      .OrderByDescending(lt => lt.OrderedDate)
                      .ToListAsync();
}

