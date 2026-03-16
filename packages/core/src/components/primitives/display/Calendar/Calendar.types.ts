/**
 * @fileoverview Calendar Types - Rottay Design System
 * @description Type definitions for the Calendar component and its configurations.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides type definitions for the Calendar component.
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

import type { ReactNode } from 'react';
import type { BaseComponentProps } from '../../../../contracts/common';
import type { EngineAwareProps } from '../../../../contracts/engine';

/**
 * Calendar display mode.
 * - 'month': Shows days in a month grid
 * - 'year': Shows months in a year grid
 */
export type CalendarMode = 'month' | 'year';

/**
 * Information provided to cell render functions.
 */
export interface CalendarCellInfo {
  /** The original node rendered by the calendar */
  originNode: ReactNode;
  /** Today's date */
  today: Date;
  /** Type of cell being rendered */
  type: 'date' | 'month';
}

/**
 * Props passed to the header render function.
 */
export interface CalendarHeaderRenderProps {
  /** Current displayed date value */
  value: Date;
  /** Current display mode */
  type: CalendarMode;
  /** Callback to change the displayed date */
  onChange: (date: Date) => void;
  /** Callback to change the display mode */
  onTypeChange: (type: CalendarMode) => void;
}

/**
 * Information provided to onSelect callback.
 */
export interface CalendarSelectInfo {
  /** Source of the selection */
  source: 'year' | 'month' | 'date' | 'customize';
}

/**
 * Locale configuration for Calendar.
 */
export interface CalendarLocale {
  /** Language-specific settings */
  lang?: {
    /** Locale identifier (e.g., 'en', 'es') */
    locale?: string;
    /** Label for month */
    month?: string;
    /** Label for year */
    year?: string;
    /** Label for today */
    today?: string;
    /** Label for month select */
    monthSelect?: string;
    /** Label for year select */
    yearSelect?: string;
  };
  /** Month format string */
  monthFormat?: string;
  /** Whether month appears before year in display */
  monthBeforeYear?: boolean;
}

/**
 * Calendar component props.
 *
 * The Calendar component displays a date picker calendar that supports
 * both month and year view modes. It can be used as a controlled or
 * uncontrolled component.
 */
export interface CalendarProps extends BaseComponentProps, EngineAwareProps {
  /**
   * Currently selected date value.
   * When provided, the component operates in controlled mode.
   */
  value?: Date | string;

  /**
   * Default selected date for uncontrolled mode.
   */
  defaultValue?: Date | string;

  /**
   * Current display mode of the calendar.
   * @default 'month'
   */
  mode?: CalendarMode;

  /**
   * Default display mode for uncontrolled mode.
   * @default 'month'
   */
  defaultMode?: CalendarMode;

  /**
   * Whether to display the calendar in fullscreen mode.
   * @default true
   */
  fullscreen?: boolean;

  /**
   * Valid date range as a tuple of [start, end] dates.
   * Dates outside this range will be disabled.
   */
  validRange?: [Date, Date];

  /**
   * Function to determine if a date should be disabled.
   * @param currentDate - The date to check
   * @returns true if the date should be disabled
   */
  disabledDate?: (currentDate: Date) => boolean;

  /**
   * Custom render function for date cell content.
   * @deprecated Use cellRender instead
   * @param date - The date being rendered
   * @returns Custom content to display in the cell
   */
  dateCellRender?: (date: Date) => ReactNode;

  /**
   * Custom render function for month cell content.
   * @deprecated Use cellRender instead
   * @param date - The first day of the month being rendered
   * @returns Custom content to display in the cell
   */
  monthCellRender?: (date: Date) => ReactNode;

  /**
   * Custom render function for entire date cell.
   * @deprecated Use fullCellRender instead
   * @param date - The date being rendered
   * @returns Custom element to replace the entire cell
   */
  dateFullCellRender?: (date: Date) => ReactNode;

  /**
   * Custom render function for entire month cell.
   * @deprecated Use fullCellRender instead
   * @param date - The first day of the month being rendered
   * @returns Custom element to replace the entire cell
   */
  monthFullCellRender?: (date: Date) => ReactNode;

  /**
   * Custom render function for cell content (new API).
   * @param date - The date being rendered
   * @param info - Additional information about the cell
   * @returns Custom content to display in the cell
   */
  cellRender?: (date: Date, info: CalendarCellInfo) => ReactNode;

  /**
   * Custom render function for entire cell (new API).
   * @param date - The date being rendered
   * @param info - Additional information about the cell
   * @returns Custom element to replace the entire cell
   */
  fullCellRender?: (date: Date, info: CalendarCellInfo) => ReactNode;

  /**
   * Custom render function for the calendar header.
   * @param props - Header render props with current state and callbacks
   * @returns Custom header element
   */
  headerRender?: (props: CalendarHeaderRenderProps) => ReactNode;

  /**
   * Callback when the panel (displayed month/year) changes.
   * @param date - The new displayed date
   * @param mode - The current display mode
   */
  onPanelChange?: (date: Date, mode: CalendarMode) => void;

  /**
   * Callback when the selected value changes.
   * @param date - The newly selected date
   */
  onChange?: (date: Date) => void;

  /**
   * Callback when a date is selected (includes more detail than onChange).
   * @param date - The selected date
   * @param info - Information about how the selection was made
   */
  onSelect?: (date: Date, info: CalendarSelectInfo) => void;

  /**
   * Locale configuration for internationalization.
   */
  locale?: CalendarLocale;
}

/**
 * Default values for Calendar component props.
 */
export const CALENDAR_DEFAULTS: Partial<CalendarProps> = {
  mode: 'month',
  fullscreen: true,
};

/**
 * Day names used in the calendar header.
 */
export const CALENDAR_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/**
 * Month names used in year view.
 */
export const CALENDAR_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;
