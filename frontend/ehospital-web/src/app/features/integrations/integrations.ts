import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IntegrationService } from '../../core/services/integration.service';
import {
  IntegrationConfig,
  IntegrationType,
  IntegrationStatus,
  LabSystemConfig,
  InsurancePortalConfig,
  PaymentGatewayConfig,
  PaymentProvider,
  EmailServiceConfig,
  EmailProvider,
  SMSServiceConfig,
  SMSProvider
} from '../../core/models/integration.model';
import { ToastService } from '../../core/services/toast.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './integrations.html',
  styleUrls: ['./integrations.scss']
})
export class IntegrationsComponent implements OnInit {
  integrations: IntegrationConfig[] = [];
  selectedIntegration: IntegrationConfig | null = null;
  showConfigModal = false;
  configForm: FormGroup;
  isLoading = false;
  testResult: { success: boolean; message: string } | null = null;

  IntegrationType = IntegrationType;
  IntegrationStatus = IntegrationStatus;
  PaymentProvider = PaymentProvider;
  EmailProvider = EmailProvider;
  SMSProvider = SMSProvider;

  constructor(
    private integrationService: IntegrationService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.configForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadIntegrations();
  }

  loadIntegrations(): void {
    this.isLoading = true;
    this.integrationService.getIntegrations().subscribe({
      next: (integrations) => {
        this.integrations = integrations;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Failed to load integrations');
      }
    });
  }

  openConfigModal(type: IntegrationType): void {
    const existing = this.integrations.find(i => i.type === type);
    this.selectedIntegration = existing || this.createDefaultConfig(type);
    this.buildConfigForm(this.selectedIntegration);
    this.showConfigModal = true;
    this.testResult = null;
  }

  closeConfigModal(): void {
    this.showConfigModal = false;
    this.selectedIntegration = null;
    this.configForm = this.fb.group({});
    this.testResult = null;
  }

  createDefaultConfig(type: IntegrationType): IntegrationConfig {
    const base = {
      id: '',
      type,
      name: '',
      enabled: false,
      status: IntegrationStatus.CONFIGURING,
      settings: {}
    };

    switch (type) {
      case IntegrationType.LAB_SYSTEM:
        return {
          ...base,
          name: 'Lab System',
          settings: {
            endpoint: '',
            protocol: 'FHIR',
            fhirVersion: 'R4',
            facilityId: '',
            sendingApplication: 'EHOSPITAL',
            sendingFacility: '',
            receivingApplication: '',
            receivingFacility: ''
          }
        } as LabSystemConfig;

      case IntegrationType.INSURANCE_PORTAL:
        return {
          ...base,
          name: 'Insurance Portal',
          settings: {
            providerId: '',
            apiEndpoint: '',
            apiKey: '',
            apiSecret: '',
            supportedInsurances: [],
            eligibilityCheckEnabled: true,
            claimSubmissionEnabled: true,
            preAuthorizationEnabled: false
          }
        } as InsurancePortalConfig;

      case IntegrationType.PAYMENT_GATEWAY:
        return {
          ...base,
          name: 'Payment Gateway',
          settings: {
            provider: PaymentProvider.STRIPE,
            merchantId: '',
            apiKey: '',
            apiSecret: '',
            environment: 'sandbox',
            supportedMethods: ['CREDIT_CARD', 'DEBIT_CARD']
          }
        } as PaymentGatewayConfig;

      case IntegrationType.EMAIL_SERVICE:
        return {
          ...base,
          name: 'Email Service',
          settings: {
            provider: EmailProvider.SENDGRID,
            apiKey: '',
            fromEmail: '',
            fromName: 'eHospital',
            useTLS: true
          }
        } as EmailServiceConfig;

      case IntegrationType.SMS_SERVICE:
        return {
          ...base,
          name: 'SMS Service',
          settings: {
            provider: SMSProvider.TWILIO,
            apiKey: '',
            fromNumber: ''
          }
        } as SMSServiceConfig;

      default:
        return base;
    }
  }

  buildConfigForm(config: IntegrationConfig): void {
    const formControls: { [key: string]: any } = {
      name: [config.name, Validators.required],
      enabled: [config.enabled]
    };

    // Add type-specific settings
    Object.keys(config.settings).forEach(key => {
      formControls[`settings.${key}`] = [config.settings[key], Validators.required];
    });

    this.configForm = this.fb.group(formControls);
  }

  saveConfiguration(): void {
    if (this.configForm.invalid || !this.selectedIntegration) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    const formValue = this.configForm.value;
    const updatedConfig: IntegrationConfig = {
      ...this.selectedIntegration,
      name: formValue.name,
      enabled: formValue.enabled,
      settings: {}
    };

    // Reconstruct settings object
    Object.keys(formValue).forEach(key => {
      if (key.startsWith('settings.')) {
        const settingKey = key.replace('settings.', '');
        updatedConfig.settings[settingKey] = formValue[key];
      }
    });

    this.isLoading = true;
    const operation = updatedConfig.id
      ? this.integrationService.updateIntegration(updatedConfig.id, updatedConfig)
      : this.integrationService.createIntegration(updatedConfig);

    operation.subscribe({
      next: () => {
        this.toastService.success('Integration configuration saved');
        this.loadIntegrations();
        this.closeConfigModal();
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Failed to save configuration');
      }
    });
  }

  testConnection(): void {
    if (!this.selectedIntegration?.id) {
      this.toastService.error('Please save the configuration first');
      return;
    }

    this.isLoading = true;
    this.integrationService.testIntegration(this.selectedIntegration.id).subscribe({
      next: (result) => {
        this.testResult = result;
        this.isLoading = false;
        if (result.success) {
          this.toastService.success('Connection test successful');
        } else {
          this.toastService.error(result.message || 'Connection test failed');
        }
      },
      error: () => {
        this.isLoading = false;
        this.testResult = { success: false, message: 'Connection test failed' };
        this.toastService.error('Connection test failed');
      }
    });
  }

  toggleIntegration(integration: IntegrationConfig): void {
    const updated = { ...integration, enabled: !integration.enabled };
    this.integrationService.updateIntegration(integration.id, updated).subscribe({
      next: () => {
        this.toastService.success(`Integration ${updated.enabled ? 'enabled' : 'disabled'}`);
        this.loadIntegrations();
      },
      error: () => {
        this.toastService.error('Failed to update integration');
      }
    });
  }

  deleteIntegration(integration: IntegrationConfig): void {
    if (!confirm(`Are you sure you want to delete ${integration.name}?`)) {
      return;
    }

    this.integrationService.deleteIntegration(integration.id).subscribe({
      next: () => {
        this.toastService.success('Integration deleted');
        this.loadIntegrations();
      },
      error: () => {
        this.toastService.error('Failed to delete integration');
      }
    });
  }

  getStatusClass(status: IntegrationStatus): string {
    const classes: { [key: string]: string } = {
      [IntegrationStatus.ACTIVE]: 'status-active',
      [IntegrationStatus.INACTIVE]: 'status-inactive',
      [IntegrationStatus.ERROR]: 'status-error',
      [IntegrationStatus.CONFIGURING]: 'status-configuring'
    };
    return classes[status] || '';
  }

  getIntegrationTypeLabel(type: IntegrationType): string {
    const labels: { [key: string]: string } = {
      [IntegrationType.LAB_SYSTEM]: 'Lab System (HL7/FHIR)',
      [IntegrationType.INSURANCE_PORTAL]: 'Insurance Portal',
      [IntegrationType.PAYMENT_GATEWAY]: 'Payment Gateway',
      [IntegrationType.EMAIL_SERVICE]: 'Email Service',
      [IntegrationType.SMS_SERVICE]: 'SMS Service'
    };
    return labels[type] || type;
  }

  getIntegrationByType(type: IntegrationType): IntegrationConfig | undefined {
    return this.integrations.find(i => i.type === type);
  }
}

