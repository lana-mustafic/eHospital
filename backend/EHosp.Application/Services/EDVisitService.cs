using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class EDVisitService : IEDVisitService
{
    private readonly IEDVisitRepository _edVisitRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IDoctorRepository _doctorRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<EDVisitService> _logger;

    public EDVisitService(
        IEDVisitRepository edVisitRepository,
        IPatientRepository patientRepository,
        IDoctorRepository doctorRepository,
        IUserRepository userRepository,
        ILogger<EDVisitService> logger)
    {
        _edVisitRepository = edVisitRepository;
        _patientRepository = patientRepository;
        _doctorRepository = doctorRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<EDVisitDto>> GetAllVisitsAsync()
    {
        var visits = await _edVisitRepository.GetAllAsync();
        return visits.Select(MapToDto);
    }

    public async Task<EDVisitDto?> GetVisitByIdAsync(int id)
    {
        var visit = await _edVisitRepository.GetByIdAsync(id);
        return visit != null ? MapToDto(visit) : null;
    }

    public async Task<IEnumerable<EDVisitDto>> GetActiveVisitsAsync()
    {
        var visits = await _edVisitRepository.GetActiveVisitsAsync();
        return visits.Select(MapToDto);
    }

    public async Task<IEnumerable<EDVisitDto>> GetByPatientAsync(int patientId)
    {
        var visits = await _edVisitRepository.GetByPatientAsync(patientId);
        return visits.Select(MapToDto);
    }

    public async Task<IEnumerable<EDVisitDto>> GetByStatusAsync(string status)
    {
        var visits = await _edVisitRepository.GetByStatusAsync(status);
        return visits.Select(MapToDto);
    }

    public async Task<IEnumerable<EDVisitDto>> GetByTriagePriorityAsync(string priority)
    {
        var visits = await _edVisitRepository.GetByTriagePriorityAsync(priority);
        return visits.Select(MapToDto);
    }

    public async Task<IEnumerable<EDVisitDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var visits = await _edVisitRepository.GetByDateRangeAsync(startDate, endDate);
        return visits.Select(MapToDto);
    }

    public async Task<EDVisitDto> CreateVisitAsync(CreateEDVisitDto createDto)
    {
        var patient = await _patientRepository.GetByIdAsync(createDto.PatientId);
        if (patient == null)
        {
            throw new ArgumentException("Patient not found");
        }

        var visit = new EDVisit
        {
            PatientId = createDto.PatientId,
            ArrivalTime = DateTime.UtcNow,
            ChiefComplaint = createDto.ChiefComplaint,
            TriagePriority = createDto.TriagePriority,
            TriageNotes = createDto.TriageNotes,
            Status = "Triage",
            BloodPressureSystolic = createDto.BloodPressureSystolic,
            BloodPressureDiastolic = createDto.BloodPressureDiastolic,
            Temperature = createDto.Temperature,
            HeartRate = createDto.HeartRate,
            RespiratoryRate = createDto.RespiratoryRate,
            OxygenSaturation = createDto.OxygenSaturation,
            PainScale = createDto.PainScale,
            TriageNurseId = createDto.TriageNurseId,
            AssignedDoctorId = createDto.AssignedDoctorId,
            CreatedAt = DateTime.UtcNow
        };

        // Auto-triage based on vital signs if not provided
        if (string.IsNullOrEmpty(createDto.TriagePriority) || createDto.TriagePriority == "Non-Urgent")
        {
            visit.TriagePriority = DetermineTriagePriority(createDto);
        }

        var createdVisit = await _edVisitRepository.AddAsync(visit);
        _logger.LogInformation("ED Visit created for Patient {PatientId} with ID {VisitId}", createDto.PatientId, createdVisit.Id);

        return MapToDto(createdVisit);
    }

    public async Task<EDVisitDto> UpdateVisitAsync(int id, UpdateEDVisitDto updateDto)
    {
        var visit = await _edVisitRepository.GetByIdAsync(id);
        if (visit == null)
        {
            throw new ArgumentException("ED Visit not found");
        }

        if (!string.IsNullOrEmpty(updateDto.TriagePriority))
            visit.TriagePriority = updateDto.TriagePriority;
        if (!string.IsNullOrEmpty(updateDto.ChiefComplaint))
            visit.ChiefComplaint = updateDto.ChiefComplaint;
        if (updateDto.TriageNotes != null)
            visit.TriageNotes = updateDto.TriageNotes;
        if (!string.IsNullOrEmpty(updateDto.Status))
            visit.Status = updateDto.Status;
        if (!string.IsNullOrEmpty(updateDto.Disposition))
            visit.Disposition = updateDto.Disposition;
        if (updateDto.DispositionNotes != null)
            visit.DispositionNotes = updateDto.DispositionNotes;
        if (updateDto.TreatmentNotes != null)
            visit.TreatmentNotes = updateDto.TreatmentNotes;
        if (updateDto.Diagnosis != null)
            visit.Diagnosis = updateDto.Diagnosis;
        if (updateDto.MedicationsGiven != null)
            visit.MedicationsGiven = updateDto.MedicationsGiven;
        if (updateDto.ProceduresPerformed != null)
            visit.ProceduresPerformed = updateDto.ProceduresPerformed;

        // Update vital signs
        if (updateDto.BloodPressureSystolic.HasValue)
            visit.BloodPressureSystolic = updateDto.BloodPressureSystolic;
        if (updateDto.BloodPressureDiastolic.HasValue)
            visit.BloodPressureDiastolic = updateDto.BloodPressureDiastolic;
        if (updateDto.Temperature.HasValue)
            visit.Temperature = updateDto.Temperature;
        if (updateDto.HeartRate.HasValue)
            visit.HeartRate = updateDto.HeartRate;
        if (updateDto.RespiratoryRate.HasValue)
            visit.RespiratoryRate = updateDto.RespiratoryRate;
        if (updateDto.OxygenSaturation.HasValue)
            visit.OxygenSaturation = updateDto.OxygenSaturation;
        if (updateDto.PainScale.HasValue)
            visit.PainScale = updateDto.PainScale;

        if (updateDto.AssignedDoctorId.HasValue)
            visit.AssignedDoctorId = updateDto.AssignedDoctorId;
        if (updateDto.TreatedByDoctorId.HasValue)
            visit.TreatedByDoctorId = updateDto.TreatedByDoctorId;

        visit.UpdatedAt = DateTime.UtcNow;
        await _edVisitRepository.UpdateAsync(visit);

        return MapToDto(visit);
    }

    public async Task<EDVisitDto> PerformTriageAsync(int id, TriageDto triageDto)
    {
        var visit = await _edVisitRepository.GetByIdAsync(id);
        if (visit == null)
        {
            throw new ArgumentException("ED Visit not found");
        }

        visit.TriagePriority = triageDto.TriagePriority;
        visit.ChiefComplaint = triageDto.ChiefComplaint;
        visit.TriageNotes = triageDto.TriageNotes;
        visit.TriageTime = DateTime.UtcNow;
        visit.Status = "Treatment";

        // Update vital signs
        if (triageDto.BloodPressureSystolic.HasValue)
            visit.BloodPressureSystolic = triageDto.BloodPressureSystolic;
        if (triageDto.BloodPressureDiastolic.HasValue)
            visit.BloodPressureDiastolic = triageDto.BloodPressureDiastolic;
        if (triageDto.Temperature.HasValue)
            visit.Temperature = triageDto.Temperature;
        if (triageDto.HeartRate.HasValue)
            visit.HeartRate = triageDto.HeartRate;
        if (triageDto.RespiratoryRate.HasValue)
            visit.RespiratoryRate = triageDto.RespiratoryRate;
        if (triageDto.OxygenSaturation.HasValue)
            visit.OxygenSaturation = triageDto.OxygenSaturation;
        if (triageDto.PainScale.HasValue)
            visit.PainScale = triageDto.PainScale;

        if (triageDto.TriageNurseId.HasValue)
            visit.TriageNurseId = triageDto.TriageNurseId;
        if (triageDto.AssignedDoctorId.HasValue)
            visit.AssignedDoctorId = triageDto.AssignedDoctorId;

        // Calculate wait time to triage
        if (visit.ArrivalTime != default && visit.TriageTime.HasValue)
        {
            visit.WaitTimeToTriage = (int)(visit.TriageTime.Value - visit.ArrivalTime).TotalMinutes;
        }

        visit.UpdatedAt = DateTime.UtcNow;
        await _edVisitRepository.UpdateAsync(visit);

        _logger.LogInformation("Triage performed for ED Visit {VisitId} with priority {Priority}", id, triageDto.TriagePriority);
        return MapToDto(visit);
    }

    public async Task<EDVisitDto> StartTreatmentAsync(int id, int doctorId)
    {
        var visit = await _edVisitRepository.GetByIdAsync(id);
        if (visit == null)
        {
            throw new ArgumentException("ED Visit not found");
        }

        var doctor = await _doctorRepository.GetByIdAsync(doctorId);
        if (doctor == null)
        {
            throw new ArgumentException("Doctor not found");
        }

        visit.Status = "Treatment";
        visit.TreatmentStartTime = DateTime.UtcNow;
        visit.TreatedByDoctorId = doctorId;

        // Calculate wait time to treatment
        if (visit.ArrivalTime != default && visit.TreatmentStartTime.HasValue)
        {
            visit.WaitTimeToTreatment = (int)(visit.TreatmentStartTime.Value - visit.ArrivalTime).TotalMinutes;
        }

        visit.UpdatedAt = DateTime.UtcNow;
        await _edVisitRepository.UpdateAsync(visit);

        _logger.LogInformation("Treatment started for ED Visit {VisitId} by Doctor {DoctorId}", id, doctorId);
        return MapToDto(visit);
    }

    public async Task<EDVisitDto> DischargePatientAsync(int id, string disposition, string? notes)
    {
        var visit = await _edVisitRepository.GetByIdAsync(id);
        if (visit == null)
        {
            throw new ArgumentException("ED Visit not found");
        }

        visit.Status = disposition == "Admit" ? "Admitted" : "Discharged";
        visit.Disposition = disposition;
        visit.DispositionNotes = notes;
        visit.DischargeTime = DateTime.UtcNow;

        // Calculate total ED stay time
        if (visit.ArrivalTime != default && visit.DischargeTime.HasValue)
        {
            visit.TotalEDStayTime = (int)(visit.DischargeTime.Value - visit.ArrivalTime).TotalMinutes;
        }

        visit.UpdatedAt = DateTime.UtcNow;
        await _edVisitRepository.UpdateAsync(visit);

        _logger.LogInformation("Patient discharged from ED Visit {VisitId} with disposition {Disposition}", id, disposition);
        return MapToDto(visit);
    }

    public async Task DeleteVisitAsync(int id)
    {
        var visit = await _edVisitRepository.GetByIdAsync(id);
        if (visit == null)
        {
            throw new ArgumentException("ED Visit not found");
        }

        await _edVisitRepository.DeleteAsync(visit);
        _logger.LogInformation("ED Visit {VisitId} deleted", id);
    }

    public async Task<Dictionary<string, int>> GetEDStatisticsAsync()
    {
        var activeCount = await _edVisitRepository.GetActiveVisitCountAsync();
        var criticalCount = await _edVisitRepository.GetVisitCountByPriorityAsync("Critical");
        var urgentCount = await _edVisitRepository.GetVisitCountByPriorityAsync("Urgent");
        var nonUrgentCount = await _edVisitRepository.GetVisitCountByPriorityAsync("Non-Urgent");

        return new Dictionary<string, int>
        {
            { "ActiveVisits", activeCount },
            { "Critical", criticalCount },
            { "Urgent", urgentCount },
            { "NonUrgent", nonUrgentCount }
        };
    }

    private string DetermineTriagePriority(CreateEDVisitDto dto)
    {
        // Simple triage logic based on vital signs
        // Critical: Life-threatening conditions
        if (dto.OxygenSaturation.HasValue && dto.OxygenSaturation < 90)
            return "Critical";
        if (dto.HeartRate.HasValue && (dto.HeartRate < 40 || dto.HeartRate > 150))
            return "Critical";
        if (dto.RespiratoryRate.HasValue && (dto.RespiratoryRate < 10 || dto.RespiratoryRate > 30))
            return "Critical";
        if (dto.BloodPressureSystolic.HasValue && dto.BloodPressureSystolic < 80)
            return "Critical";
        if (dto.PainScale.HasValue && dto.PainScale >= 9)
            return "Critical";

        // Urgent: Requires prompt attention
        if (dto.OxygenSaturation.HasValue && dto.OxygenSaturation < 95)
            return "Urgent";
        if (dto.HeartRate.HasValue && (dto.HeartRate < 50 || dto.HeartRate > 120))
            return "Urgent";
        if (dto.Temperature.HasValue && (dto.Temperature < 35 || dto.Temperature > 39))
            return "Urgent";
        if (dto.PainScale.HasValue && dto.PainScale >= 7)
            return "Urgent";

        return "Non-Urgent";
    }

    private EDVisitDto MapToDto(EDVisit visit)
    {
        var patientAge = visit.Patient?.User != null && visit.Patient.DateOfBirth != default
            ? CalculateAge(visit.Patient.DateOfBirth)
            : "Unknown";

        return new EDVisitDto
        {
            Id = visit.Id,
            ArrivalTime = visit.ArrivalTime,
            TriageTime = visit.TriageTime,
            TreatmentStartTime = visit.TreatmentStartTime,
            DischargeTime = visit.DischargeTime,
            TriagePriority = visit.TriagePriority,
            ChiefComplaint = visit.ChiefComplaint,
            TriageNotes = visit.TriageNotes,
            BloodPressureSystolic = visit.BloodPressureSystolic,
            BloodPressureDiastolic = visit.BloodPressureDiastolic,
            Temperature = visit.Temperature,
            HeartRate = visit.HeartRate,
            RespiratoryRate = visit.RespiratoryRate,
            OxygenSaturation = visit.OxygenSaturation,
            PainScale = visit.PainScale,
            Status = visit.Status,
            Disposition = visit.Disposition,
            DispositionNotes = visit.DispositionNotes,
            TreatmentNotes = visit.TreatmentNotes,
            Diagnosis = visit.Diagnosis,
            MedicationsGiven = visit.MedicationsGiven,
            ProceduresPerformed = visit.ProceduresPerformed,
            WaitTimeToTriage = visit.WaitTimeToTriage,
            WaitTimeToTreatment = visit.WaitTimeToTreatment,
            TotalEDStayTime = visit.TotalEDStayTime,
            CreatedAt = visit.CreatedAt,
            UpdatedAt = visit.UpdatedAt,
            PatientId = visit.PatientId,
            PatientName = $"{visit.Patient?.User?.FirstName} {visit.Patient?.User?.LastName}".Trim(),
            PatientAge = patientAge,
            PatientGender = visit.Patient?.Gender ?? string.Empty,
            PatientBloodType = visit.Patient?.BloodType ?? string.Empty,
            TriageNurseId = visit.TriageNurseId,
            TriageNurseName = visit.TriageNurse != null 
                ? $"{visit.TriageNurse.FirstName} {visit.TriageNurse.LastName}".Trim()
                : null,
            AssignedDoctorId = visit.AssignedDoctorId,
            AssignedDoctorName = visit.AssignedDoctor != null
                ? $"{visit.AssignedDoctor.User?.FirstName} {visit.AssignedDoctor.User?.LastName}".Trim()
                : null,
            TreatedByDoctorId = visit.TreatedByDoctorId,
            TreatedByDoctorName = visit.TreatedByDoctor != null
                ? $"{visit.TreatedByDoctor.User?.FirstName} {visit.TreatedByDoctor.User?.LastName}".Trim()
                : null
        };
    }

    private string CalculateAge(DateTime dateOfBirth)
    {
        var today = DateTime.Today;
        var age = today.Year - dateOfBirth.Year;
        if (dateOfBirth.Date > today.AddYears(-age)) age--;
        return age.ToString();
    }
}

