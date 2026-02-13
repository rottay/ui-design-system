/**
 * BhProctoringEventCard - All Presets
 */

import type { BhProctoringEventCardPreset } from '../core';
import { DefaultBhProctoringEventCard } from './default';
import { CompactBhProctoringEventCard } from './compact';

export { DefaultBhProctoringEventCard } from './default';
export { CompactBhProctoringEventCard } from './compact';

export const BH_PROCTORING_EVENT_CARD_PRESETS: Record<BhProctoringEventCardPreset, React.ComponentType<any>> = {
  'default': DefaultBhProctoringEventCard,
  'compact': CompactBhProctoringEventCard,
};
