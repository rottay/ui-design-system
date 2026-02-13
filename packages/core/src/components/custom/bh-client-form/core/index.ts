/**
 * BhClientForm - Core Interface
 * Client creation/edit form for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhClientFormPreset = 'full' | 'compact';

export interface ClientFormData {
  name: string;
  tier: 'enterprise' | 'business' | 'starter';
  contactName: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface BhClientFormProps extends EngineAwareProps {
  preset?: BhClientFormPreset;

  /** Initial form data for editing */
  initialData?: Partial<ClientFormData>;

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
