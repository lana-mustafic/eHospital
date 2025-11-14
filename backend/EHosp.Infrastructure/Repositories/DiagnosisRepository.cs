using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories
{
    public class DiagnosisRepository : BaseRepository<Diagnosis>, IDiagnosisRepository
    {
        public DiagnosisRepository(ApplicationDbContext context) : base(context) { }

        public async Task<Diagnosis?> GetDiagnosisWithMedicalRecordsAsync(int id)
            => await _dbSet.Include(d => d.MedicalRecords)
                          .FirstOrDefaultAsync(d => d.Id == id);

        public async Task<Diagnosis?> GetDiagnosisByCodeAsync(string code)
            => await _dbSet.FirstOrDefaultAsync(d => d.Code.ToLower() == code.ToLower());

        public async Task<IEnumerable<Diagnosis>> SearchDiagnosesAsync(string searchTerm)
            => await _dbSet.Where(d => 
                d.Code.Contains(searchTerm) || 
                d.Name.Contains(searchTerm) || 
                d.Description.Contains(searchTerm))
                .OrderBy(d => d.Code)
                .ToListAsync();
    }
}

