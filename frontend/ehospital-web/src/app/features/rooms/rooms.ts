import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { RoomService } from './services/room.service';
import { RoomTypeService } from './services/room-type.service';
import { BedService } from './services/bed.service';
import { AdmissionService } from './services/admission.service';
import { RoomTransferService } from './services/room-transfer.service';
import { PatientService } from '../patients/services/patient.service';
import { DoctorService } from '../doctors/services/doctor.service';
import { DepartmentService } from '../departments/services/department.service';
import {
  Room, RoomType, Bed, Admission, RoomTransfer,
  CreateRoomRequest, UpdateRoomRequest,
  CreateRoomTypeRequest, UpdateRoomTypeRequest,
  CreateBedRequest, UpdateBedRequest,
  CreateAdmissionRequest, UpdateAdmissionRequest, DischargePatientRequest,
  CreateRoomTransferRequest, RoomAvailability
} from './models/room.model';
import { Patient } from '../patients/models/patient.model';
import { Doctor } from '../doctors/models/doctor.model';
import { Department } from '../departments/models/department.model';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './rooms.html',
  styleUrls: ['./rooms.scss']
})
export class RoomsComponent implements OnInit {
  activeTab: 'roomTypes' | 'rooms' | 'beds' | 'admissions' | 'transfers' | 'availability' = 'availability';

  // Room Types
  roomTypes: RoomType[] = [];
  filteredRoomTypes: RoomType[] = [];

  // Rooms
  rooms: Room[] = [];
  filteredRooms: Room[] = [];

  // Beds
  beds: Bed[] = [];
  filteredBeds: Bed[] = [];

  // Admissions
  admissions: Admission[] = [];
  filteredAdmissions: Admission[] = [];

  // Transfers
  transfers: RoomTransfer[] = [];
  filteredTransfers: RoomTransfer[] = [];

  // Availability
  availability: RoomAvailability[] = [];

  // Dropdowns
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  departments: Department[] = [];

  isLoading = false;
  searchTerm = '';
  showModal = false;
  isEditMode = false;
  selectedId: number | null = null;

  // Forms
  roomTypeForm: FormGroup;
  roomForm: FormGroup;
  bedForm: FormGroup;
  admissionForm: FormGroup;
  transferForm: FormGroup;
  dischargeForm: FormGroup;

  // Filters
  statusFilter = '';
  roomTypeFilter: number | null = null;
  departmentFilter: number | null = null;
  patientFilter: number | null = null;

  // Selected for operations
  selectedRoom: Room | null = null;
  selectedAdmission: Admission | null = null;
  modalType: 'roomType' | 'room' | 'bed' | 'admission' | 'discharge' | 'transfer' | null = null;

  constructor(
    private roomService: RoomService,
    private roomTypeService: RoomTypeService,
    private bedService: BedService,
    private admissionService: AdmissionService,
    private transferService: RoomTransferService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.roomTypeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      baseRatePerDay: [0, [Validators.required, Validators.min(0)]],
      maxOccupancy: [1, [Validators.required, Validators.min(1)]],
      isActive: [true]
    });

    this.roomForm = this.fb.group({
      roomNumber: ['', Validators.required],
      floor: [1, [Validators.required, Validators.min(1)]],
      building: [''],
      status: ['Available'],
      isActive: [true],
      roomTypeId: ['', Validators.required],
      departmentId: [null]
    });

    this.bedForm = this.fb.group({
      bedNumber: ['', Validators.required],
      status: ['Available'],
      isActive: [true],
      roomId: ['', Validators.required]
    });

    this.admissionForm = this.fb.group({
      patientId: ['', Validators.required],
      roomId: ['', Validators.required],
      bedId: ['', Validators.required],
      admissionDate: [new Date().toISOString().split('T')[0], Validators.required],
      reasonForAdmission: ['', Validators.required],
      diagnosis: [''],
      notes: [''],
      admittingDoctorId: [null]
    });

    this.transferForm = this.fb.group({
      admissionId: ['', Validators.required],
      toRoomId: ['', Validators.required],
      toBedId: ['', Validators.required],
      transferDate: [new Date().toISOString().split('T')[0], Validators.required],
      reason: ['', Validators.required],
      notes: [''],
      transferredByDoctorId: [null]
    });

    this.dischargeForm = this.fb.group({
      dischargeDate: [new Date().toISOString().split('T')[0], Validators.required],
      dischargingDoctorId: ['', Validators.required],
      dischargeNotes: ['']
    });
  }

  ngOnInit(): void {
    this.loadRoomTypes();
    this.loadRooms();
    this.loadBeds();
    this.loadAdmissions();
    this.loadTransfers();
    this.loadAvailability();
    this.loadPatients();
    this.loadDoctors();
    this.loadDepartments();
  }

  // Load data
  loadRoomTypes() {
    this.isLoading = true;
    this.roomTypeService.getAll().subscribe({
      next: (data) => {
        this.roomTypes = data;
        this.filteredRoomTypes = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load room types');
        this.isLoading = false;
      }
    });
  }

  loadRooms() {
    this.isLoading = true;
    this.roomService.getAll().subscribe({
      next: (data) => {
        this.rooms = data;
        this.filteredRooms = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load rooms');
        this.isLoading = false;
      }
    });
  }

  loadBeds() {
    this.isLoading = true;
    this.bedService.getAll().subscribe({
      next: (data) => {
        this.beds = data;
        this.filteredBeds = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load beds');
        this.isLoading = false;
      }
    });
  }

  loadAdmissions() {
    this.isLoading = true;
    this.admissionService.getAll().subscribe({
      next: (data) => {
        this.admissions = data;
        this.filteredAdmissions = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load admissions');
        this.isLoading = false;
      }
    });
  }

  loadTransfers() {
    this.isLoading = true;
    this.transferService.getAll().subscribe({
      next: (data) => {
        this.transfers = data;
        this.filteredTransfers = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load transfers');
        this.isLoading = false;
      }
    });
  }

  loadAvailability() {
    this.isLoading = true;
    this.roomService.getAvailability().subscribe({
      next: (data) => {
        this.availability = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Failed to load availability');
        this.isLoading = false;
      }
    });
  }

  loadPatients() {
    this.patientService.getAll().subscribe({
      next: (data) => {
        this.patients = data;
      },
      error: () => {
        this.toastService.error('Failed to load patients');
      }
    });
  }

  loadDoctors() {
    this.doctorService.getAll().subscribe({
      next: (data) => {
        this.doctors = data;
      },
      error: () => {
        this.toastService.error('Failed to load doctors');
      }
    });
  }

  loadDepartments() {
    this.departmentService.getAll().subscribe({
      next: (data) => {
        this.departments = data;
      },
      error: () => {
        this.toastService.error('Failed to load departments');
      }
    });
  }

  // Room Type CRUD
  openRoomTypeModal(roomType?: RoomType) {
    this.modalType = 'roomType';
    this.isEditMode = !!roomType;
    this.selectedId = roomType?.id || null;
    if (roomType) {
      this.roomTypeForm.patchValue(roomType);
    } else {
      this.roomTypeForm.reset({ isActive: true, maxOccupancy: 1, baseRatePerDay: 0 });
    }
    this.showModal = true;
  }

  saveRoomType() {
    if (this.roomTypeForm.invalid) return;

    const payload = this.roomTypeForm.value;
    if (this.isEditMode && this.selectedId) {
      this.roomTypeService.update(this.selectedId, payload).subscribe({
        next: () => {
          this.toastService.success('Room type updated successfully');
          this.closeModal();
          this.loadRoomTypes();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || 'Operation failed');
        }
      });
    } else {
      this.roomTypeService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Room type created successfully');
          this.closeModal();
          this.loadRoomTypes();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || 'Operation failed');
        }
      });
    }
  }

  deleteRoomType(id: number) {
    if (!confirm('Are you sure you want to delete this room type?')) return;

    this.roomTypeService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Room type deleted successfully');
        this.loadRoomTypes();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Delete failed');
      }
    });
  }

  // Room CRUD
  openRoomModal(room?: Room) {
    this.modalType = 'room';
    this.isEditMode = !!room;
    this.selectedId = room?.id || null;
    if (room) {
      this.roomForm.patchValue({
        ...room,
        roomTypeId: room.roomTypeId,
        departmentId: room.departmentId
      });
    } else {
      this.roomForm.reset({ status: 'Available', isActive: true, floor: 1 });
    }
    this.showModal = true;
  }

  saveRoom() {
    if (this.roomForm.invalid) return;

    const payload = this.roomForm.value;
    if (this.isEditMode && this.selectedId) {
      this.roomService.update(this.selectedId, payload).subscribe({
        next: () => {
          this.toastService.success('Room updated successfully');
          this.closeModal();
          this.loadRooms();
          this.loadAvailability();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || 'Operation failed');
        }
      });
    } else {
      this.roomService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Room created successfully');
          this.closeModal();
          this.loadRooms();
          this.loadAvailability();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || 'Operation failed');
        }
      });
    }
  }

  deleteRoom(id: number) {
    if (!confirm('Are you sure you want to delete this room?')) return;

    this.roomService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Room deleted successfully');
        this.loadRooms();
        this.loadAvailability();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Delete failed');
      }
    });
  }

  // Bed CRUD
  openBedModal(bed?: Bed) {
    this.modalType = 'bed';
    this.isEditMode = !!bed;
    this.selectedId = bed?.id || null;
    if (bed) {
      this.bedForm.patchValue(bed);
    } else {
      this.bedForm.reset({ status: 'Available', isActive: true });
    }
    this.showModal = true;
  }

  saveBed() {
    if (this.bedForm.invalid) return;

    const payload = this.bedForm.value;
    if (this.isEditMode && this.selectedId) {
      this.bedService.update(this.selectedId, payload).subscribe({
        next: () => {
          this.toastService.success('Bed updated successfully');
          this.closeModal();
          this.loadBeds();
          this.loadRooms();
          this.loadAvailability();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || 'Operation failed');
        }
      });
    } else {
      this.bedService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Bed created successfully');
          this.closeModal();
          this.loadBeds();
          this.loadRooms();
          this.loadAvailability();
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message || 'Operation failed');
        }
      });
    }
  }

  deleteBed(id: number) {
    if (!confirm('Are you sure you want to delete this bed?')) return;

    this.bedService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Bed deleted successfully');
        this.loadBeds();
        this.loadRooms();
        this.loadAvailability();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Delete failed');
      }
    });
  }

  // Admission CRUD
  openAdmissionModal(admission?: Admission) {
    this.modalType = 'admission';
    this.isEditMode = !!admission;
    this.selectedId = admission?.id || null;
    this.selectedAdmission = null;
    if (admission) {
      this.admissionForm.patchValue({
        ...admission,
        admissionDate: admission.admissionDate.split('T')[0]
      });
    } else {
      this.admissionForm.reset({
        admissionDate: new Date().toISOString().split('T')[0]
      });
    }
    this.showModal = true;
  }

  saveAdmission() {
    if (this.admissionForm.invalid) return;

    const payload = this.admissionForm.value;
    if (this.isEditMode && this.selectedId) {
      this.admissionService.update(this.selectedId, payload).subscribe({
        next: () => {
          this.toastService.success('Admission updated successfully');
          this.closeModal();
          this.loadAdmissions();
          this.loadRooms();
          this.loadAvailability();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Update failed');
        }
      });
    } else {
      this.admissionService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Patient admitted successfully');
          this.closeModal();
          this.loadAdmissions();
          this.loadRooms();
          this.loadAvailability();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Admission failed');
        }
      });
    }
  }

  openDischargeModal(admission: Admission) {
    this.modalType = 'discharge';
    this.selectedAdmission = admission;
    this.dischargeForm.reset({
      dischargeDate: new Date().toISOString().split('T')[0]
    });
    this.showModal = true;
  }

  dischargePatient() {
    if (this.dischargeForm.invalid || !this.selectedAdmission) return;

    const payload = this.dischargeForm.value;
    this.admissionService.discharge(this.selectedAdmission.id, payload).subscribe({
      next: () => {
        this.toastService.success('Patient discharged successfully');
        this.closeModal();
        this.loadAdmissions();
        this.loadRooms();
        this.loadAvailability();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Discharge failed');
      }
    });
  }

  // Transfer
  openTransferModal(admission: Admission) {
    this.modalType = 'transfer';
    this.selectedAdmission = admission;
    this.transferForm.reset({
      admissionId: admission.id,
      transferDate: new Date().toISOString().split('T')[0]
    });
    this.showModal = true;
  }

  saveTransfer() {
    if (this.transferForm.invalid) return;

    const payload = this.transferForm.value;
    this.transferService.create(payload).subscribe({
      next: () => {
        this.toastService.success('Patient transferred successfully');
        this.closeModal();
        this.loadTransfers();
        this.loadAdmissions();
        this.loadRooms();
        this.loadAvailability();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Transfer failed');
      }
    });
  }

  // Utility
  closeModal() {
    this.showModal = false;
    this.isEditMode = false;
    this.selectedId = null;
    this.selectedRoom = null;
    this.selectedAdmission = null;
    this.modalType = null;
    this.roomTypeForm.reset();
    this.roomForm.reset();
    this.bedForm.reset();
    this.admissionForm.reset();
    this.transferForm.reset();
    this.dischargeForm.reset();
  }

  applyFilters() {
    let filtered = [...this.rooms];
    if (this.statusFilter) {
      filtered = filtered.filter(r => r.status === this.statusFilter);
    }
    if (this.roomTypeFilter) {
      filtered = filtered.filter(r => r.roomTypeId === this.roomTypeFilter);
    }
    if (this.departmentFilter) {
      filtered = filtered.filter(r => r.departmentId === this.departmentFilter);
    }
    this.filteredRooms = filtered;
  }

  onRoomChange(roomId: number) {
    // This method can be used to update bed dropdown if needed
    // The getAvailableBedsForRoom method handles this in the template
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Available': 'status-available',
      'Occupied': 'status-occupied',
      'Partially Occupied': 'status-partial',
      'Maintenance': 'status-maintenance',
      'Reserved': 'status-reserved',
      'Admitted': 'status-admitted',
      'Discharged': 'status-discharged',
      'Transferred': 'status-transferred'
    };
    return statusMap[status] || 'status-default';
  }

  getPatientName(patientId: number): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown';
  }

  getDoctorName(doctorId?: number): string {
    if (!doctorId) return 'N/A';
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown';
  }

  // Filter methods for templates
  filterRoomTypes() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredRoomTypes = this.roomTypes;
      return;
    }
    this.filteredRoomTypes = this.roomTypes.filter(rt => rt.name.toLowerCase().includes(term));
  }

  filterBeds() {
    let filtered = [...this.beds];
    if (this.statusFilter) {
      filtered = filtered.filter(b => b.status === this.statusFilter);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.bedNumber.toLowerCase().includes(term) ||
        b.roomNumber?.toLowerCase().includes(term)
      );
    }
    this.filteredBeds = filtered;
  }

  filterAdmissions() {
    let filtered = [...this.admissions];
    if (this.statusFilter) {
      filtered = filtered.filter(a => a.status === this.statusFilter);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.patientName?.toLowerCase().includes(term) ||
        a.roomNumber?.toLowerCase().includes(term) ||
        a.bedNumber?.toLowerCase().includes(term)
      );
    }
    this.filteredAdmissions = filtered;
  }

  getAvailableRooms(): Room[] {
    return this.rooms.filter(r => r.status === 'Available' || r.status === 'Partially Occupied');
  }

  getAvailableBedsForRoom(roomId: number): Bed[] {
    return this.beds.filter(b => b.roomId === roomId && b.status === 'Available');
  }
}

