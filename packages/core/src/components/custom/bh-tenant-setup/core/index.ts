/**
 * BhTenantSetup - Core Interface
 * Tenant Onboarding wizard for BitHire ATS platform
 */

/**
 * BhTenantSetup - Core Interface
 * DB Reference: DBTeam from @rottay/recruiter
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import type { DBTeam } from '@rottay/recruiter';

export type BhTenantSetupPreset = 'full' | 'quick';

/** Re-export for consumer convenience */
export type { DBTeam };

export interface SetupStep {
  key: string;
  label: string;
  description?: string;
  isComplete: boolean;
  isActive: boolean;
}

export type BillingMode = 'token_pool' | 'byoc';

export interface ProviderTestResult {
  provider: string;
  status: 'success' | 'failure' | 'testing';
  latencyMs?: number;
  error?: string;
}

export interface TeamSetup {
  name: string;
  specializations: string[];
  capacity: number;
}

export interface InvitationItem {
  email: string;
  role: string;
  message?: string;
}

export interface TenantFormData {
  orgName: string;
  logo?: string;
  industry: string;
  size: string;
  timezone: string;
  billingMode: BillingMode;
  providerConfig: {
    provider: string;
    apiKey: string;
  };
  teams: TeamSetup[];
  invitations: InvitationItem[];
}

export interface BhTenantSetupProps extends EngineAwareProps {
  preset?: BhTenantSetupPreset;

  /** Step definitions */
  steps: SetupStep[];

  /** Current active step index */
  currentStep: number;

  /** Step change callback */
  onStepChange?: (step: number) => void;

  /** Form data for all steps */
  formData: TenantFormData;

  /** Form data change callback */
  onChange?: (data: Partial<TenantFormData>) => void;

  /** AI provider connectivity test result */
  providerTestResult?: ProviderTestResult;

  /** Test AI provider connectivity */
  onTestProvider?: () => void;

  /** Complete setup callback */
  onComplete?: () => void;

  /** Skip step callback */
  onSkip?: () => void;

  /** Whether setup is fully complete */
  isComplete: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_TENANT_SETUP_DEFAULTS: Partial<BhTenantSetupProps> = {
  preset: 'full',
};

/**
 * Default step definitions for the full setup flow
 */
export function getDefaultSetupSteps(): SetupStep[] {
  return [
    { key: 'organization', label: 'Organization', description: 'Company details and branding', isComplete: false, isActive: true },
    { key: 'billing', label: 'Billing', description: 'Choose your billing model', isComplete: false, isActive: false },
    { key: 'ai-provider', label: 'AI Provider', description: 'Connect your AI service', isComplete: false, isActive: false },
    { key: 'teams', label: 'Teams', description: 'Create your hiring teams', isComplete: false, isActive: false },
    { key: 'invitations', label: 'Invitations', description: 'Invite your team members', isComplete: false, isActive: false },
    { key: 'first-job', label: 'First Job', description: 'Create your first job posting', isComplete: false, isActive: false },
  ];
}

/**
 * Industry options for the org setup form
 */
export function getIndustryOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail & E-Commerce' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'media', label: 'Media & Entertainment' },
    { value: 'legal', label: 'Legal' },
    { value: 'other', label: 'Other' },
  ];
}

/**
 * Company size options
 */
export function getSizeOptions(): Array<{ value: string; label: string }> {
  return [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-1000', label: '201-1,000 employees' },
    { value: '1001-5000', label: '1,001-5,000 employees' },
    { value: '5001+', label: '5,001+ employees' },
  ];
}

/**
 * Timezone options
 */
export function getTimezoneOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'GMT (London)' },
    { value: 'Europe/Berlin', label: 'CET (Berlin)' },
    { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
    { value: 'Asia/Shanghai', label: 'CST (Shanghai)' },
    { value: 'Australia/Sydney', label: 'AEST (Sydney)' },
  ];
}

/**
 * Available role options for invitations
 */
export function getRoleOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'admin', label: 'Admin' },
    { value: 'recruiter', label: 'Recruiter' },
    { value: 'hiring-manager', label: 'Hiring Manager' },
    { value: 'interviewer', label: 'Interviewer' },
    { value: 'viewer', label: 'Viewer' },
  ];
}
