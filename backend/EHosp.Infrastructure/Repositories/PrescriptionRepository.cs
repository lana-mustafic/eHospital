using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories
{
    public class PrescriptionRepository : BaseRepository<Prescription>, IPrescriptionRepository
    {
        public PrescriptionRepository(ApplicationDbContext context) : base(context) { }

        public async Task<Prescription?> GetPrescriptionWithDetailsAsync(int id)
            => await _dbSet.Include(p => p.MedicalRecord)
                          .ThenInclude(mr => mr.Patient)
                          .ThenInclude(pat => pat.User)
                          .Include(p => p.MedicalRecord)
                          .ThenInclude(mr => mr.Doctor)
                          .ThenInclude(doc => doc.User)
                          .Include(p => p.Medication)
                          .Include(p => p.Doctor)
                          .ThenInclude(doc => doc.User)
                          .FirstOrDefaultAsync(p => p.Id == id);

        public async Task<IEnumerable<Prescription>> GetPrescriptionsByMedicalRecordAsync(int medicalRecordId)
            => await _dbSet.Include(p => p.MedicalRecord)
                          .ThenInclude(mr => mr.Patient)
                          .ThenInclude(pat => pat.User)
                          .Include(p => p.Medication)
                          .Include(p => p.Doctor)
                          .ThenInclude(doc => doc.User)
                          .Where(p => p.MedicalRecordId == medicalRecordId)
                          .OrderByDescending(p => p.PrescribedDate)
                          .ToListAsync();

        public async Task<IEnumerable<Prescription>> GetPrescriptionsByPatientAsync(int patientId)
            => await _dbSet.Include(p => p.MedicalRecord)
                          .ThenInclude(mr => mr.Patient)
                          .ThenInclude(pat => pat.User)
                          .Include(p => p.Medication)
                          .Include(p => p.Doctor)
                          .ThenInclude(doc => doc.User)
                          .Where(p => p.MedicalRecord.PatientId == patientId)
                          .OrderByDescending(p => p.PrescribedDate)
                          .ToListAsync();

        public async Task<IEnumerable<Prescription>> GetPrescriptionsByDoctorAsync(int doctorId)
            => await _dbSet.Include(p => p.MedicalRecord)
                          .ThenInclude(mr => mr.Patient)
                          .ThenInclude(pat => pat.User)
                          .Include(p => p.Medication)
                          .Include(p => p.Doctor)
                          .ThenInclude(doc => doc.User)
                          .Where(p => p.DoctorId == doctorId)
                          .OrderByDescending(p => p.PrescribedDate)
                          .ToListAsync();

        public async Task<IEnumerable<Prescription>> GetPrescriptionsByMedicationAsync(int medicationId)
            => await _dbSet.Include(p => p.MedicalRecord)
                          .ThenInclude(mr => mr.Patient)
                          .ThenInclude(pat => pat.User)
                          .Include(p => p.Medication)
                          .Include(p => p.Doctor)
                          .ThenInclude(doc => doc.User)
                          .Where(p => p.MedicationId == medicationId)
                          .OrderByDescending(p => p.PrescribedDate)
                          .ToListAsync();

        public async Task<IEnumerable<Prescription>> GetAllPrescriptionsWithDetailsAsync()
            => await _dbSet.Include(p => p.MedicalRecord)
                          .ThenInclude(mr => mr.Patient)
                          .ThenInclude(pat => pat.User)
                          .Include(p => p.MedicalRecord)
                          .ThenInclude(mr => mr.Doctor)
                          .ThenInclude(doc => doc.User)
                          .Include(p => p.Medication)
                          .Include(p => p.Doctor)
                          .ThenInclude(doc => doc.User)
                          .OrderByDescending(p => p.PrescribedDate)
                          .ToListAsync();
    }
}

