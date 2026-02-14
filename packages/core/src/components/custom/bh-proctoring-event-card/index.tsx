/**
 * BhProctoringEventCard - Main Export
 * Individual event card showing severity badge, event type icon,
 * candidate info, metadata details, timestamp, and review actions.
 */

import type { BhProctoringEventCardProps } from './core';
import { BH_PROCTORING_EVENT_CARD_DEFAULTS } from './core';
import { BH_PROCTORING_EVENT_CARD_PRESETS } from './presets';

export {
  type BhProctoringEventCardProps,
  type BhProctoringEventCardPreset,
  type ProctoringEventType,
  type ProctoringEventSeverity,
  type ProctoringEventCardView,
  type ProctoringEventSelect,
  BH_PROCTORING_EVENT_CARD_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhProctoringEventCard component
 * Renders the appropriate preset based on the preset prop
 */
export function BhProctoringEventCard(props: BhProctoringEventCardProps): React.ReactElement {
  const preset = props.preset ?? BH_PROCTORING_EVENT_CARD_DEFAULTS.preset ?? 'default';
  const PresetComponent = BH_PROCTORING_EVENT_CARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhProctoringEventCard.displayName = 'BhProctoringEventCard';

export { DefaultBhProctoringEventCard, CompactBhProctoringEventCard } from './presets';
