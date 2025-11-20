using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IClaimService
{
    Task<IEnumerable<ClaimDto>> GetAllClaimsAsync();
    Task<ClaimDto?> GetClaimByIdAsync(int id);
    Task<IEnumerable<ClaimDto>> GetClaimsByPatientAsync(int patientId);
    Task<IEnumerable<ClaimDto>> GetClaimsByInvoiceAsync(int invoiceId);
    Task<IEnumerable<ClaimDto>> GetClaimsByStatusAsync(string status);
    Task<ClaimDto> CreateClaimAsync(CreateClaimDto createDto);
    Task UpdateClaimAsync(int id, UpdateClaimDto updateDto);
    Task<ClaimDto> SubmitClaimAsync(int id, SubmitClaimDto submitDto);
    Task DeleteClaimAsync(int id);
    Task<ClaimDenialDto> AddDenialAsync(int claimId, CreateClaimDenialDto createDto);
    Task<ClaimPaymentDto> PostPaymentAsync(int claimId, CreateClaimPaymentDto createDto);
    Task<IEnumerable<ClaimDenialDto>> GetDenialsByClaimAsync(int claimId);
    Task<IEnumerable<ClaimPaymentDto>> GetPaymentsByClaimAsync(int claimId);
}

