'use client';

/**
 * @fileoverview Calendar - Date/month selection with panel navigation.
 * Supports controlled and uncontrolled modes, custom cell rendering,
 * date range restrictions, and fullscreen/compact layouts.
 *
 * @example
 * ```tsx
 * import { Calendar } from '@rottay/design-system';
 *
 * <Calendar
 *   defaultValue={new Date()}
 *   onChange={(date) => console.log('Selected:', date)}
 *   disabledDate={(date) => date.getDay() === 0}
 * />
 * ```
 *
 * @module Calendar
 * @category Display
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { CalendarProps } from './Calendar.types';

export {
  type CalendarProps,
  type CalendarMode,
  type CalendarHeaderRenderProps,
  CALENDAR_DEFAULTS,
} from './Calendar.types';

/** Calendar -- no compound sub-components; a single engine-routed component. */
export const Calendar = createEngineComponent<CalendarProps>('Calendar', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});
