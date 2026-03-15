/**
 * FaqSection - Core Interface
 * FAQ with search and expandable items
 */

import type { EngineAwareProps, BaseComponentProps } from '../../../../types';

export type FaqSectionPreset = 'accordion' | 'two-column';

export interface FaqItem {
  key: string;
  question: string;
  answer: string;
  category?: string;
}

export interface FaqCategory {
  key: string;
  label: string;
}

export interface FaqSectionProps extends EngineAwareProps, BaseComponentProps {
  /** Preset to use */
  preset?: FaqSectionPreset;
  /** List of FAQ items */
  items: FaqItem[];
  /** Optional categories for filtering */
  categories?: FaqCategory[];
  /** Optional section title */
  title?: string;
  /** Optional section description */
  description?: string;
  /** Enable search functionality */
  searchable?: boolean;
}

export const FAQ_SECTION_DEFAULTS: Partial<FaqSectionProps> = {
  preset: 'accordion',
  searchable: false,
};
