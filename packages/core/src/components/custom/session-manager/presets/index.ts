/**
 * SessionManager - All Presets
 */

import type { SessionManagerPreset } from '../core';
import { TableSessionManager } from './table';
import { CardsSessionManager } from './cards';
import { TimelineSessionManager } from './timeline';

export { TableSessionManager } from './table';
export { CardsSessionManager } from './cards';
export { TimelineSessionManager } from './timeline';

export const SESSION_MANAGER_PRESETS: Record<SessionManagerPreset, React.ComponentType<any>> = {
  table: TableSessionManager,
  cards: CardsSessionManager,
  timeline: TimelineSessionManager,
};
