import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  isValid: boolean;
  isCompleted: boolean;
  template?: TemplateRef<any>;
}

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class WizardComponent {
  @Input() steps: WizardStep[] = [];
  @Input() showProgress = true;
  @Input() allowStepNavigation = true;
  @Output() wizardCompleted = new EventEmitter<any>();
  @Output() wizardCancelled = new EventEmitter<void>();
  @Output() stepChanged = new EventEmitter<{ currentStep: number; step: WizardStep }>();

  currentStepIndex = 0;

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
    return Math.round(((this.currentStepIndex + 1) / this.steps.length) * 100);
  }

  goToStep(index: number): void {
    if (!this.allowStepNavigation) return;
    
    if (index >= 0 && index < this.steps.length) {
      // Check if we can navigate to this step (all previous steps should be completed)
      const canNavigate = this.steps.slice(0, index).every(step => step.isCompleted);
      
      if (canNavigate || index < this.currentStepIndex) {
        this.currentStepIndex = index;
        this.stepChanged.emit({ 
          currentStep: this.currentStepIndex, 
          step: this.currentStep! 
        });
      }
    }
  }

  nextStep(): void {
    if (this.currentStepIndex < this.steps.length - 1 && this.currentStep?.isValid) {
      this.steps[this.currentStepIndex].isCompleted = true;
      this.currentStepIndex++;
      this.stepChanged.emit({ 
        currentStep: this.currentStepIndex, 
        step: this.currentStep! 
      });
    }
  }

  prevStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.stepChanged.emit({ 
        currentStep: this.currentStepIndex, 
        step: this.currentStep! 
      });
    }
  }

  finishWizard(): void {
    if (this.currentStep?.isValid) {
      this.steps[this.currentStepIndex].isCompleted = true;
      this.wizardCompleted.emit(this.getWizardData());
    }
  }

  cancelWizard(): void {
    this.wizardCancelled.emit();
  }

  private getWizardData(): any {
    return {
      steps: this.steps,
      completedSteps: this.steps.filter(step => step.isCompleted).length,
      totalSteps: this.steps.length
    };
  }

  getStepStatusClass(step: WizardStep, index: number): string {
    if (step.isCompleted) return 'completed';
    if (index === this.currentStepIndex) return 'active';
    if (index < this.currentStepIndex) return 'visited';
    return 'pending';
  }

  canNavigateToStep(index: number): boolean {
    if (!this.allowStepNavigation) return false;
    
    // Can always go back to previous steps
    if (index < this.currentStepIndex) return true;
    
    // Can go to next step if current is valid
    if (index === this.currentStepIndex + 1 && this.currentStep?.isValid) return true;
    
    // Can go to any completed step
    return this.steps[index]?.isCompleted || false;
  }

  trackByStepId(index: number, step: WizardStep): string {
    return step.id;
  }
}
