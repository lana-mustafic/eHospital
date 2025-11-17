using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories
{
    public class MedicalRecordRepository : BaseRepository<MedicalRecord>, IMedicalRecordRepository
    {
        public MedicalRecordRepository(ApplicationDbContext context) : base(context) { }

        public async Task<MedicalRecord?> GetMedicalRecordWithDetailsAsync(int id)
            => await _dbSet.Include(mr => mr.Patient)
                          .ThenInclude(p => p.User)
                          .Include(mr => mr.Doctor)
                          .ThenInclude(d => d.User)
                          .Include(mr => mr.Diagnosis)
                          .Include(mr => mr.Prescriptions)
                          .ThenInclude(p => p.Medication)
                          .FirstOrDefaultAsync(mr => mr.Id == id);

        public async Task<IEnumerable<MedicalRecord>> GetMedicalRecordsByPatientAsync(int patientId)
            => await _dbSet.Include(mr => mr.Patient)
                          .ThenInclude(p => p.User)
                          .Include(mr => mr.Doctor)
                          .ThenInclude(d => d.User)
                          .Include(mr => mr.Diagnosis)
                          .Where(mr => mr.PatientId == patientId)
                          .OrderByDescending(mr => mr.VisitDate)
                          .ToListAsync();

        public async Task<IEnumerable<MedicalRecord>> GetMedicalRecordsByDoctorAsync(int doctorId)
            => await _dbSet.Include(mr => mr.Patient)
                          .ThenInclude(p => p.User)
                          .Include(mr => mr.Doctor)
                          .ThenInclude(d => d.User)
                          .Include(mr => mr.Diagnosis)
                          .Where(mr => mr.DoctorId == doctorId)
                          .OrderByDescending(mr => mr.VisitDate)
                          .ToListAsync();

        public async Task<IEnumerable<MedicalRecord>> GetMedicalRecordsByPatientAndDoctorAsync(int patientId, int doctorId)
            => await _dbSet.Include(mr => mr.Patient)
                          .ThenInclude(p => p.User)
                          .Include(mr => mr.Doctor)
                          .ThenInclude(d => d.User)
                          .Include(mr => mr.Diagnosis)
                          .Where(mr => mr.PatientId == patientId && mr.DoctorId == doctorId)
                          .OrderByDescending(mr => mr.VisitDate)
                          .ToListAsync();

        public async Task<IEnumerable<MedicalRecord>> GetAllMedicalRecordsWithDetailsAsync()
            => await _dbSet.Include(mr => mr.Patient)
                          .ThenInclude(p => p.User)
                          .Include(mr => mr.Doctor)
                          .ThenInclude(d => d.User)
                          .Include(mr => mr.Diagnosis)
                          .Include(mr => mr.Prescriptions)
                          .ThenInclude(p => p.Medication)
                          .OrderByDescending(mr => mr.VisitDate)
                          .ToListAsync();
    }
}

