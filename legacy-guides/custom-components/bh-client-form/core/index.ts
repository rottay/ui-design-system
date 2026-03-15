/**
 * BhClientForm - Core Interface
 * Client creation/edit form for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The form uses DBClient fields for initial data and submission.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBClient } from '@rottay/recruiter';

export type BhClientFormPreset = 'full' | 'compact';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterClient = DBClient;

/**
 * Form data shape for client creation/editing.
 * Uses a subset of DBClient fields relevant to the form.
 */
export interface ClientFormData {
  displayName: string;
  type: 'individual' | 'company';
  tier: 'standard' | 'premium' | 'enterprise' | 'strategic';
  industry?: string;
  clientCompanyName?: string;
  firstName?: string;
  lastName?: string;
  personalEmail?: string;
  personalPhone?: string;
  description?: string;

  /** Legal registered name of the company */
  legalName?: string;

  /** Tax identification number */
  taxId?: string;

  /** Company website URL */
  websiteUrl?: string;

  /** Number of employees at the company */
  employeeCount?: number;

  /** Contract type (e.g. contingency, retained, exclusive, hybrid) */
  contractType?: string;

  /** Contract start date (ISO 8601) */
  contractStartDate?: string;

  /** Contract end date (ISO 8601) */
  contractEndDate?: string;

  /** External contract reference number */
  contractReference?: string;

  /** Billing frequency (e.g. per_hire, monthly, quarterly, annual) */
  billingFrequency?: string;

  /** Payment terms in days */
  paymentTermsDays?: number;

  /** Credit limit for the client */
  creditLimit?: number;

  /** Email address for billing correspondence */
  billingEmail?: string;

  /** Primary recruiter assigned to this client */
  primaryRecruiterId?: string;

  /** Tags for categorization */
  tags?: string[];
}

export interface BhClientFormProps extends EngineAwareProps {
  preset?: BhClientFormPreset;

  /** Initial form data for editing - accepts partial DBClient */
  initialData?: Partial<DBClient>;

  /** Callback when form is submitted */
  onSubmit?: (data: ClientFormData) => void;

  /** Callback when cancel is clicked */
  onCancel?: () => void;

  /** Whether we are editing an existing client */
  isEditing?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CLIENT_FORM_DEFAULTS: Partial<BhClientFormProps> = {
  preset: 'full',
  isEditing: false,
  loading: false,
};
