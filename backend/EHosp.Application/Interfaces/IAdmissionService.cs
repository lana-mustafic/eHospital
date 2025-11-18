using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IAdmissionService
{
    Task<IEnumerable<AdmissionDto>> GetAllAdmissionsAsync();
    Task<AdmissionDto?> GetAdmissionByIdAsync(int id);
    Task<IEnumerable<AdmissionDto>> GetAdmissionsByPatientAsync(int patientId);
    Task<IEnumerable<AdmissionDto>> GetAdmissionsByStatusAsync(string status);
    Task<IEnumerable<AdmissionDto>> GetActiveAdmissionsAsync();
    Task<IEnumerable<AdmissionDto>> GetAdmissionsByRoomAsync(int roomId);
    Task<IEnumerable<AdmissionDto>> GetAdmissionsByBedAsync(int bedId);
    Task<AdmissionDto?> GetActiveAdmissionByPatientAsync(int patientId);
    Task<AdmissionDto> CreateAdmissionAsync(CreateAdmissionDto createAdmissionDto);
    Task UpdateAdmissionAsync(int id, UpdateAdmissionDto updateAdmissionDto);
    Task DischargePatientAsync(int id, DischargePatientDto dischargeDto);
    Task DeleteAdmissionAsync(int id);
}

