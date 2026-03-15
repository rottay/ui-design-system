/**
 * EvEventBoard - Main Export
 * Event listing board with multi-view
 * Automatically selects preset based on props
 */

import type { EvEventBoardProps } from './core';
import { EV_EVENT_BOARD_DEFAULTS } from './core';
import { EV_EVENT_BOARD_PRESETS } from './presets';

export {
  type EvEventBoardProps,
  type EvEventBoardPreset,
  type EventCard as EvEventBoardEventCard,
  type EventFilter as EvEventBoardEventFilter,
  EV_EVENT_BOARD_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvEventBoard component
 * Renders the appropriate preset based on the preset prop
 */
export function EvEventBoard(props: EvEventBoardProps): React.ReactElement {
  const preset = props.preset ?? EV_EVENT_BOARD_DEFAULTS.preset ?? 'grid';
  const PresetComponent = EV_EVENT_BOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvEventBoard.displayName = 'EvEventBoard';

export { GridEvEventBoard, TableEvEventBoard } from './presets';
