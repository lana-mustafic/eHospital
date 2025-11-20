using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IClaimRepository : IRepository<Claim>
{
    Task<Claim?> GetClaimWithDetailsAsync(int id);
    Task<IEnumerable<Claim>> GetAllClaimsWithDetailsAsync();
    Task<IEnumerable<Claim>> GetClaimsByPatientAsync(int patientId);
    Task<IEnumerable<Claim>> GetClaimsByInvoiceAsync(int invoiceId);
    Task<IEnumerable<Claim>> GetClaimsByStatusAsync(string status);
    Task<Claim?> GetClaimByClaimNumberAsync(string claimNumber);
}

