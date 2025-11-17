using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class DischargeSummaryService : IDischargeSummaryService
{
    private readonly IDischargeSummaryRepository _dischargeSummaryRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IDoctorRepository _doctorRepository;
    private readonly IMedicalRecordRepository _medicalRecordRepository;
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IPrescriptionRepository _prescriptionRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<DischargeSummaryService> _logger;
    private readonly IAuditService _auditService;

    public DischargeSummaryService(
        IDischargeSummaryRepository dischargeSummaryRepository,
        IPatientRepository patientRepository,
        IDoctorRepository doctorRepository,
        IMedicalRecordRepository medicalRecordRepository,
        IAppointmentRepository appointmentRepository,
        IPrescriptionRepository prescriptionRepository,
        IUserRepository userRepository,
        ILogger<DischargeSummaryService> logger,
        IAuditService auditService)
    {
        _dischargeSummaryRepository = dischargeSummaryRepository;
        _patientRepository = patientRepository;
        _doctorRepository = doctorRepository;
        _medicalRecordRepository = medicalRecordRepository;
        _appointmentRepository = appointmentRepository;
        _prescriptionRepository = prescriptionRepository;
        _userRepository = userRepository;
        _logger = logger;
        _auditService = auditService;
    }

    public async Task<IEnumerable<DischargeSummaryDto>> GetAllDischargeSummariesAsync()
    {
        var summaries = await _dischargeSummaryRepository.GetAllDischargeSummariesWithDetailsAsync();
        return summaries.Select(MapToDto);
    }

    public async Task<DischargeSummaryDto?> GetDischargeSummaryByIdAsync(int id)
    {
        var summary = await _dischargeSummaryRepository.GetDischargeSummaryWithDetailsAsync(id);
        return summary != null ? await MapToDtoWithMedications(summary) : null;
    }

    public async Task<DischargeSummaryDto?> GetDischargeSummaryByDischargeNumberAsync(string dischargeNumber)
    {
        var summary = await _dischargeSummaryRepository.GetDischargeSummaryByDischargeNumberAsync(dischargeNumber);
        return summary != null ? await MapToDtoWithMedications(summary) : null;
    }

    public async Task<IEnumerable<DischargeSummaryDto>> GetDischargeSummariesByPatientAsync(int patientId)
    {
        var summaries = await _dischargeSummaryRepository.GetDischargeSummariesByPatientAsync(patientId);
        return summaries.Select(MapToDto);
    }

    public async Task<IEnumerable<DischargeSummaryDto>> GetDischargeSummariesByDoctorAsync(int doctorId)
    {
        var summaries = await _dischargeSummaryRepository.GetDischargeSummariesByDoctorAsync(doctorId);
        return summaries.Select(MapToDto);
    }

    public async Task<DischargeSummaryDto> CreateDischargeSummaryAsync(CreateDischargeSummaryDto createDischargeSummaryDto)
    {
        // Validate patient exists
        var patient = await _patientRepository.GetByIdAsync(createDischargeSummaryDto.PatientId);
        if (patient == null)
        {
            throw new ArgumentException("Patient not found");
        }

        // Validate discharging doctor exists
        var doctor = await _doctorRepository.GetByIdAsync(createDischargeSummaryDto.DischargingDoctorId);
        if (doctor == null)
        {
            throw new ArgumentException("Discharging doctor not found");
        }

        // Validate follow-up doctor if provided
        if (createDischargeSummaryDto.FollowUpDoctorId.HasValue)
        {
            var followUpDoctor = await _doctorRepository.GetByIdAsync(createDischargeSummaryDto.FollowUpDoctorId.Value);
            if (followUpDoctor == null)
            {
                throw new ArgumentException("Follow-up doctor not found");
            }
        }

        // Validate medical record if provided
        if (createDischargeSummaryDto.MedicalRecordId.HasValue)
        {
            var medicalRecord = await _medicalRecordRepository.GetByIdAsync(createDischargeSummaryDto.MedicalRecordId.Value);
            if (medicalRecord == null)
            {
                throw new ArgumentException("Medical record not found");
            }
        }

        // Validate appointment if provided
        if (createDischargeSummaryDto.AppointmentId.HasValue)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(createDischargeSummaryDto.AppointmentId.Value);
            if (appointment == null)
            {
                throw new ArgumentException("Appointment not found");
            }
        }

        // Validate user if provided
        if (createDischargeSummaryDto.CreatedByUserId.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(createDischargeSummaryDto.CreatedByUserId.Value);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }
        }

        // Generate discharge number
        var dischargeNumber = await _dischargeSummaryRepository.GenerateNextDischargeNumberAsync();

        var summary = new DischargeSummary
        {
            DischargeNumber = dischargeNumber,
            DischargeDate = createDischargeSummaryDto.DischargeDate,
            AdmissionDate = createDischargeSummaryDto.AdmissionDate,
            DischargeType = createDischargeSummaryDto.DischargeType,
            ConditionOnDischarge = createDischargeSummaryDto.ConditionOnDischarge,
            ChiefComplaint = createDischargeSummaryDto.ChiefComplaint,
            HistoryOfPresentIllness = createDischargeSummaryDto.HistoryOfPresentIllness,
            HospitalCourse = createDischargeSummaryDto.HospitalCourse,
            ProceduresPerformed = createDischargeSummaryDto.ProceduresPerformed,
            DischargeDiagnosis = createDischargeSummaryDto.DischargeDiagnosis,
            PostDischargeInstructions = createDischargeSummaryDto.PostDischargeInstructions,
            ActivityRestrictions = createDischargeSummaryDto.ActivityRestrictions,
            DietInstructions = createDischargeSummaryDto.DietInstructions,
            MedicationInstructions = createDischargeSummaryDto.MedicationInstructions,
            WarningSigns = createDischargeSummaryDto.WarningSigns,
            FollowUpDate = createDischargeSummaryDto.FollowUpDate,
            FollowUpDoctorId = createDischargeSummaryDto.FollowUpDoctorId,
            FollowUpInstructions = createDischargeSummaryDto.FollowUpInstructions,
            AdditionalNotes = createDischargeSummaryDto.AdditionalNotes,
            Status = "Draft",
            PatientId = createDischargeSummaryDto.PatientId,
            DischargingDoctorId = createDischargeSummaryDto.DischargingDoctorId,
            MedicalRecordId = createDischargeSummaryDto.MedicalRecordId,
            AppointmentId = createDischargeSummaryDto.AppointmentId,
            CreatedByUserId = createDischargeSummaryDto.CreatedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        var createdSummary = await _dischargeSummaryRepository.AddAsync(summary);
        await _auditService.WriteAsync(
            createDischargeSummaryDto.CreatedByUserId?.ToString() ?? "system",
            "Admin",
            "Create",
            "DischargeSummary",
            createdSummary.Id.ToString(),
            $"DischargeNumber={dischargeNumber}, PatientId={createDischargeSummaryDto.PatientId}"
        );

        var summaryWithDetails = await _dischargeSummaryRepository.GetDischargeSummaryWithDetailsAsync(createdSummary.Id);
        return await MapToDtoWithMedications(summaryWithDetails!);
    }

    public async Task UpdateDischargeSummaryAsync(int id, UpdateDischargeSummaryDto updateDischargeSummaryDto)
    {
        var summary = await _dischargeSummaryRepository.GetByIdAsync(id);
        if (summary == null)
        {
            throw new ArgumentException("Discharge summary not found");
        }

        // Cannot update finalized summaries
        if (summary.Status == "Finalized")
        {
            throw new InvalidOperationException("Cannot update a finalized discharge summary");
        }

        if (updateDischargeSummaryDto.DischargeDate.HasValue)
            summary.DischargeDate = updateDischargeSummaryDto.DischargeDate.Value;
        if (updateDischargeSummaryDto.AdmissionDate.HasValue)
            summary.AdmissionDate = updateDischargeSummaryDto.AdmissionDate;
        if (!string.IsNullOrEmpty(updateDischargeSummaryDto.DischargeType))
            summary.DischargeType = updateDischargeSummaryDto.DischargeType;
        if (!string.IsNullOrEmpty(updateDischargeSummaryDto.ConditionOnDischarge))
            summary.ConditionOnDischarge = updateDischargeSummaryDto.ConditionOnDischarge;
        if (updateDischargeSummaryDto.ChiefComplaint != null)
            summary.ChiefComplaint = updateDischargeSummaryDto.ChiefComplaint;
        if (updateDischargeSummaryDto.HistoryOfPresentIllness != null)
            summary.HistoryOfPresentIllness = updateDischargeSummaryDto.HistoryOfPresentIllness;
        if (updateDischargeSummaryDto.HospitalCourse != null)
            summary.HospitalCourse = updateDischargeSummaryDto.HospitalCourse;
        if (updateDischargeSummaryDto.ProceduresPerformed != null)
            summary.ProceduresPerformed = updateDischargeSummaryDto.ProceduresPerformed;
        if (updateDischargeSummaryDto.DischargeDiagnosis != null)
            summary.DischargeDiagnosis = updateDischargeSummaryDto.DischargeDiagnosis;
        if (updateDischargeSummaryDto.PostDischargeInstructions != null)
            summary.PostDischargeInstructions = updateDischargeSummaryDto.PostDischargeInstructions;
        if (updateDischargeSummaryDto.ActivityRestrictions != null)
            summary.ActivityRestrictions = updateDischargeSummaryDto.ActivityRestrictions;
        if (updateDischargeSummaryDto.DietInstructions != null)
            summary.DietInstructions = updateDischargeSummaryDto.DietInstructions;
        if (updateDischargeSummaryDto.MedicationInstructions != null)
            summary.MedicationInstructions = updateDischargeSummaryDto.MedicationInstructions;
        if (updateDischargeSummaryDto.WarningSigns != null)
            summary.WarningSigns = updateDischargeSummaryDto.WarningSigns;
        if (updateDischargeSummaryDto.FollowUpDate.HasValue)
            summary.FollowUpDate = updateDischargeSummaryDto.FollowUpDate;
        if (updateDischargeSummaryDto.FollowUpDoctorId.HasValue)
            summary.FollowUpDoctorId = updateDischargeSummaryDto.FollowUpDoctorId;
        if (updateDischargeSummaryDto.FollowUpInstructions != null)
            summary.FollowUpInstructions = updateDischargeSummaryDto.FollowUpInstructions;
        if (updateDischargeSummaryDto.AdditionalNotes != null)
            summary.AdditionalNotes = updateDischargeSummaryDto.AdditionalNotes;
        if (!string.IsNullOrEmpty(updateDischargeSummaryDto.Status))
            summary.Status = updateDischargeSummaryDto.Status;

        summary.UpdatedAt = DateTime.UtcNow;

        await _dischargeSummaryRepository.UpdateAsync(summary);
        await _auditService.WriteAsync("system", "Admin", "Update", "DischargeSummary", summary.Id.ToString(), "Updated fields");
    }

    public async Task FinalizeDischargeSummaryAsync(int id)
    {
        var summary = await _dischargeSummaryRepository.GetByIdAsync(id);
        if (summary == null)
        {
            throw new ArgumentException("Discharge summary not found");
        }

        if (summary.Status == "Finalized")
        {
            throw new InvalidOperationException("Discharge summary is already finalized");
        }

        summary.Status = "Finalized";
        summary.FinalizedAt = DateTime.UtcNow;
        summary.UpdatedAt = DateTime.UtcNow;

        await _dischargeSummaryRepository.UpdateAsync(summary);
        await _auditService.WriteAsync("system", "Admin", "Update", "DischargeSummary", summary.Id.ToString(), "Finalized");
    }

    public async Task DeleteDischargeSummaryAsync(int id)
    {
        var summary = await _dischargeSummaryRepository.GetByIdAsync(id);
        if (summary == null)
        {
            throw new ArgumentException("Discharge summary not found");
        }

        if (summary.Status == "Finalized")
        {
            throw new InvalidOperationException("Cannot delete a finalized discharge summary");
        }

        await _dischargeSummaryRepository.DeleteAsync(summary);
        await _auditService.WriteAsync("system", "Admin", "Delete", "DischargeSummary", summary.Id.ToString(), "Deleted");
    }

    public async Task<string> GenerateDischargeNumberAsync()
    {
        return await _dischargeSummaryRepository.GenerateNextDischargeNumberAsync();
    }

    public async Task<byte[]> GenerateDischargeSummaryPdfAsync(int id)
    {
        var summary = await _dischargeSummaryRepository.GetDischargeSummaryWithDetailsAsync(id);
        if (summary == null)
        {
            throw new ArgumentException("Discharge summary not found");
        }

        // TODO: Implement PDF generation using a library like QuestPDF, iTextSharp, or similar
        // For now, return a simple text representation
        var summaryText = $@"
DISCHARGE SUMMARY
Discharge Number: {summary.DischargeNumber}
Discharge Date: {summary.DischargeDate:yyyy-MM-dd}
Admission Date: {summary.AdmissionDate?.ToString("yyyy-MM-dd") ?? "N/A"}

Patient: {summary.Patient?.User?.FirstName} {summary.Patient?.User?.LastName}
Discharging Doctor: {summary.DischargingDoctor?.User?.FirstName} {summary.DischargingDoctor?.User?.LastName}

Chief Complaint: {summary.ChiefComplaint}
History of Present Illness: {summary.HistoryOfPresentIllness}
Hospital Course: {summary.HospitalCourse}
Procedures Performed: {summary.ProceduresPerformed}
Discharge Diagnosis: {summary.DischargeDiagnosis}

Post-Discharge Instructions:
{summary.PostDischargeInstructions}

Activity Restrictions: {summary.ActivityRestrictions}
Diet Instructions: {summary.DietInstructions}
Medication Instructions: {summary.MedicationInstructions}
Warning Signs: {summary.WarningSigns}

Follow-up Date: {summary.FollowUpDate?.ToString("yyyy-MM-dd") ?? "N/A"}
Follow-up Instructions: {summary.FollowUpInstructions}

Additional Notes: {summary.AdditionalNotes}

Status: {summary.Status}
";

        return System.Text.Encoding.UTF8.GetBytes(summaryText);
    }

    private static DischargeSummaryDto MapToDto(DischargeSummary summary) => new()
    {
        Id = summary.Id,
        DischargeNumber = summary.DischargeNumber,
        DischargeDate = summary.DischargeDate,
        AdmissionDate = summary.AdmissionDate,
        DischargeType = summary.DischargeType,
        ConditionOnDischarge = summary.ConditionOnDischarge,
        ChiefComplaint = summary.ChiefComplaint,
        HistoryOfPresentIllness = summary.HistoryOfPresentIllness,
        HospitalCourse = summary.HospitalCourse,
        ProceduresPerformed = summary.ProceduresPerformed,
        DischargeDiagnosis = summary.DischargeDiagnosis,
        PostDischargeInstructions = summary.PostDischargeInstructions,
        ActivityRestrictions = summary.ActivityRestrictions,
        DietInstructions = summary.DietInstructions,
        MedicationInstructions = summary.MedicationInstructions,
        WarningSigns = summary.WarningSigns,
        FollowUpDate = summary.FollowUpDate,
        FollowUpDoctorId = summary.FollowUpDoctorId,
        FollowUpDoctorName = summary.FollowUpDoctor != null
            ? $"{summary.FollowUpDoctor.User?.FirstName} {summary.FollowUpDoctor.User?.LastName}".Trim()
            : null,
        FollowUpInstructions = summary.FollowUpInstructions,
        AdditionalNotes = summary.AdditionalNotes,
        Status = summary.Status,
        CreatedAt = summary.CreatedAt,
        UpdatedAt = summary.UpdatedAt,
        FinalizedAt = summary.FinalizedAt,
        PatientId = summary.PatientId,
        PatientName = $"{summary.Patient?.User?.FirstName} {summary.Patient?.User?.LastName}".Trim(),
        DischargingDoctorId = summary.DischargingDoctorId,
        DischargingDoctorName = summary.DischargingDoctor != null
            ? $"{summary.DischargingDoctor.User?.FirstName} {summary.DischargingDoctor.User?.LastName}".Trim()
            : null,
        MedicalRecordId = summary.MedicalRecordId,
        AppointmentId = summary.AppointmentId,
        CreatedByUserId = summary.CreatedByUserId,
        CreatedByUserName = summary.CreatedByUser != null
            ? $"{summary.CreatedByUser.FirstName} {summary.CreatedByUser.LastName}".Trim()
            : null
    };

    private async Task<DischargeSummaryDto> MapToDtoWithMedications(DischargeSummary summary)
    {
        var dto = MapToDto(summary);

        // Get prescriptions from medical record if available
        if (summary.MedicalRecordId.HasValue)
        {
            var medicalRecord = await _medicalRecordRepository.GetMedicalRecordWithDetailsAsync(summary.MedicalRecordId.Value);
            if (medicalRecord != null)
            {
                dto.DischargeMedications = medicalRecord.Prescriptions.Select(p => new DischargeMedicationDto
                {
                    PrescriptionId = p.Id,
                    MedicationName = p.Medication?.Name ?? "Unknown",
                    Dosage = p.Dosage,
                    Frequency = p.Frequency,
                    Duration = p.Duration.ToString(),
                    Instructions = p.Instructions
                }).ToList();
            }
        }

        return dto;
    }
}

