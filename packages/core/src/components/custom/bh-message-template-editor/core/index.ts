/**
 * BhMessageTemplateEditor - Core Interface
 * Template creation/edit with variable highlighting for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhMessageTemplateEditorPreset = 'editor' | 'compact';

export interface TemplateVariable {
  key: string;
  label: string;
  defaultValue: string;
}

export interface BhMessageTemplateEditorProps extends EngineAwareProps {
  preset?: BhMessageTemplateEditorPreset;

  /** Template name */
  templateName?: string;

  /** Email subject line */
  subject?: string;

  /** Email body content */
  body?: string;

  /** Available template variables */
  variables?: TemplateVariable[];

  /** Template category */
  category?: string;

  /** Callback when name changes */
  onNameChange?: (name: string) => void;

  /** Callback when subject changes */
  onSubjectChange?: (s: string) => void;

  /** Callback when body changes */
  onBodyChange?: (body: string) => void;

  /** Callback to save template */
  onSave?: () => void;

  /** Callback to cancel editing */
  onCancel?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_MESSAGE_TEMPLATE_EDITOR_DEFAULTS: Partial<BhMessageTemplateEditorProps> = {
  preset: 'editor',
};
