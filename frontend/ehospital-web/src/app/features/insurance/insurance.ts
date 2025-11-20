import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { InsuranceService } from './services/insurance.service';
import { AuthService } from '../../core/services/auth';
import { PatientService } from '../patients/services/patient.service';
import {
  InsuranceProvider,
  PatientInsurance,
  Claim,
  PriorAuthorization,
  ClaimDenial,
  ClaimPayment,
  CreateInsuranceProviderRequest,
  CreatePatientInsuranceRequest,
  VerifyInsuranceRequest,
  CreateClaimRequest,
  SubmitClaimRequest,
  CreateClaimDenialRequest,
  CreateClaimPaymentRequest,
  CreatePriorAuthorizationRequest,
  UpdatePriorAuthorizationRequest
} from './models/insurance.model';

@Component({
  selector: 'app-insurance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './insurance.html',
  styleUrls: ['./insurance.scss']
})
export class InsuranceComponent implements OnInit {
  activeTab: 'providers' | 'patientInsurances' | 'claims' | 'priorAuths' | 'payments' | 'denials' = 'providers';

  // Insurance Providers
  providers: InsuranceProvider[] = [];
  filteredProviders: InsuranceProvider[] = [];
  showProviderModal = false;
  providerForm: FormGroup;
  selectedProvider: InsuranceProvider | null = null;

  // Patient Insurances
  patientInsurances: PatientInsurance[] = [];
  filteredPatientInsurances: PatientInsurance[] = [];
  showPatientInsuranceModal = false;
  patientInsuranceForm: FormGroup;
  selectedPatientInsurance: PatientInsurance | null = null;
  verificationForm: FormGroup;
  showVerificationModal = false;

  // Claims
  claims: Claim[] = [];
  filteredClaims: Claim[] = [];
  showClaimModal = false;
  claimForm: FormGroup;
  selectedClaim: Claim | null = null;
  showSubmitClaimModal = false;
  submitClaimForm: FormGroup;
  showPaymentModal = false;
  paymentForm: FormGroup;
  showDenialModal = false;
  denialForm: FormGroup;

  // Prior Authorizations
  priorAuths: PriorAuthorization[] = [];
  filteredPriorAuths: PriorAuthorization[] = [];
  showPriorAuthModal = false;
  priorAuthForm: FormGroup;
  selectedPriorAuth: PriorAuthorization | null = null;

  // Filters
  providerSearchTerm = '';
  patientInsuranceSearchTerm = '';
  claimStatusFilter = '';
  priorAuthStatusFilter = '';

  // Patients for dropdowns
  patients: any[] = [];

  constructor(
    private insuranceService: InsuranceService,
    private patientService: PatientService,
    private authService: AuthService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.providerForm = this.fb.group({
      name: ['', Validators.required],
      code: [''],
      address: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      phoneNumber: [''],
      email: [''],
      website: [''],
      payerId: [''],
      contactPerson: ['']
    });

    this.patientInsuranceForm = this.fb.group({
      policyNumber: ['', Validators.required],
      groupNumber: [''],
      subscriberId: [''],
      subscriberName: [''],
      effectiveDate: [''],
      expirationDate: [''],
      copayAmount: [''],
      deductible: [''],
      coinsurance: [''],
      coverageType: ['Primary'],
      patientId: [null, Validators.required],
      insuranceProviderId: [null, Validators.required]
    });

    this.verificationForm = this.fb.group({
      verificationNotes: ['']
    });

    this.claimForm = this.fb.group({
      serviceDate: ['', Validators.required],
      invoiceId: [null, Validators.required],
      patientInsuranceId: [null, Validators.required],
      diagnosisCodes: [''],
      procedureCodes: [''],
      notes: ['']
    });

    this.submitClaimForm = this.fb.group({
      notes: ['']
    });

    this.paymentForm = this.fb.group({
      paymentReference: ['', Validators.required],
      paymentDate: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      checkNumber: [''],
      eftReference: [''],
      notes: ['']
    });

    this.denialForm = this.fb.group({
      denialCode: ['', Validators.required],
      denialReason: ['', Validators.required],
      adjustmentCode: [''],
      deniedAmount: [0, [Validators.required, Validators.min(0)]],
      denialDate: ['', Validators.required]
    });

    this.priorAuthForm = this.fb.group({
      serviceType: [''],
      serviceDescription: [''],
      diagnosisCode: [''],
      procedureCode: [''],
      requestedAmount: [0],
      units: [1],
      patientInsuranceId: [null, Validators.required],
      relatedInvoiceId: [null],
      relatedAppointmentId: [null],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadProviders();
    this.loadPatientInsurances();
    this.loadClaims();
    this.loadPriorAuthorizations();
    this.loadPatients();
  }

  // Insurance Providers
  loadProviders(): void {
    this.insuranceService.getAllProviders().subscribe({
      next: (data) => {
        this.providers = data;
        this.filteredProviders = data;
      },
      error: (err: any) => this.toastService.error('Failed to load insurance providers')
    });
  }

  filterProviders(): void {
    const term = this.providerSearchTerm.toLowerCase();
    this.filteredProviders = this.providers.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.code && p.code.toLowerCase().includes(term))
    );
  }

  openProviderModal(provider?: InsuranceProvider): void {
    this.selectedProvider = provider || null;
    if (provider) {
      this.providerForm.patchValue(provider);
    } else {
      this.providerForm.reset();
    }
    this.showProviderModal = true;
  }

  closeProviderModal(): void {
    this.showProviderModal = false;
    this.selectedProvider = null;
    this.providerForm.reset();
  }

  saveProvider(): void {
    if (this.providerForm.invalid) return;

    const payload: CreateInsuranceProviderRequest = this.providerForm.value;
    
    if (this.selectedProvider) {
      this.insuranceService.updateProvider(this.selectedProvider.id, payload).subscribe({
        next: () => {
          this.toastService.success('Insurance provider updated successfully');
          this.closeProviderModal();
          this.loadProviders();
        },
        error: (err: any) => this.toastService.error('Failed to save insurance provider')
      });
    } else {
      this.insuranceService.createProvider(payload).subscribe({
        next: () => {
          this.toastService.success('Insurance provider created successfully');
          this.closeProviderModal();
          this.loadProviders();
        },
        error: (err: any) => this.toastService.error('Failed to save insurance provider')
      });
    }
  }

  deleteProvider(id: number): void {
    if (confirm('Are you sure you want to delete this insurance provider?')) {
      this.insuranceService.deleteProvider(id).subscribe({
        next: () => {
          this.toastService.success('Insurance provider deleted successfully');
          this.loadProviders();
        },
        error: (err: any) => this.toastService.error('Failed to delete insurance provider')
      });
    }
  }

  // Patient Insurances
  loadPatientInsurances(): void {
    this.insuranceService.getAllPatientInsurances().subscribe({
      next: (data) => {
        this.patientInsurances = data;
        this.filteredPatientInsurances = data;
      },
      error: (err: any) => this.toastService.error('Failed to load patient insurances')
    });
  }

  filterPatientInsurances(): void {
    const term = this.patientInsuranceSearchTerm.toLowerCase();
    this.filteredPatientInsurances = this.patientInsurances.filter(pi =>
      pi.policyNumber.toLowerCase().includes(term) ||
      pi.patientName.toLowerCase().includes(term) ||
      pi.insuranceProviderName.toLowerCase().includes(term)
    );
  }

  openPatientInsuranceModal(insurance?: PatientInsurance): void {
    this.selectedPatientInsurance = insurance || null;
    if (insurance) {
      this.patientInsuranceForm.patchValue(insurance);
    } else {
      this.patientInsuranceForm.reset({ coverageType: 'Primary' });
    }
    this.showPatientInsuranceModal = true;
  }

  closePatientInsuranceModal(): void {
    this.showPatientInsuranceModal = false;
    this.selectedPatientInsurance = null;
    this.patientInsuranceForm.reset();
  }

  savePatientInsurance(): void {
    if (this.patientInsuranceForm.invalid) return;

    const payload: CreatePatientInsuranceRequest = this.patientInsuranceForm.value;
    this.insuranceService.createPatientInsurance(payload).subscribe({
      next: () => {
        this.toastService.success('Patient insurance created successfully');
        this.closePatientInsuranceModal();
        this.loadPatientInsurances();
      },
      error: (err: any) => this.toastService.error('Failed to save patient insurance')
    });
  }

  openVerificationModal(insurance: PatientInsurance): void {
    this.selectedPatientInsurance = insurance;
    this.verificationForm.reset();
    this.showVerificationModal = true;
  }

  closeVerificationModal(): void {
    this.showVerificationModal = false;
    this.selectedPatientInsurance = null;
  }

  verifyInsurance(): void {
    if (!this.selectedPatientInsurance) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.toastService.error('User not authenticated');
      return;
    }

    const payload: VerifyInsuranceRequest = {
      verifiedByUserId: Number(currentUser.id),
      verificationNotes: this.verificationForm.value.verificationNotes
    };

    this.insuranceService.verifyInsurance(this.selectedPatientInsurance.id, payload).subscribe({
      next: () => {
        this.toastService.success('Insurance verified successfully');
        this.closeVerificationModal();
        this.loadPatientInsurances();
      },
      error: (err: any) => this.toastService.error('Failed to verify insurance')
    });
  }

  // Claims
  loadClaims(): void {
    this.insuranceService.getAllClaims().subscribe({
      next: (data) => {
        this.claims = data;
        this.filteredClaims = data;
        this.applyClaimFilters();
      },
      error: (err: any) => this.toastService.error('Failed to load claims')
    });
  }

  applyClaimFilters(): void {
    let filtered = [...this.claims];
    if (this.claimStatusFilter) {
      filtered = filtered.filter(c => c.status === this.claimStatusFilter);
    }
    this.filteredClaims = filtered;
  }

  openClaimModal(claim?: Claim): void {
    this.selectedClaim = claim || null;
    if (claim) {
      this.claimForm.patchValue(claim);
    } else {
      this.claimForm.reset();
    }
    this.showClaimModal = true;
  }

  closeClaimModal(): void {
    this.showClaimModal = false;
    this.selectedClaim = null;
    this.claimForm.reset();
  }

  saveClaim(): void {
    if (this.claimForm.invalid) return;

    const payload: CreateClaimRequest = {
      ...this.claimForm.value,
      serviceDate: new Date(this.claimForm.value.serviceDate).toISOString()
    };

    this.insuranceService.createClaim(payload).subscribe({
      next: () => {
        this.toastService.success('Claim created successfully');
        this.closeClaimModal();
        this.loadClaims();
      },
      error: (err: any) => this.toastService.error('Failed to create claim')
    });
  }

  openSubmitClaimModal(claim: Claim): void {
    this.selectedClaim = claim;
    this.submitClaimForm.reset();
    this.showSubmitClaimModal = true;
  }

  closeSubmitClaimModal(): void {
    this.showSubmitClaimModal = false;
    this.selectedClaim = null;
  }

  submitClaim(): void {
    if (!this.selectedClaim) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.toastService.error('User not authenticated');
      return;
    }

    const payload: SubmitClaimRequest = {
      submittedByUserId: Number(currentUser.id),
      notes: this.submitClaimForm.value.notes
    };

    this.insuranceService.submitClaim(this.selectedClaim.id, payload).subscribe({
      next: () => {
        this.toastService.success('Claim submitted successfully');
        this.closeSubmitClaimModal();
        this.loadClaims();
      },
      error: (err: any) => this.toastService.error('Failed to submit claim')
    });
  }

  openPaymentModal(claim: Claim): void {
    this.selectedClaim = claim;
    this.paymentForm.reset({
      paymentDate: new Date().toISOString().split('T')[0]
    });
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedClaim = null;
  }

  postPayment(): void {
    if (this.paymentForm.invalid || !this.selectedClaim) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.toastService.error('User not authenticated');
      return;
    }

    const payload: CreateClaimPaymentRequest = {
      ...this.paymentForm.value,
      paymentDate: new Date(this.paymentForm.value.paymentDate).toISOString(),
      postedByUserId: Number(currentUser.id)
    };

    this.insuranceService.postPayment(this.selectedClaim.id, payload).subscribe({
      next: () => {
        this.toastService.success('Payment posted successfully');
        this.closePaymentModal();
        this.loadClaims();
      },
      error: (err: any) => this.toastService.error('Failed to post payment')
    });
  }

  openDenialModal(claim: Claim): void {
    this.selectedClaim = claim;
    this.denialForm.reset({
      denialDate: new Date().toISOString().split('T')[0],
      deniedAmount: claim.totalCharges - (claim.paidAmount || 0)
    });
    this.showDenialModal = true;
  }

  closeDenialModal(): void {
    this.showDenialModal = false;
    this.selectedClaim = null;
  }

  addDenial(): void {
    if (this.denialForm.invalid || !this.selectedClaim) return;

    const payload: CreateClaimDenialRequest = {
      ...this.denialForm.value,
      denialDate: new Date(this.denialForm.value.denialDate).toISOString()
    };

    this.insuranceService.addDenial(this.selectedClaim.id, payload).subscribe({
      next: () => {
        this.toastService.success('Denial added successfully');
        this.closeDenialModal();
        this.loadClaims();
      },
      error: (err: any) => this.toastService.error('Failed to add denial')
    });
  }

  // Prior Authorizations
  loadPriorAuthorizations(): void {
    this.insuranceService.getAllPriorAuthorizations().subscribe({
      next: (data) => {
        this.priorAuths = data;
        this.filteredPriorAuths = data;
        this.applyPriorAuthFilters();
      },
      error: (err: any) => this.toastService.error('Failed to load prior authorizations')
    });
  }

  applyPriorAuthFilters(): void {
    let filtered = [...this.priorAuths];
    if (this.priorAuthStatusFilter) {
      filtered = filtered.filter(pa => pa.status === this.priorAuthStatusFilter);
    }
    this.filteredPriorAuths = filtered;
  }

  openPriorAuthModal(auth?: PriorAuthorization): void {
    this.selectedPriorAuth = auth || null;
    if (auth) {
      this.priorAuthForm.patchValue(auth);
    } else {
      this.priorAuthForm.reset({ units: 1 });
    }
    this.showPriorAuthModal = true;
  }

  closePriorAuthModal(): void {
    this.showPriorAuthModal = false;
    this.selectedPriorAuth = null;
    this.priorAuthForm.reset();
  }

  savePriorAuth(): void {
    if (this.priorAuthForm.invalid) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.toastService.error('User not authenticated');
      return;
    }

    const payload: CreatePriorAuthorizationRequest = {
      ...this.priorAuthForm.value,
      requestedByUserId: Number(currentUser.id)
    };

    this.insuranceService.createPriorAuthorization(payload).subscribe({
      next: () => {
        this.toastService.success('Prior authorization request created successfully');
        this.closePriorAuthModal();
        this.loadPriorAuthorizations();
      },
      error: (err: any) => this.toastService.error('Failed to create prior authorization')
    });
  }

  updatePriorAuthStatus(auth: PriorAuthorization, status: string, authorizationNumber?: string): void {
    const payload: UpdatePriorAuthorizationRequest = {
      status,
      authorizationNumber
    };

    this.insuranceService.updatePriorAuthorization(auth.id, payload).subscribe({
      next: () => {
        this.toastService.success('Prior authorization updated successfully');
        this.loadPriorAuthorizations();
      },
      error: (err: any) => this.toastService.error('Failed to update prior authorization')
    });
  }

  // Helpers
  loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (data) => {
        this.patients = data;
      },
      error: (err) => console.error('Failed to load patients', err)
    });
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Draft': 'status-info',
      'Submitted': 'status-warning',
      'Accepted': 'status-success',
      'Paid': 'status-success',
      'PartiallyPaid': 'status-warning',
      'Denied': 'status-error',
      'Pending': 'status-warning',
      'Approved': 'status-success',
      'Rejected': 'status-error',
      'Verified': 'status-success',
      'Active': 'status-success',
      'Expired': 'status-error'
    };
    return statusMap[status] || 'status-info';
  }
}

