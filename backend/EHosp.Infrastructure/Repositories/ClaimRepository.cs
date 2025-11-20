using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using EHosp.Infrastructure.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class ClaimRepository : BaseRepository<Claim>, IClaimRepository
{
    public ClaimRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Claim?> GetClaimWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(c => c.Invoice)
            .ThenInclude(i => i.Patient)
            .ThenInclude(p => p.User)
            .Include(c => c.PatientInsurance)
            .ThenInclude(pi => pi.InsuranceProvider)
            .Include(c => c.SubmittedByUser)
            .Include(c => c.Denials)
            .Include(c => c.Payments)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Claim>> GetAllClaimsWithDetailsAsync()
    {
        return await _dbSet
            .Include(c => c.Invoice)
            .ThenInclude(i => i.Patient)
            .ThenInclude(p => p.User)
            .Include(c => c.PatientInsurance)
            .ThenInclude(pi => pi.InsuranceProvider)
            .Include(c => c.SubmittedByUser)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Claim>> GetClaimsByPatientAsync(int patientId)
    {
        return await _dbSet
            .Include(c => c.Invoice)
            .Include(c => c.PatientInsurance)
            .ThenInclude(pi => pi.InsuranceProvider)
            .Where(c => c.Invoice.PatientId == patientId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Claim>> GetClaimsByInvoiceAsync(int invoiceId)
    {
        return await _dbSet
            .Include(c => c.PatientInsurance)
            .ThenInclude(pi => pi.InsuranceProvider)
            .Where(c => c.InvoiceId == invoiceId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Claim>> GetClaimsByStatusAsync(string status)
    {
        return await _dbSet
            .Include(c => c.Invoice)
            .ThenInclude(i => i.Patient)
            .ThenInclude(p => p.User)
            .Include(c => c.PatientInsurance)
            .ThenInclude(pi => pi.InsuranceProvider)
            .Where(c => c.Status == status)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<Claim?> GetClaimByClaimNumberAsync(string claimNumber)
    {
        return await _dbSet
            .Include(c => c.Invoice)
            .Include(c => c.PatientInsurance)
            .FirstOrDefaultAsync(c => c.ClaimNumber == claimNumber);
    }
}

