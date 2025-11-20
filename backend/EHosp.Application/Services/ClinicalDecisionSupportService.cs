using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class ClinicalDecisionSupportService : IClinicalDecisionSupportService
{
    private readonly IDrugInteractionService _drugInteractionService;
    private readonly IPrescriptionRepository _prescriptionRepository;
    private readonly ILabTestRepository _labTestRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly ILogger<ClinicalDecisionSupportService> _logger;

    public ClinicalDecisionSupportService(
        IDrugInteractionService drugInteractionService,
        IPrescriptionRepository prescriptionRepository,
        ILabTestRepository labTestRepository,
        IPatientRepository patientRepository,
        ILogger<ClinicalDecisionSupportService> logger)
    {
        _drugInteractionService = drugInteractionService;
        _prescriptionRepository = prescriptionRepository;
        _labTestRepository = labTestRepository;
        _patientRepository = patientRepository;
        _logger = logger;
    }

    public async Task<CDSDashboardDto> GetDashboardAsync()
    {
        var allInteractions = await _drugInteractionService.GetAllInteractionsAsync();
        var activeInteractions = allInteractions.Count();

        var criticalAlerts = await GetCriticalAlertsAsync();
        var pendingAlerts = criticalAlerts.Count(a => !a.Acknowledged);

        var guidelines = await GetGuidelinesAsync();
        var guidelinesCount = guidelines.Count();

        var protocols = await GetAllProtocolsAsync();
        var protocolsCount = protocols.Count();

        var recentAlerts = criticalAlerts
            .OrderByDescending(a => a.Timestamp)
            .Take(5)
            .ToList();

        var recentInteractions = allInteractions
            .OrderByDescending(i => i.Id)
            .Take(5)
            .ToList();

        return new CDSDashboardDto
        {
            ActiveInteractions = activeInteractions,
            PendingAlerts = pendingAlerts,
            GuidelinesAvailable = guidelinesCount,
            ProtocolsSuggested = protocolsCount,
            RecentAlerts = recentAlerts,
            RecentInteractions = recentInteractions
        };
    }

    public async Task<CheckInteractionResponseDto> CheckInteractionsAsync(CheckInteractionRequestDto request)
    {
        var interactions = new List<DrugInteractionDto>();

        // Check all pairs of medications
        for (int i = 0; i < request.MedicationIds.Count; i++)
        {
            for (int j = i + 1; j < request.MedicationIds.Count; j++)
            {
                var interaction = await _drugInteractionService.CheckInteractionAsync(
                    request.MedicationIds[i],
                    request.MedicationIds[j]);

                if (interaction != null)
                {
                    interactions.Add(interaction);
                }
            }
        }

        // If patient ID is provided, also check against existing prescriptions
        if (request.PatientId.HasValue)
        {
            var patientPrescriptions = await _prescriptionRepository.GetPrescriptionsByPatientAsync(request.PatientId.Value);
            var activePrescriptions = patientPrescriptions
                .Where(p => p.Status == "Verified" || p.Status == "Dispensed" || p.Status == "Pending")
                .ToList();

            foreach (var medicationId in request.MedicationIds)
            {
                foreach (var prescription in activePrescriptions)
                {
                    var interaction = await _drugInteractionService.CheckInteractionAsync(
                        medicationId,
                        prescription.MedicationId);

                    if (interaction != null && !interactions.Any(i => 
                        (i.Medication1Id == interaction.Medication1Id && i.Medication2Id == interaction.Medication2Id) ||
                        (i.Medication1Id == interaction.Medication2Id && i.Medication2Id == interaction.Medication1Id)))
                    {
                        interactions.Add(interaction);
                    }
                }
            }
        }

        var hasInteractions = interactions.Any();
        var criticalInteractions = interactions.Where(i => 
            i.Severity.Equals("Severe", StringComparison.OrdinalIgnoreCase) ||
            i.Severity.Equals("Life-threatening", StringComparison.OrdinalIgnoreCase)).ToList();

        var alertMessage = criticalInteractions.Any()
            ? $"🚨 CRITICAL DRUG INTERACTION: {string.Join(", ", criticalInteractions.Select(i => $"{i.Medication1Name} + {i.Medication2Name}"))}"
            : hasInteractions
                ? $"⚠️ DRUG INTERACTION WARNING: {string.Join(", ", interactions.Select(i => $"{i.Medication1Name} + {i.Medication2Name}"))}"
                : null;

        return new CheckInteractionResponseDto
        {
            HasInteractions = hasInteractions,
            Interactions = interactions,
            AlertMessage = alertMessage
        };
    }

    public async Task<IEnumerable<DrugInteractionDto>> GetAllInteractionsAsync()
    {
        return await _drugInteractionService.GetAllInteractionsAsync();
    }

    public async Task<IEnumerable<DrugInteractionDto>> GetInteractionsByMedicationAsync(int medicationId)
    {
        return await _drugInteractionService.GetInteractionsByMedicationAsync(medicationId);
    }

    public async Task<IEnumerable<DrugInteractionDto>> GetInteractionsByPatientAsync(int patientId)
    {
        var prescriptions = await _prescriptionRepository.GetPrescriptionsByPatientAsync(patientId);
        var activePrescriptions = prescriptions
            .Where(p => p.Status == "Verified" || p.Status == "Dispensed" || p.Status == "Pending")
            .ToList();

        var interactions = new List<DrugInteractionDto>();

        for (int i = 0; i < activePrescriptions.Count; i++)
        {
            for (int j = i + 1; j < activePrescriptions.Count; j++)
            {
                var interaction = await _drugInteractionService.CheckInteractionAsync(
                    activePrescriptions[i].MedicationId,
                    activePrescriptions[j].MedicationId);

                if (interaction != null)
                {
                    interactions.Add(interaction);
                }
            }
        }

        return interactions;
    }

    public async Task<IEnumerable<ClinicalGuidelineDto>> GetGuidelinesAsync(GetGuidelinesRequestDto? request = null)
    {
        // In a real implementation, this would query a database
        // For now, return mock data based on common clinical guidelines
        var guidelines = GetMockGuidelines();

        if (request != null)
        {
            if (!string.IsNullOrEmpty(request.Condition))
            {
                guidelines = guidelines.Where(g => 
                    g.Condition.Contains(request.Condition, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (!string.IsNullOrEmpty(request.Category))
            {
                guidelines = guidelines.Where(g => 
                    g.Category.Equals(request.Category, StringComparison.OrdinalIgnoreCase)).ToList();
            }
        }

        return await Task.FromResult(guidelines);
    }

    public async Task<ClinicalGuidelineDto?> GetGuidelineByIdAsync(int id)
    {
        var guidelines = GetMockGuidelines();
        return await Task.FromResult(guidelines.FirstOrDefault(g => g.Id == id));
    }

    public async Task<IEnumerable<ProtocolSuggestionDto>> GetProtocolSuggestionsAsync(GetProtocolSuggestionsRequestDto request)
    {
        var allProtocols = GetMockProtocols();
        var matchingProtocols = allProtocols
            .Where(p => p.Condition.Contains(request.Condition, StringComparison.OrdinalIgnoreCase))
            .ToList();

        return await Task.FromResult(matchingProtocols);
    }

    public async Task<IEnumerable<ProtocolSuggestionDto>> GetAllProtocolsAsync()
    {
        return await Task.FromResult(GetMockProtocols());
    }

    public async Task<IEnumerable<CriticalValueAlertDto>> GetCriticalAlertsAsync()
    {
        // In a real implementation, this would query lab tests with critical values
        // For now, check for completed tests with results that might indicate critical values
        try
        {
            var labTests = await _labTestRepository.GetAllLabTestsWithDetailsAsync();
            var completedTests = labTests
                .Where(lt => lt.Status == "Completed" && !string.IsNullOrEmpty(lt.Results))
                .ToList();

            // Check for keywords that might indicate critical values
            var criticalKeywords = new[] { "critical", "abnormal", "high", "low", "elevated", "decreased" };
            var criticalTests = completedTests
                .Where(lt => criticalKeywords.Any(keyword => 
                    lt.Results!.Contains(keyword, StringComparison.OrdinalIgnoreCase)))
                .Select(lt => new CriticalValueAlertDto
                {
                    Id = lt.Id,
                    PatientId = lt.PatientId,
                    PatientName = lt.Patient?.User != null 
                        ? $"{lt.Patient.User.FirstName} {lt.Patient.User.LastName}" 
                        : $"Patient #{lt.PatientId}",
                    TestName = lt.TestName ?? "Unknown Test",
                    TestType = lt.TestType ?? "Unknown",
                    Parameter = "Result",
                    Value = lt.Results ?? "N/A",
                    Unit = "",
                    NormalRange = "See reference ranges",
                    Severity = "Critical",
                    AlertMessage = $"Critical lab result detected for {lt.TestName}. Please review immediately.",
                    Timestamp = lt.CompletedDate ?? DateTime.UtcNow,
                    Acknowledged = false
                })
                .ToList();

            return criticalTests;
        }
        catch
        {
            // If lab test repository is not available, return empty list
            return new List<CriticalValueAlertDto>();
        }
    }

    public async Task<IEnumerable<CriticalValueAlertDto>> GetAlertsByPatientAsync(int patientId)
    {
        var allAlerts = await GetCriticalAlertsAsync();
        return allAlerts.Where(a => a.PatientId == patientId);
    }

    public async Task AcknowledgeAlertAsync(int alertId, string acknowledgedBy)
    {
        // In a real implementation, this would update the alert in the database
        // For now, this is a placeholder
        _logger.LogInformation($"Alert {alertId} acknowledged by {acknowledgedBy}");
        await Task.CompletedTask;
    }

    public async Task<IEnumerable<ClinicalGuidelineDto>> GetRemindersAsync(int? patientId = null)
    {
        // Return relevant reminders based on patient or general reminders
        var guidelines = await GetGuidelinesAsync();
        return guidelines.Take(5); // Return top 5 as reminders
    }

    private List<ClinicalGuidelineDto> GetMockGuidelines()
    {
        return new List<ClinicalGuidelineDto>
        {
            new()
            {
                Id = 1,
                Title = "Hypertension Management",
                Category = "Cardiology",
                Condition = "Hypertension",
                Description = "Evidence-based guidelines for the management of hypertension in adults.",
                Recommendations = new List<string>
                {
                    "Monitor blood pressure regularly",
                    "Lifestyle modifications: diet, exercise, weight management",
                    "ACE inhibitors or ARBs as first-line therapy",
                    "Target BP < 130/80 mmHg for most patients"
                },
                EvidenceLevel = "A",
                LastUpdated = DateTime.UtcNow.AddMonths(-2),
                ApplicableTo = new List<string> { "Adults", "Elderly" }
            },
            new()
            {
                Id = 2,
                Title = "Diabetes Type 2 Management",
                Category = "Endocrinology",
                Condition = "Diabetes Type 2",
                Description = "Comprehensive guidelines for Type 2 diabetes management and glycemic control.",
                Recommendations = new List<string>
                {
                    "HbA1c target < 7% for most patients",
                    "Metformin as first-line therapy",
                    "Regular monitoring of blood glucose",
                    "Annual eye and foot examinations"
                },
                EvidenceLevel = "A",
                LastUpdated = DateTime.UtcNow.AddMonths(-1)
            },
            new()
            {
                Id = 3,
                Title = "Sepsis Recognition and Management",
                Category = "Emergency",
                Condition = "Sepsis",
                Description = "Early recognition and management of sepsis to improve outcomes.",
                Recommendations = new List<string>
                {
                    "Screen for sepsis using SIRS criteria or qSOFA",
                    "Obtain blood cultures before antibiotics",
                    "Administer broad-spectrum antibiotics within 1 hour",
                    "Fluid resuscitation for hypotension"
                },
                EvidenceLevel = "A",
                LastUpdated = DateTime.UtcNow.AddMonths(-3)
            },
            new()
            {
                Id = 4,
                Title = "Antibiotic Stewardship",
                Category = "Infectious Disease",
                Condition = "Infection",
                Description = "Guidelines for appropriate antibiotic use to prevent resistance.",
                Recommendations = new List<string>
                {
                    "Use narrow-spectrum antibiotics when possible",
                    "Obtain cultures before starting antibiotics",
                    "Review and de-escalate therapy based on results",
                    "Limit duration of antibiotic therapy"
                },
                EvidenceLevel = "B",
                LastUpdated = DateTime.UtcNow.AddMonths(-1)
            }
        };
    }

    private List<ProtocolSuggestionDto> GetMockProtocols()
    {
        return new List<ProtocolSuggestionDto>
        {
            new()
            {
                Id = 1,
                Condition = "Sepsis",
                ProtocolName = "Sepsis Protocol - 1 Hour Bundle",
                Description = "Evidence-based protocol for early management of sepsis.",
                Steps = new List<ProtocolStepDto>
                {
                    new() { StepNumber = 1, Description = "Measure lactate level", Duration = "Immediate" },
                    new() { StepNumber = 2, Description = "Obtain blood cultures before antibiotics", Duration = "Within 1 hour" },
                    new() { StepNumber = 3, Description = "Administer broad-spectrum antibiotics", Duration = "Within 1 hour" },
                    new() { StepNumber = 4, Description = "Begin fluid resuscitation if hypotensive", Duration = "Within 1 hour" }
                },
                Indications = new List<string> { "Suspected infection", "SIRS criteria", "qSOFA ≥ 2" },
                Contraindications = new List<string> { "Known drug allergies" },
                Priority = "Critical"
            },
            new()
            {
                Id = 2,
                Condition = "Hypertension",
                ProtocolName = "Hypertension Management Protocol",
                Description = "Stepwise approach to hypertension management.",
                Steps = new List<ProtocolStepDto>
                {
                    new() { StepNumber = 1, Description = "Confirm diagnosis with multiple readings", Duration = "1-2 weeks" },
                    new() { StepNumber = 2, Description = "Assess cardiovascular risk", Duration = "Initial visit" },
                    new() { StepNumber = 3, Description = "Initiate lifestyle modifications", Duration = "Ongoing" },
                    new() { StepNumber = 4, Description = "Start pharmacotherapy if needed", Duration = "After 3-6 months" }
                },
                Indications = new List<string> { "BP ≥ 130/80 mmHg", "High cardiovascular risk" },
                Contraindications = new List<string> { "Pregnancy (use different protocol)" },
                Priority = "Routine"
            },
            new()
            {
                Id = 3,
                Condition = "Acute Myocardial Infarction",
                ProtocolName = "STEMI Protocol",
                Description = "Protocol for management of ST-elevation myocardial infarction.",
                Steps = new List<ProtocolStepDto>
                {
                    new() { StepNumber = 1, Description = "Obtain 12-lead ECG", Duration = "Immediate" },
                    new() { StepNumber = 2, Description = "Administer aspirin 325mg", Duration = "Immediate" },
                    new() { StepNumber = 3, Description = "Activate cardiac catheterization lab", Duration = "Immediate" },
                    new() { StepNumber = 4, Description = "Administer dual antiplatelet therapy", Duration = "Within 1 hour" }
                },
                Indications = new List<string> { "ST elevation on ECG", "Chest pain", "Elevated troponin" },
                Contraindications = new List<string> { "Active bleeding", "Known allergies" },
                Priority = "Critical"
            }
        };
    }
}

