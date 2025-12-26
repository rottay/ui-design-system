/**
 * Calendar - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { CalendarProps } from './types';

export {
  type CalendarProps,
  type CalendarMode,
  type CalendarHeaderRenderProps,
  CALENDAR_DEFAULTS,
} from './types';

export const Calendar = createEngineComponent<CalendarProps>('Calendar', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
