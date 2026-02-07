/**
 * FaqSection Presets
 */

import type { FaqSectionPreset } from '../core';
import { AccordionFaqSection } from './accordion';
import { TwoColumnFaqSection } from './two-column';

export const PRESETS: Record<FaqSectionPreset, React.ComponentType<any>> = {
  accordion: AccordionFaqSection,
  'two-column': TwoColumnFaqSection,
};
