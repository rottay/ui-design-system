/**
 * BhPositionForm - Core Interface
 * Position creation/edit form for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhPositionFormPreset = 'full' | 'compact';

export interface PositionFormData {
  title: string;
  clientId: string;
  department: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  requirements: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface BhPositionFormProps extends EngineAwareProps {
  preset?: BhPositionFormPreset;

  /** Initial form data for editing */
  initialData?: Partial<PositionFormData>;

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
