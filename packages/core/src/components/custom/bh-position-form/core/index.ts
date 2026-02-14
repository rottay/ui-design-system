/**
 * BhPositionForm - Core Interface
 * Position creation/edit form for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The form uses DBPosition fields for initial data and submission.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBPosition } from '@rottay/recruiter';

export type BhPositionFormPreset = 'full' | 'compact';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterPosition = DBPosition;

/**
 * Form data shape for position creation/editing.
 * Uses a subset of DBPosition fields relevant to the form.
 */
export interface PositionFormData {
  title: string;
  clientId: string;
  department?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'critical';
  description?: string;
  requirements?: string;
  fillType: 'permanent' | 'contract' | 'contract_to_hire' | 'temporary';
  seniorityLevel: 'intern' | 'entry' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive';
  workMode: 'onsite' | 'hybrid' | 'remote' | 'flexible';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface BhPositionFormProps extends EngineAwareProps {
  preset?: BhPositionFormPreset;

  /** Initial form data for editing - accepts partial DBPosition */
  initialData?: Partial<DBPosition>;

  /** Available clients for dropdown */
  clients?: Array<{ id: string; name: string }>;

  /** Callback when form is submitted */
  onSubmit?: (data: PositionFormData) => void;

  /** Callback when cancel is clicked */
  onCancel?: () => void;

  /** Whether we are editing an existing position */
  isEditing?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_POSITION_FORM_DEFAULTS: Partial<BhPositionFormProps> = {
  preset: 'full',
  isEditing: false,
  loading: false,
  clients: [
    { id: 'cl-1', name: 'Acme Corporation' },
    { id: 'cl-2', name: 'Horizon Labs' },
    { id: 'cl-3', name: 'Nova Ventures' },
    { id: 'cl-4', name: 'Meridian Group' },
  ],
};
