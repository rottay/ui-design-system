/**
 * PlTenantOnboarding - Core Interface
 * Multi-step onboarding wizard for guiding new tenants through platform setup
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

// ─── Preset Type ──────────────────────────────────────────────────────────

export type PlTenantOnboardingPreset = 'wizard' | 'stepper';

// ─── Step Status ──────────────────────────────────────────────────────────

/** Status of an individual onboarding step */
export type StepStatus = 'completed' | 'current' | 'upcoming' | 'skipped';

// ─── Onboarding Phase ─────────────────────────────────────────────────────

/** High-level phase grouping for onboarding steps */
export type OnboardingPhase = 'setup' | 'configuration' | 'integration' | 'team' | 'launch';

// ─── Onboarding Task ──────────────────────────────────────────────────────

/** A single actionable task within a step */
export interface OnboardingTask {
  /** Unique identifier for the task */
  id: string;
  /** Display label for the task */
  label: string;
  /** Whether the task has been completed */
  completed: boolean;
  /** Whether the task is required to proceed */
  required: boolean;
  /** Optional help/documentation URL */
  helpUrl?: string;
}

// ─── Onboarding Step ──────────────────────────────────────────────────────

/** A full onboarding step containing tasks and metadata */
export interface OnboardingStep {
  /** Unique identifier for the step */
  id: string;
  /** Display title of the step */
  title: string;
  /** Description of what this step accomplishes */
  description: string;
  /** Phase this step belongs to */
  phase: OnboardingPhase;
  /** Current status of the step */
  status: StepStatus;
  /** Tasks within this step */
  tasks: OnboardingTask[];
  /** Estimated minutes to complete this step */
  estimatedMinutes: number;
  /** Optional icon name or ReactNode */
  icon?: ReactNode;
  /** Display order (ascending) */
  order: number;
}

// ─── Onboarding Progress ──────────────────────────────────────────────────

/** Overall onboarding progress summary */
export interface OnboardingProgress {
  /** Total number of steps in the onboarding */
  totalSteps: number;
  /** Number of completed steps */
  completedSteps: number;
  /** Completion percentage (0-100) */
  percentComplete: number;
  /** When the onboarding process was started */
  startedAt: Date;
  /** Estimated completion date/time */
  estimatedCompletion?: Date;
}

// ─── Component Props ──────────────────────────────────────────────────────

export interface PlTenantOnboardingProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlTenantOnboardingPreset;

  /** All onboarding steps to display */
  steps: OnboardingStep[];
  /** Overall progress summary */
  progress?: OnboardingProgress;
  /** Currently active step id */
  currentStepId?: string;

  /** Callback when a step is clicked/selected */
  onStepClick?: (stepId: string) => void;
  /** Callback when a task checkbox is toggled */
  onTaskToggle?: (stepId: string, taskId: string, completed: boolean) => void;
  /** Callback when a step is skipped */
  onSkipStep?: (stepId: string) => void;
  /** Callback when all onboarding is completed */
  onComplete?: () => void;

  /** Loading state */
  loading?: boolean;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

// ─── Defaults ─────────────────────────────────────────────────────────────

export const PL_TENANT_ONBOARDING_DEFAULTS: Partial<PlTenantOnboardingProps> = {
  preset: 'wizard',
};
