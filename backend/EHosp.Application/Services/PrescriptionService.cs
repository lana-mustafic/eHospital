using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services
{
    public class PrescriptionService : IPrescriptionService
    {
        private readonly IPrescriptionRepository _prescriptionRepository;
        private readonly IMedicalRecordRepository _medicalRecordRepository;
        private readonly IMedicationRepository _medicationRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly ILogger<PrescriptionService> _logger;
        private readonly IAuditService _auditService;
        private readonly PrescriptionSafetyService _safetyService;

        public PrescriptionService(
            IPrescriptionRepository prescriptionRepository,
            IMedicalRecordRepository medicalRecordRepository,
            IMedicationRepository medicationRepository,
            IDoctorRepository doctorRepository,
            ILogger<PrescriptionService> logger,
            IAuditService auditService,
            PrescriptionSafetyService safetyService)
        {
            _prescriptionRepository = prescriptionRepository;
            _medicalRecordRepository = medicalRecordRepository;
            _medicationRepository = medicationRepository;
            _doctorRepository = doctorRepository;
            _logger = logger;
            _auditService = auditService;
            _safetyService = safetyService;
        }

        public async Task<IEnumerable<PrescriptionDto>> GetAllPrescriptionsAsync()
        {
            var prescriptions = await _prescriptionRepository.GetAllPrescriptionsWithDetailsAsync();
            return prescriptions.Select(MapToDto);
        }

        public async Task<PrescriptionDto?> GetPrescriptionByIdAsync(int id)
        {
            var prescription = await _prescriptionRepository.GetPrescriptionWithDetailsAsync(id);
            return prescription != null ? MapToDto(prescription) : null;
        }

        public async Task<IEnumerable<PrescriptionDto>> GetPrescriptionsByMedicalRecordAsync(int medicalRecordId)
        {
            var prescriptions = await _prescriptionRepository.GetPrescriptionsByMedicalRecordAsync(medicalRecordId);
            return prescriptions.Select(MapToDto);
        }

        public async Task<IEnumerable<PrescriptionDto>> GetPrescriptionsByPatientAsync(int patientId)
        {
            var prescriptions = await _prescriptionRepository.GetPrescriptionsByPatientAsync(patientId);
            return prescriptions.Select(MapToDto);
        }

        public async Task<IEnumerable<PrescriptionDto>> GetPrescriptionsByDoctorAsync(int doctorId)
        {
            var prescriptions = await _prescriptionRepository.GetPrescriptionsByDoctorAsync(doctorId);
            return prescriptions.Select(MapToDto);
        }

        public async Task<IEnumerable<PrescriptionDto>> GetPrescriptionsByMedicationAsync(int medicationId)
        {
            var prescriptions = await _prescriptionRepository.GetPrescriptionsByMedicationAsync(medicationId);
            return prescriptions.Select(MapToDto);
        }

        public async Task<IEnumerable<PrescriptionDto>> GetPendingPrescriptionsAsync()
        {
            var prescriptions = await _prescriptionRepository.GetAllPrescriptionsWithDetailsAsync();
            return prescriptions
                .Where(p => p.Status == "Pending")
                .Select(MapToDto);
        }

        public async Task<PrescriptionDto> CreatePrescriptionAsync(CreatePrescriptionDto createPrescriptionDto)
        {
            // Validate medical record exists
            var medicalRecord = await _medicalRecordRepository.GetByIdAsync(createPrescriptionDto.MedicalRecordId);
            if (medicalRecord == null)
            {
                throw new ArgumentException("Medical record not found");
            }

            // Validate medication exists and is active
            var medication = await _medicationRepository.GetByIdAsync(createPrescriptionDto.MedicationId);
            if (medication == null)
            {
                throw new ArgumentException("Medication not found");
            }

            if (!medication.IsActive)
            {
                throw new InvalidOperationException("Cannot prescribe inactive medication");
            }

            // Check medication stock availability
            if (medication.StockQuantity <= 0)
            {
                throw new InvalidOperationException("Medication is out of stock");
            }

            // Validate doctor exists
            var doctor = await _doctorRepository.GetByIdAsync(createPrescriptionDto.DoctorId);
            if (doctor == null)
            {
                throw new ArgumentException("Doctor not found");
            }

            // Verify doctor matches medical record doctor
            if (medicalRecord.DoctorId != createPrescriptionDto.DoctorId)
            {
                throw new ArgumentException("Doctor ID must match the medical record's doctor");
            }

            var prescription = new Prescription
            {
                Dosage = createPrescriptionDto.Dosage,
                Frequency = createPrescriptionDto.Frequency,
                Duration = createPrescriptionDto.Duration,
                Instructions = createPrescriptionDto.Instructions,
                MedicalRecordId = createPrescriptionDto.MedicalRecordId,
                MedicationId = createPrescriptionDto.MedicationId,
                DoctorId = createPrescriptionDto.DoctorId,
                PrescribedDate = DateTime.UtcNow
            };

            var createdPrescription = await _prescriptionRepository.AddAsync(prescription);
            await _auditService.WriteAsync("system", "Doctor", "Create", "Prescription", createdPrescription.Id.ToString(), $"MedicationId={createdPrescription.MedicationId}");
            var prescriptionWithDetails = await _prescriptionRepository.GetPrescriptionWithDetailsAsync(createdPrescription.Id);
            return MapToDto(prescriptionWithDetails!);
        }

        public async Task UpdatePrescriptionAsync(int id, UpdatePrescriptionDto updatePrescriptionDto)
        {
            var prescription = await _prescriptionRepository.GetByIdAsync(id);
            if (prescription == null)
            {
                throw new ArgumentException("Prescription not found");
            }

            if (!string.IsNullOrEmpty(updatePrescriptionDto.Dosage))
                prescription.Dosage = updatePrescriptionDto.Dosage;
            if (!string.IsNullOrEmpty(updatePrescriptionDto.Frequency))
                prescription.Frequency = updatePrescriptionDto.Frequency;
            if (updatePrescriptionDto.Duration.HasValue)
                prescription.Duration = updatePrescriptionDto.Duration.Value;
            if (updatePrescriptionDto.Instructions != null)
                prescription.Instructions = updatePrescriptionDto.Instructions;

            await _prescriptionRepository.UpdateAsync(prescription);
            await _auditService.WriteAsync("system", "Doctor", "Update", "Prescription", prescription.Id.ToString(), "Updated fields");
        }

        public async Task DeletePrescriptionAsync(int id)
        {
            var prescription = await _prescriptionRepository.GetByIdAsync(id);
            if (prescription == null)
            {
                throw new ArgumentException("Prescription not found");
            }

            await _prescriptionRepository.DeleteAsync(prescription);
            await _auditService.WriteAsync("system", "Doctor", "Delete", "Prescription", prescription.Id.ToString(), $"MedicationId={prescription.MedicationId}");
        }

        public async Task<PrescriptionDto> VerifyPrescriptionAsync(int id, int verifiedByUserId, string? notes = null)
        {
            var prescription = await _prescriptionRepository.GetPrescriptionWithDetailsAsync(id);
            if (prescription == null)
            {
                throw new ArgumentException("Prescription not found");
            }

            if (prescription.Status != "Pending")
            {
                throw new InvalidOperationException($"Cannot verify prescription with status: {prescription.Status}");
            }

            // Check allergies
            var allergyCheck = await _safetyService.CheckAllergiesAsync(
                prescription.MedicalRecord.PatientId,
                prescription.MedicationId);
            
            prescription.AllergyChecked = true;
            if (allergyCheck.HasAllergy)
            {
                prescription.AllergyAlert = allergyCheck.AlertMessage;
            }

            // Check interactions
            var interactionCheck = await _safetyService.CheckInteractionsAsync(id);
            
            prescription.InteractionChecked = true;
            if (interactionCheck.HasInteractions)
            {
                prescription.InteractionAlert = interactionCheck.AlertMessage;
            }

            prescription.Status = "Verified";
            prescription.VerifiedByUserId = verifiedByUserId;
            prescription.VerifiedAt = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(notes))
            {
                prescription.PharmacistNotes = notes;
            }

            await _prescriptionRepository.UpdateAsync(prescription);
            await _auditService.WriteAsync("system", "Pharmacist", "Verify", "Prescription", prescription.Id.ToString(), $"VerifiedBy={verifiedByUserId}");
            
            var updated = await _prescriptionRepository.GetPrescriptionWithDetailsAsync(id);
            return MapToDto(updated!);
        }

        public async Task<PrescriptionDto> DispensePrescriptionAsync(int id, int dispensedByUserId, string? notes = null)
        {
            var prescription = await _prescriptionRepository.GetPrescriptionWithDetailsAsync(id);
            if (prescription == null)
            {
                throw new ArgumentException("Prescription not found");
            }

            if (prescription.Status != "Verified")
            {
                throw new InvalidOperationException($"Cannot dispense prescription with status: {prescription.Status}. Prescription must be verified first.");
            }

            // Check stock availability
            var medication = await _medicationRepository.GetByIdAsync(prescription.MedicationId);
            if (medication == null || medication.StockQuantity <= 0)
            {
                throw new InvalidOperationException("Medication is out of stock");
            }

            // Reduce stock (in a real system, this would be handled by stock movement)
            medication.StockQuantity -= 1;
            await _medicationRepository.UpdateAsync(medication);

            prescription.Status = "Dispensed";
            prescription.DispensedByUserId = dispensedByUserId;
            prescription.DispensedAt = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(notes))
            {
                prescription.PharmacistNotes = (prescription.PharmacistNotes ?? "") + "\n" + notes;
            }

            await _prescriptionRepository.UpdateAsync(prescription);
            await _auditService.WriteAsync("system", "Pharmacist", "Dispense", "Prescription", prescription.Id.ToString(), $"DispensedBy={dispensedByUserId}");
            
            var updated = await _prescriptionRepository.GetPrescriptionWithDetailsAsync(id);
            return MapToDto(updated!);
        }

        public async Task<PrescriptionDto> CancelPrescriptionAsync(int id, string? reason = null)
        {
            var prescription = await _prescriptionRepository.GetPrescriptionWithDetailsAsync(id);
            if (prescription == null)
            {
                throw new ArgumentException("Prescription not found");
            }

            if (prescription.Status == "Dispensed" || prescription.Status == "Completed")
            {
                throw new InvalidOperationException($"Cannot cancel prescription with status: {prescription.Status}");
            }

            prescription.Status = "Cancelled";
            if (!string.IsNullOrEmpty(reason))
            {
                prescription.PharmacistNotes = (prescription.PharmacistNotes ?? "") + "\nCancelled: " + reason;
            }

            await _prescriptionRepository.UpdateAsync(prescription);
            await _auditService.WriteAsync("system", "Pharmacist", "Cancel", "Prescription", prescription.Id.ToString(), $"Reason={reason ?? "Not specified"}");
            
            var updated = await _prescriptionRepository.GetPrescriptionWithDetailsAsync(id);
            return MapToDto(updated!);
        }

        private static PrescriptionDto MapToDto(Prescription prescription) => new()
        {
            Id = prescription.Id,
            Dosage = prescription.Dosage,
            Frequency = prescription.Frequency,
            Duration = prescription.Duration,
            Instructions = prescription.Instructions,
            PrescribedDate = prescription.PrescribedDate,
            MedicalRecordId = prescription.MedicalRecordId,
            MedicationId = prescription.MedicationId,
            MedicationName = prescription.Medication?.Name ?? string.Empty,
            MedicationForm = prescription.Medication?.Form ?? string.Empty,
            DoctorId = prescription.DoctorId,
            DoctorName = $"{prescription.Doctor?.User?.FirstName} {prescription.Doctor?.User?.LastName}".Trim(),
            PatientId = prescription.MedicalRecord?.PatientId ?? 0,
            PatientName = $"{prescription.MedicalRecord?.Patient?.User?.FirstName} {prescription.MedicalRecord?.Patient?.User?.LastName}".Trim(),
            Status = prescription.Status,
            VerifiedByUserId = prescription.VerifiedByUserId,
            VerifiedByUserName = prescription.VerifiedByUser != null 
                ? $"{prescription.VerifiedByUser.FirstName} {prescription.VerifiedByUser.LastName}".Trim() 
                : null,
            DispensedByUserId = prescription.DispensedByUserId,
            DispensedByUserName = prescription.DispensedByUser != null 
                ? $"{prescription.DispensedByUser.FirstName} {prescription.DispensedByUser.LastName}".Trim() 
                : null,
            VerifiedAt = prescription.VerifiedAt,
            DispensedAt = prescription.DispensedAt,
            AllergyChecked = prescription.AllergyChecked,
            InteractionChecked = prescription.InteractionChecked,
            PharmacistNotes = prescription.PharmacistNotes,
            AllergyAlert = prescription.AllergyAlert,
            InteractionAlert = prescription.InteractionAlert
        };
    }
}

