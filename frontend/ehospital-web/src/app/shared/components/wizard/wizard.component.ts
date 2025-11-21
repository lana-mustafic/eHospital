import { Component, Input, Output, EventEmitter, OnInit, TemplateRef, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  isValid?: boolean;
  isCompleted?: boolean;
  isOptional?: boolean;
  template?: TemplateRef<any>;
}

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class WizardComponent implements OnInit, AfterContentInit {
  @Input() steps: WizardStep[] = [];
  @Input() currentStepIndex: number = 0;
  @Input() showProgressBar: boolean = true;
  @Input() showStepNumbers: boolean = true;
  @Input() allowStepNavigation: boolean = false;
  @Input() showCancelButton: boolean = true;
  @Input() showBackButton: boolean = true;
  @Input() showNextButton: boolean = true;
  @Input() showFinishButton: boolean = true;
  @Input() nextButtonText: string = 'Next';
  @Input() backButtonText: string = 'Back';
  @Input() finishButtonText: string = 'Finish';
  @Input() cancelButtonText: string = 'Cancel';

  @Output() stepChanged = new EventEmitter<{ previousStep: number; currentStep: number }>();
  @Output() wizardCompleted = new EventEmitter<void>();
  @Output() wizardCancelled = new EventEmitter<void>();
  @Output() stepValidation = new EventEmitter<{ stepIndex: number; isValid: boolean }>();

  @ContentChildren(TemplateRef) stepTemplates!: QueryList<TemplateRef<any>>;

  ngOnInit() {
    this.validateCurrentStep();
  }

  ngAfterContentInit() {
    // Associate templates with steps if provided
    if (this.stepTemplates && this.stepTemplates.length > 0) {
      this.stepTemplates.forEach((template, index) => {
        if (this.steps[index]) {
          this.steps[index].template = template;
        }
      });
    }
  }

  get currentStep(): WizardStep | null {
    return this.steps[this.currentStepIndex] || null;
  }

  get isFirstStep(): boolean {
    return this.currentStepIndex === 0;
  }

  get isLastStep(): boolean {
    return this.currentStepIndex === this.steps.length - 1;
  }

  get progressPercentage(): number {
    if (this.steps.length === 0) return 0;
    return ((this.currentStepIndex + 1) / this.steps.length) * 100;
  }

  get completedStepsCount(): number {
    return this.steps.filter(step => step.isCompleted).length;
  }

  nextStep(): void {
    if (this.canGoNext()) {
      const previousStep = this.currentStepIndex;
      this.markStepAsCompleted(this.currentStepIndex);
      this.currentStepIndex++;
      this.validateCurrentStep();
      this.stepChanged.emit({ previousStep, currentStep: this.currentStepIndex });
    }
  }

  previousStep(): void {
    if (this.canGoBack()) {
      const previousStep = this.currentStepIndex;
      this.currentStepIndex--;
      this.validateCurrentStep();
      this.stepChanged.emit({ previousStep, currentStep: this.currentStepIndex });
    }
  }

  goToStep(stepIndex: number): void {
    if (this.allowStepNavigation && stepIndex >= 0 && stepIndex < this.steps.length) {
      const previousStep = this.currentStepIndex;
      this.currentStepIndex = stepIndex;
      this.validateCurrentStep();
      this.stepChanged.emit({ previousStep, currentStep: this.currentStepIndex });
    }
  }

  finish(): void {
    if (this.canFinish()) {
      this.markStepAsCompleted(this.currentStepIndex);
      this.wizardCompleted.emit();
    }
  }

  cancel(): void {
    this.wizardCancelled.emit();
  }

  canGoNext(): boolean {
    const currentStep = this.currentStep;
    return !this.isLastStep && (currentStep?.isValid !== false);
  }

  canGoBack(): boolean {
    return !this.isFirstStep;
  }

  canFinish(): boolean {
    const currentStep = this.currentStep;
    return this.isLastStep && (currentStep?.isValid !== false);
  }

  private markStepAsCompleted(stepIndex: number): void {
    if (this.steps[stepIndex]) {
      this.steps[stepIndex].isCompleted = true;
    }
  }

  private validateCurrentStep(): void {
    const currentStep = this.currentStep;
    if (currentStep) {
      this.stepValidation.emit({ stepIndex: this.currentStepIndex, isValid: currentStep.isValid !== false });
    }
  }

  getStepClass(step: WizardStep, index: number): string {
    const classes = ['wizard-step'];
    
    if (index === this.currentStepIndex) {
      classes.push('current');
    } else if (step.isCompleted) {
      classes.push('completed');
    } else if (index < this.currentStepIndex) {
      classes.push('previous');
    } else {
      classes.push('upcoming');
    }

    if (step.isValid === false) {
      classes.push('invalid');
    }

    if (step.isOptional) {
      classes.push('optional');
    }

    return classes.join(' ');
  }

  updateStepValidity(stepIndex: number, isValid: boolean): void {
    if (this.steps[stepIndex]) {
      this.steps[stepIndex].isValid = isValid;
    }
  }
}
