using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces
{
    public interface IDiagnosisService
    {
        Task<DiagnosisDto?> GetDiagnosisByIdAsync(int id);
        Task<DiagnosisDto?> GetDiagnosisByCodeAsync(string code);
        Task<IEnumerable<DiagnosisDto>> GetAllDiagnosesAsync();
        Task<IEnumerable<DiagnosisDto>> SearchDiagnosesAsync(string searchTerm);
        Task<DiagnosisDto> CreateDiagnosisAsync(CreateDiagnosisDto createDiagnosisDto);
        Task UpdateDiagnosisAsync(int id, UpdateDiagnosisDto updateDiagnosisDto);
        Task DeleteDiagnosisAsync(int id);
    }
}

