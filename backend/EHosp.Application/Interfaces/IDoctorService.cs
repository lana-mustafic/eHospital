using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces
{
    public interface IDoctorService
    {
        Task<DoctorDto?> GetDoctorByIdAsync(int id);
        Task<IEnumerable<DoctorDto>> GetAllDoctorsAsync();
        Task<IEnumerable<DoctorDto>> GetDoctorsByDepartmentAsync(int departmentId);
        Task<IEnumerable<DoctorDto>> GetDoctorsBySpecializationAsync(string specialization);
        Task<DoctorDto?> GetCurrentDoctorAsync(int userId);
        Task<DoctorDto> CreateDoctorAsync(CreateDoctorDto createDoctorDto);
    }
}