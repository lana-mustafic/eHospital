namespace EHosp.Application.DTOs;

public class RoomTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BaseRatePerDay { get; set; }
    public int MaxOccupancy { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int TotalRooms { get; set; }
    public int AvailableRooms { get; set; }
}

public class CreateRoomTypeDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BaseRatePerDay { get; set; }
    public int MaxOccupancy { get; set; } = 1;
    public bool IsActive { get; set; } = true;
}

public class UpdateRoomTypeDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public decimal? BaseRatePerDay { get; set; }
    public int? MaxOccupancy { get; set; }
    public bool? IsActive { get; set; }
}

public class RoomDto
{
    public int Id { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int Floor { get; set; }
    public string? Building { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Foreign keys
    public int RoomTypeId { get; set; }
    public string? RoomTypeName { get; set; }
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    
    // Statistics
    public int TotalBeds { get; set; }
    public int AvailableBeds { get; set; }
    public int OccupiedBeds { get; set; }
    public List<BedDto> Beds { get; set; } = new();
}

public class CreateRoomDto
{
    public string RoomNumber { get; set; } = string.Empty;
    public int Floor { get; set; }
    public string? Building { get; set; }
    public string Status { get; set; } = "Available";
    public bool IsActive { get; set; } = true;
    public int RoomTypeId { get; set; }
    public int? DepartmentId { get; set; }
}

public class UpdateRoomDto
{
    public string? RoomNumber { get; set; }
    public int? Floor { get; set; }
    public string? Building { get; set; }
    public string? Status { get; set; }
    public bool? IsActive { get; set; }
    public int? RoomTypeId { get; set; }
    public int? DepartmentId { get; set; }
}

public class BedDto
{
    public int Id { get; set; }
    public string BedNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Foreign keys
    public int RoomId { get; set; }
    public string? RoomNumber { get; set; }
    public string? RoomTypeName { get; set; }
    public int? Floor { get; set; }
    public string? Building { get; set; }
}

public class CreateBedDto
{
    public string BedNumber { get; set; } = string.Empty;
    public string Status { get; set; } = "Available";
    public bool IsActive { get; set; } = true;
    public int RoomId { get; set; }
}

public class UpdateBedDto
{
    public string? BedNumber { get; set; }
    public string? Status { get; set; }
    public bool? IsActive { get; set; }
    public int? RoomId { get; set; }
}

public class AdmissionDto
{
    public int Id { get; set; }
    public DateTime AdmissionDate { get; set; }
    public DateTime? DischargeDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string ReasonForAdmission { get; set; } = string.Empty;
    public string? Diagnosis { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Foreign keys
    public int PatientId { get; set; }
    public string? PatientName { get; set; }
    public int RoomId { get; set; }
    public string? RoomNumber { get; set; }
    public int BedId { get; set; }
    public string? BedNumber { get; set; }
    public int? AdmittingDoctorId { get; set; }
    public string? AdmittingDoctorName { get; set; }
    public int? DischargingDoctorId { get; set; }
    public string? DischargingDoctorName { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
    
    // Additional info
    public int? LengthOfStay { get; set; } // in days
    public List<RoomTransferDto> RoomTransfers { get; set; } = new();
}

public class CreateAdmissionDto
{
    public DateTime AdmissionDate { get; set; }
    public string ReasonForAdmission { get; set; } = string.Empty;
    public string? Diagnosis { get; set; }
    public string? Notes { get; set; }
    public int PatientId { get; set; }
    public int RoomId { get; set; }
    public int BedId { get; set; }
    public int? AdmittingDoctorId { get; set; }
    public int? CreatedByUserId { get; set; }
}

public class UpdateAdmissionDto
{
    public DateTime? AdmissionDate { get; set; }
    public DateTime? DischargeDate { get; set; }
    public string? Status { get; set; }
    public string? ReasonForAdmission { get; set; }
    public string? Diagnosis { get; set; }
    public string? Notes { get; set; }
    public int? RoomId { get; set; }
    public int? BedId { get; set; }
    public int? AdmittingDoctorId { get; set; }
    public int? DischargingDoctorId { get; set; }
}

public class DischargePatientDto
{
    public DateTime DischargeDate { get; set; }
    public int DischargingDoctorId { get; set; }
    public string? DischargeNotes { get; set; }
}

public class RoomTransferDto
{
    public int Id { get; set; }
    public DateTime TransferDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
    
    // Foreign keys
    public int AdmissionId { get; set; }
    public int FromRoomId { get; set; }
    public string? FromRoomNumber { get; set; }
    public int ToRoomId { get; set; }
    public string? ToRoomNumber { get; set; }
    public int FromBedId { get; set; }
    public string? FromBedNumber { get; set; }
    public int ToBedId { get; set; }
    public string? ToBedNumber { get; set; }
    public int? TransferredByDoctorId { get; set; }
    public string? TransferredByDoctorName { get; set; }
    
    // Patient info
    public int? PatientId { get; set; }
    public string? PatientName { get; set; }
}

public class CreateRoomTransferDto
{
    public DateTime TransferDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public int AdmissionId { get; set; }
    public int ToRoomId { get; set; }
    public int ToBedId { get; set; }
    public int? TransferredByDoctorId { get; set; }
    public int? CreatedByUserId { get; set; }
}

public class RoomAvailabilityDto
{
    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomTypeName { get; set; } = string.Empty;
    public int Floor { get; set; }
    public string? Building { get; set; }
    public int TotalBeds { get; set; }
    public int AvailableBeds { get; set; }
    public int OccupiedBeds { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<BedAvailabilityDto> AvailableBedsList { get; set; } = new();
}

public class BedAvailabilityDto
{
    public int BedId { get; set; }
    public string BedNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

