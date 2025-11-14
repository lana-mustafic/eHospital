using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces
{
    public interface IDepartmentService
    {
        Task<DepartmentDto?> GetDepartmentByIdAsync(int id);
        Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync();
        Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentDto createDepartmentDto);
        Task UpdateDepartmentAsync(int id, UpdateDepartmentDto updateDepartmentDto);
        Task DeleteDepartmentAsync(int id);
    }
}

