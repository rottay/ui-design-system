/**
 * FormBuilder - Pattern Component Types
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps, FieldDef } from '../../types';

export interface FormBuilderProps extends PatternBaseProps {
  /** Field definitions */
  fields: FieldDef[];
  /** Layout mode */
  layout?: 'vertical' | 'horizontal' | 'grid' | 'steps';
  /** Number of columns for grid layout */
  columns?: number;
  /** Custom field renderer */
  renderField?: (field: FieldDef, defaultRender: ReactNode, value: unknown) => ReactNode;
  /** Action buttons slot */
  actions?: ReactNode;
  /** Submit handler */
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  /** Validation change handler */
  onValidationChange?: (errors: Record<string, string>) => void;
  /** Values change handler */
  onChange?: (values: Record<string, unknown>) => void;
  /** Initial values */
  initialValues?: Record<string, unknown>;
  /** Controlled values */
  values?: Record<string, unknown>;
  /** Disabled state */
  disabled?: boolean;
  /** Read only mode */
  readOnly?: boolean;
  /** Show labels */
  showLabels?: boolean;
  /** Show required indicator */
  showRequired?: boolean;
  /** Gap between fields */
  gap?: number | string;
  /** Form title */
  title?: ReactNode;
  /** Form description */
  description?: ReactNode;
  /** Step labels (for steps layout) */
  stepLabels?: string[];
  /** Current step (for steps layout) */
  currentStep?: number;
  /** Step change handler */
  onStepChange?: (step: number) => void;
}
