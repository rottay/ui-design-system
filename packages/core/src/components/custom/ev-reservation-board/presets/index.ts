/**
 * EvReservationBoard - All Presets
 */

export { KanbanEvReservationBoard } from './kanban';
export { CalendarEvReservationBoard } from './calendar';

import type { EvReservationBoardPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvReservationBoardProps } from '../core';
import { KanbanEvReservationBoard } from './kanban';
import { CalendarEvReservationBoard } from './calendar';

export const EV_RESERVATION_BOARD_PRESETS: Record<EvReservationBoardPreset, ComponentType<EvReservationBoardProps>> = {
  kanban: KanbanEvReservationBoard,
  calendar: CalendarEvReservationBoard,
};
