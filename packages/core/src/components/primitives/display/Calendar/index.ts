'use client';

/**
 * @fileoverview Calendar - Rottay Design System
 * @description Date and month selection component with panel navigation.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * **Multi-Engine Architecture:**
 * - **Classic**: Ant Design Calendar with dayjs integration
 * - **Modern**: DaisyUI/Tailwind calendar with responsive design
 * - **Rustic**: Pure CSS calendar with maximum accessibility
 *
 * **Key Features:**
 * - Month and year view modes
 * - Date selection with validation
 * - Custom cell rendering
 * - Date range restrictions
 * - Disabled date support
 * - Fullscreen and compact modes
 * - Panel navigation controls
 * - Localization support
 *
 * **Controlled/Uncontrolled:**
 * - Controlled mode with value/onChange
 * - Uncontrolled mode with defaultValue
 * - Mode control with mode/onPanelChange
 *
 * @example Basic Usage
 * ```tsx
 * import { Calendar } from '@rottay/design-system';
 *
 * <Calendar
 *   defaultValue={new Date()}
 *   onChange={(date) => console.log('Selected:', date)}
 * />
 * ```
 *
 * @example With Custom Cell Render
 * ```tsx
 * <Calendar
 *   dateCellRender={(date) => (
 *     <Badge count={getEventsCount(date)} />
 *   )}
 *   fullscreen={true}
 * />
 * ```
 *
 * @example With Date Range Restriction
 * ```tsx
 * <Calendar
 *   validRange={[startDate, endDate]}
 *   disabledDate={(date) => date.getDay() === 0}
 * />
 * ```
 *
 * @see {@link CalendarProps} for available props
 * @see {@link CalendarMode} for view modes
 * @module Calendar
 * @category Display
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { CalendarProps } from './types';

export {
  type CalendarProps,
  type CalendarMode,
  type CalendarHeaderRenderProps,
  CALENDAR_DEFAULTS,
} from './types';

export const Calendar = createEngineComponent<CalendarProps>('Calendar', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});
