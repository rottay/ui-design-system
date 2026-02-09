/**
 * EvEventDetail - Main Export
 * Detailed event view with stats
 * Automatically selects preset based on props
 */

import type { EvEventDetailProps } from './core';
import { EV_EVENT_DETAIL_DEFAULTS } from './core';
import { EV_EVENT_DETAIL_PRESETS } from './presets';

export {
  type EvEventDetailProps,
  type EvEventDetailPreset,
  type EventInfo as EvEventDetailEventInfo,
  type TicketSalesSummary as EvEventDetailTicketSalesSummary,
  type CheckInProgress as EvEventDetailCheckInProgress,
  EV_EVENT_DETAIL_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvEventDetail component
 * Renders the appropriate preset based on the preset prop
 */
export function EvEventDetail(props: EvEventDetailProps): React.ReactElement {
  const preset = props.preset ?? EV_EVENT_DETAIL_DEFAULTS.preset ?? 'full';
  const PresetComponent = EV_EVENT_DETAIL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvEventDetail.displayName = 'EvEventDetail';

export { FullEvEventDetail, CompactEvEventDetail } from './presets';
