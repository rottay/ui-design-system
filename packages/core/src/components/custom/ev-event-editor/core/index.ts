/**
 * EvEventEditor - Core Interface
 * Event creation/editing wizard
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvEventEditorPreset = 'wizard' | 'single-page';

export interface EditorStep {
  key: string;
  label: string;
  isComplete: boolean;
  isActive: boolean;
}

export interface EventFormData {
  name: string;
  description: string;
  venueId: string;
  dates: Array<{ date: Date;
  startTime: string;
  endTime: string }>;
  ticketTypes: Array<{ name: string;
  price: number;
  quantity: number }>;
  coverImage?: string;
}

export interface EvEventEditorProps extends EngineAwareProps {
  preset?: EvEventEditorPreset;
  steps?: EditorStep[];
  formData?: Partial<EventFormData>;
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onSave?: (data: EventFormData) => void;
  onPublish?: (data: EventFormData) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_EVENT_EDITOR_DEFAULTS: Partial<EvEventEditorProps> = {
  preset: 'wizard',
  currentStep: 0,
};
