/**
 * EvReservationBoard - Main Export
 * Reservations kanban and calendar timeline for table management
 */

import type { EvReservationBoardProps } from './core';
import { EV_RESERVATION_BOARD_DEFAULTS } from './core';
import { EV_RESERVATION_BOARD_PRESETS } from './presets';

export {
  type EvReservationBoardProps,
  type EvReservationBoardPreset,
  type Reservation as EvReservationBoardReservation,
  EV_RESERVATION_BOARD_DEFAULTS,
} from './core';
export * from './presets';

export function EvReservationBoard(props: EvReservationBoardProps): React.ReactElement {
  const preset = props.preset ?? EV_RESERVATION_BOARD_DEFAULTS.preset ?? 'kanban';
  const PresetComponent = EV_RESERVATION_BOARD_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EvReservationBoard.displayName = 'EvReservationBoard';

export { KanbanEvReservationBoard, CalendarEvReservationBoard } from './presets';
