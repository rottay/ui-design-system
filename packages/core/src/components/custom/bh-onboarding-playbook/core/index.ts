/**
 * BhOnboardingPlaybook - Core Interface
 * Onboarding playbook for new recruiter training on BitHire ATS platform.
 * Guided learning modules with progress tracking and resource management.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhOnboardingPlaybookPreset = 'guided' | 'progress';

// =============================================================================
// PLAYBOOK DATA TYPES
// =============================================================================

/**
 * A resource within a playbook step.
 */
export interface PlaybookResource {
  title: string;
  type: 'link' | 'document' | 'video';
  url: string;
}

/**
 * A step within a playbook module.
 */
export interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'reading' | 'task' | 'quiz' | 'practice';
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: Date;
  resources: PlaybookResource[];
}

/**
 * A module within the playbook.
 */
export interface PlaybookModule {
  id: string;
  title: string;
  description: string;
  steps: PlaybookStep[];
  completedSteps: number;
  totalSteps: number;
  order: number;
}

/**
 * Complete onboarding data for a recruiter.
 */
export interface OnboardingData {
  recruiterId: string;
  recruiterName: string;
  modules: PlaybookModule[];
  overallProgress: number;
  startedAt: Date;
  estimatedCompletion?: Date;
  mentorName?: string;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhOnboardingPlaybookProps extends EngineAwareProps {
  preset?: BhOnboardingPlaybookPreset;

  /** Onboarding data */
  data?: OnboardingData;

  /** Whether data is loading */
  loading?: boolean;

  /** Callback when a step is completed */
  onCompleteStep?: (stepId: string) => void;

  /** Callback when a step is started */
  onStartStep?: (stepId: string) => void;

  /** Callback when a resource is viewed */
  onViewResource?: (resourceUrl: string) => void;

  /** Currently active step ID */
  currentStepId?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_ONBOARDING_PLAYBOOK_DEFAULTS: Partial<BhOnboardingPlaybookProps> = {
  preset: 'guided',
};
