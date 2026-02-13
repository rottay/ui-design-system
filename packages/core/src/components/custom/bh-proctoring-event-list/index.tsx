/**
 * BhProctoringEventList - Main Export
 * DataTable-style list of proctoring events with severity badges,
 * type icons, candidate names, and review status.
 */

import type { BhProctoringEventListProps } from './core';
import { BH_PROCTORING_EVENT_LIST_DEFAULTS } from './core';
import { BH_PROCTORING_EVENT_LIST_PRESETS } from './presets';

export {
  type BhProctoringEventListProps,
  type BhProctoringEventListPreset,
  type ProctoringEventType,
  type ProctoringEventSeverity,
  type ProctoringEventItem,
  BH_PROCTORING_EVENT_LIST_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhProctoringEventList component
 * Renders the appropriate preset based on the preset prop
 */
export function BhProctoringEventList(props: BhProctoringEventListProps): React.ReactElement {
  const preset = props.preset ?? BH_PROCTORING_EVENT_LIST_DEFAULTS.preset ?? 'table';
  const PresetComponent = BH_PROCTORING_EVENT_LIST_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhProctoringEventList.displayName = 'BhProctoringEventList';

export { TableBhProctoringEventList, CardsBhProctoringEventList } from './presets';
