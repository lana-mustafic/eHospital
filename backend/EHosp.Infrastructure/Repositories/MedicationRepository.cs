using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories
{
    public class MedicationRepository : BaseRepository<Medication>, IMedicationRepository
    {
        public MedicationRepository(ApplicationDbContext context) : base(context) { }

        public async Task<Medication?> GetMedicationWithPrescriptionsAsync(int id)
            => await _dbSet.Include(m => m.Prescriptions)
                          .FirstOrDefaultAsync(m => m.Id == id);

        public async Task<IEnumerable<Medication>> GetActiveMedicationsAsync()
            => await _dbSet.Where(m => m.IsActive)
                          .OrderBy(m => m.Name)
                          .ToListAsync();

        public async Task<IEnumerable<Medication>> GetMedicationsByFormAsync(string form)
            => await _dbSet.Where(m => m.Form.ToLower() == form.ToLower() && m.IsActive)
                          .OrderBy(m => m.Name)
                          .ToListAsync();

        public async Task<IEnumerable<Medication>> GetLowStockMedicationsAsync(int threshold)
            => await _dbSet.Where(m => m.StockQuantity <= threshold && m.IsActive)
                          .OrderBy(m => m.StockQuantity)
                          .ToListAsync();
    }
}

