using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IVitalSignsService
{
    Task<IEnumerable<VitalSignsDto>> GetAllVitalSignsAsync();
    Task<VitalSignsDto?> GetVitalSignsByIdAsync(int id);
    Task<IEnumerable<VitalSignsDto>> GetVitalSignsByPatientAsync(int patientId);
    Task<IEnumerable<VitalSignsDto>> GetVitalSignsByPatientAndDateRangeAsync(int patientId, DateTime startDate, DateTime endDate);
    Task<VitalSignsDto> CreateVitalSignsAsync(CreateVitalSignsDto createVitalSignsDto);
    Task UpdateVitalSignsAsync(int id, UpdateVitalSignsDto updateVitalSignsDto);
    Task DeleteVitalSignsAsync(int id);
}

