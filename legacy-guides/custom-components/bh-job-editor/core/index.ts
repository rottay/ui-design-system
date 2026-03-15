/**
 * BhJobEditor - Core Interface
 * Job Creation/Editing wizard for BitHire ATS platform
 *
 * DB Reference: DBJob from @rottay/recruiter
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBJob } from '@rottay/recruiter';

export type BhJobEditorPreset = 'wizard' | 'single-page';

/** Re-export for consumer convenience */
export type { DBJob };

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'full_time' | 'part_time' | 'temporary';
export type SeniorityLevel = 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'director' | 'executive' | 'entry' | 'manager';
export type WorkArrangement = 'onsite' | 'remote' | 'hybrid' | 'flexible';

export interface SkillTag {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: 'text' | 'boolean' | 'choice';
  required: boolean;
  options?: string[];
}

export interface JobFormData {
  title: string;
  code: string;
  department: string;
  seniority: SeniorityLevel;
  employmentType: EmploymentType;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  responsibilities: string;
  requirements: string;
  primaryLocation: string;
  secondaryLocation: string;
  workArrangement: WorkArrangement;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  signingBonus: number;
  equity: string;
  benefits: string[];
  skills: SkillTag[];
  experienceMin: number;
  experienceMax: number;
  educationLevel: string;
  screeningQuestions: ScreeningQuestion[];
  visibility: 'public' | 'internal' | 'confidential';
  openings: number;
  templateId: string;
  clientId: string;
  /** Work mode: remote, hybrid, onsite, or flexible */
  workMode?: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  /** List of perks beyond standard benefits */
  perks?: string[];
  /** Timezone requirements for the role */
  timezoneRequirements?: string;
  /** Countries where remote work is allowed */
  remoteCountries?: string[];
  /** Whether the role is eligible for equity compensation */
  equityEligible?: boolean;
  /** Whether the role is eligible for bonus compensation */
  bonusEligible?: boolean;
  /** Bonus percentage of base salary */
  bonusPercentage?: number;
  /** Hiring urgency level from DB */
  hiringUrgency?: 'low' | 'normal' | 'high' | 'urgent';
  /** SEO meta title for the job posting */
  metaTitle?: string;
  /** SEO meta description for the job posting */
  metaDescription?: string;
  /** SEO keywords for the job posting */
  keywords?: string[];
}

export interface JobEditorStep {
  key: string;
  label: string;
  isComplete: boolean;
  isActive: boolean;
  hasErrors: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  step: string;
}

export interface JobTemplate {
  id: string;
  name: string;
  description?: string;
}

export interface JobClient {
  id: string;
  name: string;
  logo?: string;
}

export interface BhJobEditorProps extends EngineAwareProps {
  preset?: BhJobEditorPreset;

  /** Current form data for the job being edited */
  formData?: Partial<JobFormData>;

  /** Step definitions for the wizard */
  steps?: JobEditorStep[];

  /** Current active step key */
  currentStep?: string;

  /** Validation errors */
  validationErrors?: ValidationError[];

  /** Callback when form data changes */
  onChange?: (data: Partial<JobFormData>) => void;

  /** Callback when the active step changes */
  onStepChange?: (stepKey: string) => void;

  /** Callback to save the job as a draft */
  onSave?: (data: Partial<JobFormData>) => void;

  /** Callback to publish the job */
  onPublish?: (data: Partial<JobFormData>) => void;

  /** Callback to preview the job posting */
  onPreview?: (data: Partial<JobFormData>) => void;

  /** Whether the form has unsaved changes */
  isDirty?: boolean;

  /** Available job templates */
  templates?: JobTemplate[];

  /** Available clients for association */
  clients?: JobClient[];

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_JOB_EDITOR_DEFAULTS: Partial<BhJobEditorProps> = {
  preset: 'wizard',
  isDirty: false,
  currentStep: 'basics',
  formData: {
    title: '',
    code: '',
    department: '',
    seniority: 'mid',
    employmentType: 'full-time',
    urgency: 'medium',
    description: '',
    responsibilities: '',
    requirements: '',
    primaryLocation: '',
    secondaryLocation: '',
    workArrangement: 'onsite',
    salaryMin: 0,
    salaryMax: 0,
    currency: 'USD',
    signingBonus: 0,
    equity: '',
    benefits: [],
    skills: [],
    experienceMin: 0,
    experienceMax: 0,
    educationLevel: '',
    screeningQuestions: [],
    visibility: 'public',
    openings: 1,
    templateId: '',
    clientId: '',
  },
};
