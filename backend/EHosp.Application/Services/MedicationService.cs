using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services
{
    public class MedicationService : IMedicationService
    {
        private readonly IMedicationRepository _medicationRepository;
        private readonly ILogger<MedicationService> _logger;

        public MedicationService(IMedicationRepository medicationRepository, ILogger<MedicationService> logger)
        {
            _medicationRepository = medicationRepository;
            _logger = logger;
        }

        public async Task<MedicationDto?> GetMedicationByIdAsync(int id)
        {
            var medication = await _medicationRepository.GetMedicationWithPrescriptionsAsync(id);
            return medication != null ? MapToDto(medication) : null;
        }

        public async Task<IEnumerable<MedicationDto>> GetAllMedicationsAsync()
        {
            var medications = await _medicationRepository.GetAllAsync();
            return medications.Select(MapToDto);
        }

        public async Task<IEnumerable<MedicationDto>> GetActiveMedicationsAsync()
        {
            var medications = await _medicationRepository.GetActiveMedicationsAsync();
            return medications.Select(MapToDto);
        }

        public async Task<IEnumerable<MedicationDto>> GetMedicationsByFormAsync(string form)
        {
            var medications = await _medicationRepository.GetMedicationsByFormAsync(form);
            return medications.Select(MapToDto);
        }

        public async Task<IEnumerable<MedicationDto>> GetLowStockMedicationsAsync(int threshold = 10)
        {
            var medications = await _medicationRepository.GetLowStockMedicationsAsync(threshold);
            return medications.Select(MapToDto);
        }

        public async Task<MedicationDto> CreateMedicationAsync(CreateMedicationDto createMedicationDto)
        {
            var medication = new Medication
            {
                Name = createMedicationDto.Name,
                Description = createMedicationDto.Description,
                Dosage = createMedicationDto.Dosage,
                Form = createMedicationDto.Form,
                Price = createMedicationDto.Price,
                StockQuantity = createMedicationDto.StockQuantity,
                IsActive = true
            };

            var createdMedication = await _medicationRepository.AddAsync(medication);
            return MapToDto(createdMedication);
        }

        public async Task UpdateMedicationAsync(int id, UpdateMedicationDto updateMedicationDto)
        {
            var medication = await _medicationRepository.GetByIdAsync(id);
            if (medication == null)
            {
                throw new ArgumentException("Medication not found");
            }

            if (!string.IsNullOrEmpty(updateMedicationDto.Name))
                medication.Name = updateMedicationDto.Name;
            if (!string.IsNullOrEmpty(updateMedicationDto.Description))
                medication.Description = updateMedicationDto.Description;
            if (!string.IsNullOrEmpty(updateMedicationDto.Dosage))
                medication.Dosage = updateMedicationDto.Dosage;
            if (!string.IsNullOrEmpty(updateMedicationDto.Form))
                medication.Form = updateMedicationDto.Form;
            if (updateMedicationDto.Price.HasValue)
                medication.Price = updateMedicationDto.Price.Value;
            if (updateMedicationDto.StockQuantity.HasValue)
                medication.StockQuantity = updateMedicationDto.StockQuantity.Value;
            if (updateMedicationDto.IsActive.HasValue)
                medication.IsActive = updateMedicationDto.IsActive.Value;

            await _medicationRepository.UpdateAsync(medication);
        }

        public async Task UpdateStockQuantityAsync(int id, int quantity)
        {
            var medication = await _medicationRepository.GetByIdAsync(id);
            if (medication == null)
            {
                throw new ArgumentException("Medication not found");
            }

            if (quantity < 0)
            {
                throw new ArgumentException("Stock quantity cannot be negative");
            }

            medication.StockQuantity = quantity;
            await _medicationRepository.UpdateAsync(medication);
        }

        public async Task DeleteMedicationAsync(int id)
        {
            var medication = await _medicationRepository.GetByIdAsync(id);
            if (medication == null)
            {
                throw new ArgumentException("Medication not found");
            }

            // Check if medication has prescriptions
            var medicationWithPrescriptions = await _medicationRepository.GetMedicationWithPrescriptionsAsync(id);
            if (medicationWithPrescriptions != null && medicationWithPrescriptions.Prescriptions.Any())
            {
                throw new InvalidOperationException("Cannot delete medication with associated prescriptions. Please deactivate it instead.");
            }

            await _medicationRepository.DeleteAsync(medication);
        }

        private static MedicationDto MapToDto(Medication medication) => new()
        {
            Id = medication.Id,
            Name = medication.Name,
            Description = medication.Description,
            Dosage = medication.Dosage,
            Form = medication.Form,
            Price = medication.Price,
            StockQuantity = medication.StockQuantity,
            IsActive = medication.IsActive,
            PrescriptionCount = medication.Prescriptions?.Count ?? 0
        };
    }
}

