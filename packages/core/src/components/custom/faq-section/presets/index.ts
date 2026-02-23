/**
 * FaqSection Presets
 */

import type { FaqSectionPreset, FaqSectionProps } from '../core';
import type { ComponentType } from 'react';
import { AccordionFaqSection } from './accordion';
import { TwoColumnFaqSection } from './two-column';

export const PRESETS: Record<FaqSectionPreset, ComponentType<FaqSectionProps>> = {
  accordion: AccordionFaqSection,
  'two-column': TwoColumnFaqSection,
};
