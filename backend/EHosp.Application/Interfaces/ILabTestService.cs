using EHosp.Application.DTOs;
using Microsoft.AspNetCore.Http;

namespace EHosp.Application.Interfaces;

public interface ILabTestService
{
    Task<IEnumerable<LabTestDto>> GetAllLabTestsAsync();
    Task<LabTestDto?> GetLabTestByIdAsync(int id);
    Task<IEnumerable<LabTestDto>> GetLabTestsByPatientAsync(int patientId);
    Task<IEnumerable<LabTestDto>> GetLabTestsByDoctorAsync(int doctorId);
    Task<IEnumerable<LabTestDto>> GetLabTestsByStatusAsync(string status);
    Task<IEnumerable<LabTestDto>> GetLabTestsByPatientAndStatusAsync(int patientId, string status);
    Task<LabTestDto> CreateLabTestAsync(CreateLabTestDto createLabTestDto);
    Task UpdateLabTestAsync(int id, UpdateLabTestDto updateLabTestDto);
    Task DeleteLabTestAsync(int id);
    Task<string> UploadLabTestFileAsync(int labTestId, IFormFile file);
    Task<(byte[] fileBytes, string fileName, string contentType)> DownloadLabTestFileAsync(int labTestId);
}

