using EHosp.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class PrescriptionSafetyService
{
    private readonly IPatientAllergyRepository _allergyRepository;
    private readonly IDrugInteractionRepository _interactionRepository;
    private readonly IPrescriptionRepository _prescriptionRepository;
    private readonly IMedicationRepository _medicationRepository;
    private readonly ILogger<PrescriptionSafetyService> _logger;

    public PrescriptionSafetyService(
        IPatientAllergyRepository allergyRepository,
        IDrugInteractionRepository interactionRepository,
        IPrescriptionRepository prescriptionRepository,
        IMedicationRepository medicationRepository,
        ILogger<PrescriptionSafetyService> logger)
    {
        _allergyRepository = allergyRepository;
        _interactionRepository = interactionRepository;
        _prescriptionRepository = prescriptionRepository;
        _medicationRepository = medicationRepository;
        _logger = logger;
    }

    public async Task<AllergyCheckResult> CheckAllergiesAsync(int patientId, int medicationId)
    {
        var allergies = await _allergyRepository.GetActivePatientAllergiesByPatientAsync(patientId);
        var medication = await _medicationRepository.GetByIdAsync(medicationId);

        if (medication == null)
        {
            return new AllergyCheckResult { HasAllergy = false };
        }

        var medicationName = medication.Name.ToLower();
        var activeIngredient = medication.ActiveIngredient?.ToLower() ?? string.Empty;

        var matchingAllergies = allergies
            .Where(a => a.AllergyType == "Medication" && a.IsActive)
            .Where(a =>
                a.AllergenName.ToLower().Contains(medicationName) ||
                medicationName.Contains(a.AllergenName.ToLower()) ||
                (!string.IsNullOrEmpty(activeIngredient) && a.AllergenName.ToLower().Contains(activeIngredient)))
            .ToList();

        if (matchingAllergies.Any())
        {
            var severity = matchingAllergies.Max(a => GetSeverityLevel(a.Severity));
            var highestSeverityAllergy = matchingAllergies
                .OrderByDescending(a => GetSeverityLevel(a.Severity))
                .First();

            return new AllergyCheckResult
            {
                HasAllergy = true,
                Severity = highestSeverityAllergy.Severity,
                AllergenName = highestSeverityAllergy.AllergenName,
                Reaction = highestSeverityAllergy.Reaction,
                AlertMessage = $"⚠️ ALLERGY ALERT: Patient has {highestSeverityAllergy.Severity} allergy to {highestSeverityAllergy.AllergenName}. " +
                              $"Reaction: {highestSeverityAllergy.Reaction ?? "Not specified"}"
            };
        }

        return new AllergyCheckResult { HasAllergy = false };
    }

    public async Task<InteractionCheckResult> CheckInteractionsAsync(int prescriptionId)
    {
        var prescription = await _prescriptionRepository.GetPrescriptionWithDetailsAsync(prescriptionId);
        if (prescription == null)
        {
            return new InteractionCheckResult { HasInteractions = false };
        }

        // Get all active prescriptions for the patient
        var patientPrescriptions = await _prescriptionRepository.GetPrescriptionsByPatientAsync(
            prescription.MedicalRecord.PatientId);
        
        var activePrescriptions = patientPrescriptions
            .Where(p => p.Id != prescriptionId && 
                       (p.Status == "Verified" || p.Status == "Dispensed" || p.Status == "Pending"))
            .ToList();

        var interactions = new List<Domain.Entities.DrugInteraction>();

        foreach (var activePrescription in activePrescriptions)
        {
            var interaction = await _interactionRepository.GetInteractionBetweenMedicationsAsync(
                prescription.MedicationId,
                activePrescription.MedicationId);

            if (interaction != null)
            {
                interactions.Add(interaction);
            }
        }

        if (interactions.Any())
        {
            var highestSeverity = interactions.Max(i => GetSeverityLevel(i.Severity));
            var criticalInteractions = interactions
                .Where(i => GetSeverityLevel(i.Severity) >= 3)
                .ToList();

            var alertMessage = criticalInteractions.Any()
                ? $"🚨 CRITICAL DRUG INTERACTION: {string.Join(", ", criticalInteractions.Select(i => $"{i.Medication1.Name} + {i.Medication2.Name}"))}"
                : $"⚠️ DRUG INTERACTION WARNING: {string.Join(", ", interactions.Select(i => $"{i.Medication1.Name} + {i.Medication2.Name}"))}";

            return new InteractionCheckResult
            {
                HasInteractions = true,
                Interactions = interactions.Select(i => new InteractionInfo
                {
                    Medication1Name = i.Medication1?.Name ?? string.Empty,
                    Medication2Name = i.Medication2?.Name ?? string.Empty,
                    Severity = i.Severity,
                    Description = i.Description,
                    Management = i.Management
                }).ToList(),
                AlertMessage = alertMessage
            };
        }

        return new InteractionCheckResult { HasInteractions = false };
    }

    private static int GetSeverityLevel(string severity)
    {
        return severity.ToLower() switch
        {
            "life-threatening" or "contraindicated" => 4,
            "severe" or "major" => 3,
            "moderate" => 2,
            "mild" or "minor" => 1,
            _ => 0
        };
    }
}

public class AllergyCheckResult
{
    public bool HasAllergy { get; set; }
    public string? Severity { get; set; }
    public string? AllergenName { get; set; }
    public string? Reaction { get; set; }
    public string? AlertMessage { get; set; }
}

public class InteractionCheckResult
{
    public bool HasInteractions { get; set; }
    public List<InteractionInfo> Interactions { get; set; } = new();
    public string? AlertMessage { get; set; }
}

public class InteractionInfo
{
    public string Medication1Name { get; set; } = string.Empty;
    public string Medication2Name { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Management { get; set; } = string.Empty;
}

