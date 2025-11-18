export interface RoomType {
  id: number;
  name: string;
  description: string;
  baseRatePerDay: number;
  maxOccupancy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  totalRooms: number;
  availableRooms: number;
}

export interface CreateRoomTypeRequest {
  name: string;
  description?: string;
  baseRatePerDay: number;
  maxOccupancy?: number;
  isActive?: boolean;
}

export interface UpdateRoomTypeRequest {
  name?: string;
  description?: string;
  baseRatePerDay?: number;
  maxOccupancy?: number;
  isActive?: boolean;
}

export interface Bed {
  id: number;
  bedNumber: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  roomId: number;
  roomNumber?: string;
  roomTypeName?: string;
  floor?: number;
  building?: string;
}

export interface CreateBedRequest {
  bedNumber: string;
  status?: string;
  isActive?: boolean;
  roomId: number;
}

export interface UpdateBedRequest {
  bedNumber?: string;
  status?: string;
  isActive?: boolean;
  roomId?: number;
}

export interface Room {
  id: number;
  roomNumber: string;
  floor: number;
  building?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  roomTypeId: number;
  roomTypeName?: string;
  departmentId?: number;
  departmentName?: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  beds: Bed[];
}

export interface CreateRoomRequest {
  roomNumber: string;
  floor: number;
  building?: string;
  status?: string;
  isActive?: boolean;
  roomTypeId: number;
  departmentId?: number;
}

export interface UpdateRoomRequest {
  roomNumber?: string;
  floor?: number;
  building?: string;
  status?: string;
  isActive?: boolean;
  roomTypeId?: number;
  departmentId?: number;
}

export interface RoomAvailability {
  roomId: number;
  roomNumber: string;
  roomTypeName: string;
  floor: number;
  building?: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  status: string;
  availableBedsList: BedAvailability[];
}

export interface BedAvailability {
  bedId: number;
  bedNumber: string;
  status: string;
}

export interface Admission {
  id: number;
  admissionDate: string;
  dischargeDate?: string;
  status: string;
  reasonForAdmission: string;
  diagnosis?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  patientId: number;
  patientName?: string;
  roomId: number;
  roomNumber?: string;
  bedId: number;
  bedNumber?: string;
  admittingDoctorId?: number;
  admittingDoctorName?: string;
  dischargingDoctorId?: number;
  dischargingDoctorName?: string;
  createdByUserId?: number;
  createdByUserName?: string;
  lengthOfStay?: number;
  roomTransfers: RoomTransfer[];
}

export interface CreateAdmissionRequest {
  admissionDate: string;
  reasonForAdmission: string;
  diagnosis?: string;
  notes?: string;
  patientId: number;
  roomId: number;
  bedId: number;
  admittingDoctorId?: number;
  createdByUserId?: number;
}

export interface UpdateAdmissionRequest {
  admissionDate?: string;
  dischargeDate?: string;
  status?: string;
  reasonForAdmission?: string;
  diagnosis?: string;
  notes?: string;
  roomId?: number;
  bedId?: number;
  admittingDoctorId?: number;
  dischargingDoctorId?: number;
}

export interface DischargePatientRequest {
  dischargeDate: string;
  dischargingDoctorId: number;
  dischargeNotes?: string;
}

export interface RoomTransfer {
  id: number;
  transferDate: string;
  reason: string;
  notes?: string;
  createdAt: string;
  createdByUserId?: number;
  createdByUserName?: string;
  admissionId: number;
  fromRoomId: number;
  fromRoomNumber?: string;
  toRoomId: number;
  toRoomNumber?: string;
  fromBedId: number;
  fromBedNumber?: string;
  toBedId: number;
  toBedNumber?: string;
  transferredByDoctorId?: number;
  transferredByDoctorName?: string;
  patientId?: number;
  patientName?: string;
}

export interface CreateRoomTransferRequest {
  transferDate: string;
  reason: string;
  notes?: string;
  admissionId: number;
  toRoomId: number;
  toBedId: number;
  transferredByDoctorId?: number;
  createdByUserId?: number;
}

