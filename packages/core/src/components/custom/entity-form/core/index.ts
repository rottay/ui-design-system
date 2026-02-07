import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EntityFormPreset = 'standard' | 'card';

export type FormFieldType = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'toggle' | 'avatar';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldConfig {
  key: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: FormFieldOption[];
  section?: string;
  helpText?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternMessage?: string;
  };
  hidden?: boolean;
  colSpan?: 1 | 2;
}

export interface FormSection {
  key: string;
  title: string;
  description?: string;
  icon?: ReactNode;
}

export interface EntityFormProps extends EngineAwareProps {
  preset?: EntityFormPreset;
  fields: FormFieldConfig[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  sections?: FormSection[];
  errors?: Record<string, string>;
  readOnly?: boolean;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  mode?: 'create' | 'edit';
  title?: string;
  description?: string;
  className?: string;
  style?: CSSProperties;
}

export const ENTITY_FORM_DEFAULTS: Partial<EntityFormProps> = {
  preset: 'standard',
  submitLabel: 'Save',
  cancelLabel: 'Cancel',
  mode: 'create',
};
