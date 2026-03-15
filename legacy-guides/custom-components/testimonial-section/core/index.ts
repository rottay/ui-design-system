/**
 * TestimonialSection - Core Interface
 * Customer testimonials with avatar, name, role, rating, quote
 */

import type { ReactNode } from 'react';
import type { EngineAwareProps, BaseComponentProps } from '../../../../types';

export type TestimonialSectionPreset = 'cards' | 'carousel' | 'wall';

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: ReactNode;
  rating?: 1 | 2 | 3 | 4 | 5;
}

export interface TestimonialSectionProps extends EngineAwareProps, BaseComponentProps {
  /** Preset to use */
  preset?: TestimonialSectionPreset;
  /** List of testimonials */
  testimonials: Testimonial[];
  /** Optional section title */
  title?: string;
  /** Optional section description */
  description?: string;
}

export const TESTIMONIAL_SECTION_DEFAULTS: Partial<TestimonialSectionProps> = {
  preset: 'cards',
};
