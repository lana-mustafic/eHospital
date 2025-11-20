using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class DrugInteractionService : IDrugInteractionService
{
    private readonly IDrugInteractionRepository _interactionRepository;
    private readonly IMedicationRepository _medicationRepository;
    private readonly IPrescriptionRepository _prescriptionRepository;
    private readonly ILogger<DrugInteractionService> _logger;

    public DrugInteractionService(
        IDrugInteractionRepository interactionRepository,
        IMedicationRepository medicationRepository,
        IPrescriptionRepository prescriptionRepository,
        ILogger<DrugInteractionService> logger)
    {
        _interactionRepository = interactionRepository;
        _medicationRepository = medicationRepository;
        _prescriptionRepository = prescriptionRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<DrugInteractionDto>> GetAllInteractionsAsync()
    {
        var interactions = await _interactionRepository.GetAllInteractionsWithDetailsAsync();
        return interactions.Select(MapToDto);
    }

    public async Task<DrugInteractionDto?> GetInteractionByIdAsync(int id)
    {
        var interaction = await _interactionRepository.GetInteractionWithDetailsAsync(id);
        return interaction != null ? MapToDto(interaction) : null;
    }

    public async Task<IEnumerable<DrugInteractionDto>> GetInteractionsByMedicationAsync(int medicationId)
    {
        var interactions = await _interactionRepository.GetInteractionsByMedicationAsync(medicationId);
        return interactions.Select(MapToDto);
    }

    public async Task<DrugInteractionDto?> CheckInteractionAsync(int medication1Id, int medication2Id)
    {
        var interaction = await _interactionRepository.GetInteractionBetweenMedicationsAsync(medication1Id, medication2Id);
        return interaction != null ? MapToDto(interaction) : null;
    }

    public async Task<IEnumerable<DrugInteractionDto>> CheckInteractionsForPrescriptionAsync(int prescriptionId)
    {
        var prescription = await _prescriptionRepository.GetPrescriptionWithDetailsAsync(prescriptionId);
        if (prescription == null)
        {
            return Enumerable.Empty<DrugInteractionDto>();
        }

        // Get all active prescriptions for the patient
        var patientPrescriptions = await _prescriptionRepository.GetPrescriptionsByPatientAsync(prescription.MedicalRecord.PatientId);
        var activePrescriptions = patientPrescriptions
            .Where(p => p.Id != prescriptionId && 
                       (p.Status == "Verified" || p.Status == "Dispensed" || p.Status == "Pending"))
            .ToList();

        var interactions = new List<DrugInteractionDto>();

        foreach (var activePrescription in activePrescriptions)
        {
            var interaction = await _interactionRepository.GetInteractionBetweenMedicationsAsync(
                prescription.MedicationId,
                activePrescription.MedicationId);

            if (interaction != null)
            {
                interactions.Add(MapToDto(interaction));
            }
        }

        return interactions;
    }

    public async Task<DrugInteractionDto> CreateInteractionAsync(CreateDrugInteractionDto createDto)
    {
        if (createDto.Medication1Id == createDto.Medication2Id)
        {
            throw new ArgumentException("A medication cannot interact with itself");
        }

        // Check if interaction already exists
        var existing = await _interactionRepository.GetInteractionBetweenMedicationsAsync(
            createDto.Medication1Id, createDto.Medication2Id);
        if (existing != null)
        {
            throw new InvalidOperationException("Interaction between these medications already exists");
        }

        var interaction = new DrugInteraction
        {
            Medication1Id = createDto.Medication1Id,
            Medication2Id = createDto.Medication2Id,
            Severity = createDto.Severity,
            Description = createDto.Description,
            ClinicalSignificance = createDto.ClinicalSignificance,
            Management = createDto.Management,
            IsActive = true
        };

        var created = await _interactionRepository.AddAsync(interaction);
        var withDetails = await _interactionRepository.GetInteractionWithDetailsAsync(created.Id);
        return MapToDto(withDetails!);
    }

    public async Task UpdateInteractionAsync(int id, UpdateDrugInteractionDto updateDto)
    {
        var interaction = await _interactionRepository.GetByIdAsync(id);
        if (interaction == null)
        {
            throw new ArgumentException("Interaction not found");
        }

        if (!string.IsNullOrEmpty(updateDto.Severity))
            interaction.Severity = updateDto.Severity;
        if (!string.IsNullOrEmpty(updateDto.Description))
            interaction.Description = updateDto.Description;
        if (!string.IsNullOrEmpty(updateDto.ClinicalSignificance))
            interaction.ClinicalSignificance = updateDto.ClinicalSignificance;
        if (!string.IsNullOrEmpty(updateDto.Management))
            interaction.Management = updateDto.Management;
        if (updateDto.IsActive.HasValue)
            interaction.IsActive = updateDto.IsActive.Value;

        interaction.UpdatedAt = DateTime.UtcNow;
        await _interactionRepository.UpdateAsync(interaction);
    }

    public async Task DeleteInteractionAsync(int id)
    {
        var interaction = await _interactionRepository.GetByIdAsync(id);
        if (interaction == null)
        {
            throw new ArgumentException("Interaction not found");
        }

        await _interactionRepository.DeleteAsync(interaction);
    }

    private static DrugInteractionDto MapToDto(DrugInteraction interaction) => new()
    {
        Id = interaction.Id,
        Medication1Id = interaction.Medication1Id,
        Medication1Name = interaction.Medication1?.Name ?? string.Empty,
        Medication2Id = interaction.Medication2Id,
        Medication2Name = interaction.Medication2?.Name ?? string.Empty,
        Severity = interaction.Severity,
        Description = interaction.Description,
        ClinicalSignificance = interaction.ClinicalSignificance,
        Management = interaction.Management,
        IsActive = interaction.IsActive
    };
}

