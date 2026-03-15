/**
 * CtaSection - Core Interface
 * Call-to-action section with title, description, and action buttons
 */

import type { ReactNode } from 'react';
import type { EngineAwareProps, BaseComponentProps } from '../../../../types';

export type CtaSectionPreset = 'banner' | 'centered' | 'split';

export interface CtaSectionAction {
  key: string;
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export interface CtaSectionProps extends EngineAwareProps, BaseComponentProps {
  /** Preset to use */
  preset?: CtaSectionPreset;
  /** CTA title */
  title: string;
  /** Optional description */
  description?: string;
  /** Action buttons */
  actions: CtaSectionAction[];
  /** Optional media/graphic area */
  media?: ReactNode;
}

export const CTA_SECTION_DEFAULTS: Partial<CtaSectionProps> = {
  preset: 'banner',
};
