/**
 * @fileoverview Calendar Types - Rottay Design System
 * @description Type definitions for the Calendar component and its configurations.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module re-exports type definitions from the centralized types directory
 * for the Calendar component.
 *
 * **Exported Types:**
 * - `CalendarProps` - Main component properties
 * - `CalendarMode` - View mode ('month' | 'year')
 * - `CalendarCellInfo` - Cell render info
 * - `CalendarHeaderRenderProps` - Header render props
 * - `CalendarSelectInfo` - Selection event info
 * - `CalendarLocale` - Localization configuration
 *
 * **Exported Constants:**
 * - `CALENDAR_DEFAULTS` - Default prop values
 * - `CALENDAR_DAYS` - Day name array
 * - `CALENDAR_MONTHS` - Month name array
 *
 * @example Type Usage
 * ```tsx
 * import type { CalendarProps, CalendarMode } from '@rottay/design-system';
 *
 * const mode: CalendarMode = 'month';
 *
 * const props: CalendarProps = {
 *   value: new Date(),
 *   mode,
 *   onChange: (date) => console.log(date),
 * };
 * ```
 *
 * @see {@link Calendar} for component implementation
 * @module Calendar/types
 * @category Display
 * @package @rottay/design-system
 */

export type {
  CalendarMode,
  CalendarCellInfo,
  CalendarHeaderRenderProps,
  CalendarSelectInfo,
  CalendarLocale,
  CalendarProps,
} from '../../../../core/types/primitives/display/Calendar';

export { CALENDAR_DEFAULTS, CALENDAR_DAYS, CALENDAR_MONTHS } from '../../../../core/types/primitives/display/Calendar';
