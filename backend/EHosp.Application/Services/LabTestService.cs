using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;

namespace EHosp.Application.Services;

public class LabTestService : ILabTestService
{
    private readonly ILabTestRepository _labTestRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IDoctorRepository _doctorRepository;
    private readonly IMedicalRecordRepository _medicalRecordRepository;
    private readonly ILogger<LabTestService> _logger;
    private readonly IAuditService _auditService;
    private readonly IHostEnvironment _environment;
    private const string UploadsFolder = "uploads/lab-tests";

    public LabTestService(
        ILabTestRepository labTestRepository,
        IPatientRepository patientRepository,
        IDoctorRepository doctorRepository,
        IMedicalRecordRepository medicalRecordRepository,
        ILogger<LabTestService> logger,
        IAuditService auditService,
        IHostEnvironment environment)
    {
        _labTestRepository = labTestRepository;
        _patientRepository = patientRepository;
        _doctorRepository = doctorRepository;
        _medicalRecordRepository = medicalRecordRepository;
        _logger = logger;
        _auditService = auditService;
        _environment = environment;
        
        // Ensure uploads directory exists
        var uploadsPath = Path.Combine(_environment.ContentRootPath, UploadsFolder);
        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }
    }

    public async Task<IEnumerable<LabTestDto>> GetAllLabTestsAsync()
    {
        var labTests = await _labTestRepository.GetAllLabTestsWithDetailsAsync();
        return labTests.Select(MapToDto);
    }

    public async Task<LabTestDto?> GetLabTestByIdAsync(int id)
    {
        var labTest = await _labTestRepository.GetLabTestWithDetailsAsync(id);
        return labTest != null ? MapToDto(labTest) : null;
    }

    public async Task<IEnumerable<LabTestDto>> GetLabTestsByPatientAsync(int patientId)
    {
        var labTests = await _labTestRepository.GetLabTestsByPatientAsync(patientId);
        return labTests.Select(MapToDto);
    }

    public async Task<IEnumerable<LabTestDto>> GetLabTestsByDoctorAsync(int doctorId)
    {
        var labTests = await _labTestRepository.GetLabTestsByDoctorAsync(doctorId);
        return labTests.Select(MapToDto);
    }

    public async Task<IEnumerable<LabTestDto>> GetLabTestsByStatusAsync(string status)
    {
        var labTests = await _labTestRepository.GetLabTestsByStatusAsync(status);
        return labTests.Select(MapToDto);
    }

    public async Task<IEnumerable<LabTestDto>> GetLabTestsByPatientAndStatusAsync(int patientId, string status)
    {
        var labTests = await _labTestRepository.GetLabTestsByPatientAndStatusAsync(patientId, status);
        return labTests.Select(MapToDto);
    }

    public async Task<LabTestDto> CreateLabTestAsync(CreateLabTestDto createLabTestDto)
    {
        // Validate patient exists
        var patient = await _patientRepository.GetByIdAsync(createLabTestDto.PatientId);
        if (patient == null)
        {
            throw new ArgumentException("Patient not found");
        }

        // Validate doctor exists
        var doctor = await _doctorRepository.GetByIdAsync(createLabTestDto.DoctorId);
        if (doctor == null)
        {
            throw new ArgumentException("Doctor not found");
        }

        // Validate medical record if provided
        if (createLabTestDto.MedicalRecordId.HasValue)
        {
            var medicalRecord = await _medicalRecordRepository.GetByIdAsync(createLabTestDto.MedicalRecordId.Value);
            if (medicalRecord == null)
            {
                throw new ArgumentException("Medical record not found");
            }
        }

        var labTest = new LabTest
        {
            OrderedDate = createLabTestDto.OrderedDate,
            TestName = createLabTestDto.TestName,
            TestType = createLabTestDto.TestType,
            TestCode = createLabTestDto.TestCode,
            Status = createLabTestDto.Status,
            Notes = createLabTestDto.Notes,
            PatientId = createLabTestDto.PatientId,
            DoctorId = createLabTestDto.DoctorId,
            MedicalRecordId = createLabTestDto.MedicalRecordId,
            CreatedAt = DateTime.UtcNow
        };

        var createdLabTest = await _labTestRepository.AddAsync(labTest);
        await _auditService.WriteAsync("system", "Doctor", "Create", "LabTest", createdLabTest.Id.ToString(), $"PatientId={createdLabTest.PatientId}, TestName={createdLabTest.TestName}");
        var labTestWithDetails = await _labTestRepository.GetLabTestWithDetailsAsync(createdLabTest.Id);
        return MapToDto(labTestWithDetails!);
    }

    public async Task UpdateLabTestAsync(int id, UpdateLabTestDto updateLabTestDto)
    {
        var labTest = await _labTestRepository.GetByIdAsync(id);
        if (labTest == null)
        {
            throw new ArgumentException("Lab test not found");
        }

        if (updateLabTestDto.CompletedDate.HasValue)
            labTest.CompletedDate = updateLabTestDto.CompletedDate.Value;
        if (!string.IsNullOrEmpty(updateLabTestDto.TestName))
            labTest.TestName = updateLabTestDto.TestName;
        if (!string.IsNullOrEmpty(updateLabTestDto.TestType))
            labTest.TestType = updateLabTestDto.TestType;
        if (updateLabTestDto.TestCode != null)
            labTest.TestCode = updateLabTestDto.TestCode;
        if (!string.IsNullOrEmpty(updateLabTestDto.Status))
            labTest.Status = updateLabTestDto.Status;
        if (updateLabTestDto.Results != null)
            labTest.Results = updateLabTestDto.Results;
        if (updateLabTestDto.Notes != null)
            labTest.Notes = updateLabTestDto.Notes;
        if (updateLabTestDto.MedicalRecordId.HasValue)
            labTest.MedicalRecordId = updateLabTestDto.MedicalRecordId;
        if (updateLabTestDto.PerformedByUserId.HasValue)
            labTest.PerformedByUserId = updateLabTestDto.PerformedByUserId;

        await _labTestRepository.UpdateAsync(labTest);
        await _auditService.WriteAsync("system", "Doctor", "Update", "LabTest", labTest.Id.ToString(), "Updated fields");
    }

    public async Task DeleteLabTestAsync(int id)
    {
        var labTest = await _labTestRepository.GetByIdAsync(id);
        if (labTest == null)
        {
            throw new ArgumentException("Lab test not found");
        }

        // Delete associated file if exists
        if (!string.IsNullOrEmpty(labTest.FilePath))
        {
            var filePath = Path.Combine(_environment.ContentRootPath, labTest.FilePath);
            if (File.Exists(filePath))
            {
                try
                {
                    File.Delete(filePath);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete lab test file: {FilePath}", filePath);
                }
            }
        }

        await _labTestRepository.DeleteAsync(labTest);
        await _auditService.WriteAsync("system", "Doctor", "Delete", "LabTest", labTest.Id.ToString(), "Deleted");
    }

    public async Task<string> UploadLabTestFileAsync(int labTestId, IFormFile file)
    {
        var labTest = await _labTestRepository.GetByIdAsync(labTestId);
        if (labTest == null)
        {
            throw new ArgumentException("Lab test not found");
        }

        // Validate file
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is required");
        }

        // Validate file size (max 10MB)
        const long maxFileSize = 10 * 1024 * 1024; // 10MB
        if (file.Length > maxFileSize)
        {
            throw new ArgumentException("File size exceeds maximum allowed size of 10MB");
        }

        // Validate file extension
        var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".xls", ".xlsx" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
        {
            throw new ArgumentException($"File type not allowed. Allowed types: {string.Join(", ", allowedExtensions)}");
        }

        // Delete old file if exists
        if (!string.IsNullOrEmpty(labTest.FilePath))
        {
            var oldFilePath = Path.Combine(_environment.ContentRootPath, labTest.FilePath);
            if (File.Exists(oldFilePath))
            {
                try
                {
                    File.Delete(oldFilePath);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete old lab test file: {FilePath}", oldFilePath);
                }
            }
        }

        // Generate unique filename
        var fileName = $"{labTestId}_{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(UploadsFolder, fileName);
        var fullPath = Path.Combine(_environment.ContentRootPath, filePath);

        // Save file
        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Update lab test record
        labTest.FilePath = filePath;
        labTest.FileName = file.FileName;
        labTest.FileContentType = file.ContentType;

        await _labTestRepository.UpdateAsync(labTest);
        await _auditService.WriteAsync("system", "Doctor", "Upload", "LabTest", labTest.Id.ToString(), $"File: {file.FileName}");

        return filePath;
    }

    public async Task<(byte[] fileBytes, string fileName, string contentType)> DownloadLabTestFileAsync(int labTestId)
    {
        var labTest = await _labTestRepository.GetByIdAsync(labTestId);
        if (labTest == null)
        {
            throw new ArgumentException("Lab test not found");
        }

        if (string.IsNullOrEmpty(labTest.FilePath))
        {
            throw new ArgumentException("No file associated with this lab test");
        }

        var fullPath = Path.Combine(_environment.ContentRootPath, labTest.FilePath);
        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException("Lab test file not found");
        }

        var fileBytes = await File.ReadAllBytesAsync(fullPath);
        return (fileBytes, labTest.FileName ?? Path.GetFileName(labTest.FilePath), labTest.FileContentType ?? "application/octet-stream");
    }

    private static LabTestDto MapToDto(LabTest labTest) => new()
    {
        Id = labTest.Id,
        OrderedDate = labTest.OrderedDate,
        CompletedDate = labTest.CompletedDate,
        TestName = labTest.TestName,
        TestType = labTest.TestType,
        TestCode = labTest.TestCode,
        Status = labTest.Status,
        Results = labTest.Results,
        Notes = labTest.Notes,
        FilePath = labTest.FilePath,
        FileName = labTest.FileName,
        FileContentType = labTest.FileContentType,
        CreatedAt = labTest.CreatedAt,
        PatientId = labTest.PatientId,
        PatientName = $"{labTest.Patient?.User?.FirstName} {labTest.Patient?.User?.LastName}".Trim(),
        DoctorId = labTest.DoctorId,
        DoctorName = $"{labTest.Doctor?.User?.FirstName} {labTest.Doctor?.User?.LastName}".Trim(),
        MedicalRecordId = labTest.MedicalRecordId,
        PerformedByUserId = labTest.PerformedByUserId,
        PerformedByName = labTest.PerformedBy != null
            ? $"{labTest.PerformedBy.FirstName} {labTest.PerformedBy.LastName}".Trim()
            : null
    };
}

