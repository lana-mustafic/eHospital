using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class DrugInteractionRepository : BaseRepository<DrugInteraction>, IDrugInteractionRepository
{
    public DrugInteractionRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<DrugInteraction>> GetInteractionsByMedicationAsync(int medicationId)
    {
        return await _dbSet
            .Include(di => di.Medication1)
            .Include(di => di.Medication2)
            .Where(di => (di.Medication1Id == medicationId || di.Medication2Id == medicationId) && di.IsActive)
            .ToListAsync();
    }

    public async Task<DrugInteraction?> GetInteractionBetweenMedicationsAsync(int medication1Id, int medication2Id)
    {
        return await _dbSet
            .Include(di => di.Medication1)
            .Include(di => di.Medication2)
            .FirstOrDefaultAsync(di =>
                ((di.Medication1Id == medication1Id && di.Medication2Id == medication2Id) ||
                 (di.Medication1Id == medication2Id && di.Medication2Id == medication1Id)) &&
                di.IsActive);
    }

    public async Task<IEnumerable<DrugInteraction>> GetAllInteractionsWithDetailsAsync()
    {
        return await _dbSet
            .Include(di => di.Medication1)
            .Include(di => di.Medication2)
            .Where(di => di.IsActive)
            .ToListAsync();
    }

    public async Task<DrugInteraction?> GetInteractionWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(di => di.Medication1)
            .Include(di => di.Medication2)
            .FirstOrDefaultAsync(di => di.Id == id);
    }
}

