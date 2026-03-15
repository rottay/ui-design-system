/**
 * BhProctoringEventCard - All Presets
 */

import type { BhProctoringEventCardPreset, BhProctoringEventCardProps } from '../core';
import type { ComponentType } from 'react';
import { DefaultBhProctoringEventCard } from './default';
import { CompactBhProctoringEventCard } from './compact';

export { DefaultBhProctoringEventCard } from './default';
export { CompactBhProctoringEventCard } from './compact';

export const BH_PROCTORING_EVENT_CARD_PRESETS: Record<BhProctoringEventCardPreset, ComponentType<BhProctoringEventCardProps>> = {
  'default': DefaultBhProctoringEventCard,
  'compact': CompactBhProctoringEventCard,
};
