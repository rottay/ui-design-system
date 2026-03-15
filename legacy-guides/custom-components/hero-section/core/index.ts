/**
 * HeroSection - Core Interface
 * Landing page hero with headline, subheadline, CTA buttons, media area
 */

import type { ReactNode } from 'react';
import type { EngineAwareProps, BaseComponentProps } from '../../../../types';

export type HeroSectionPreset = 'centered' | 'split' | 'gradient';

export interface HeroSectionAction {
  key: string;
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  href?: string;
}

export interface HeroSectionProps extends EngineAwareProps, BaseComponentProps {
  /** Preset to use */
  preset?: HeroSectionPreset;
  /** Hero title */
  title: string;
  /** Optional subtitle (rendered above title) */
  subtitle?: string;
  /** Hero description */
  description?: string;
  /** CTA buttons */
  actions?: HeroSectionAction[];
  /** Media area content (image, video, illustration) */
  media?: ReactNode;
  /** Optional badge text */
  badge?: string;
}

export const HERO_SECTION_DEFAULTS: Partial<HeroSectionProps> = {
  preset: 'centered',
};
