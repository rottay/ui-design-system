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
