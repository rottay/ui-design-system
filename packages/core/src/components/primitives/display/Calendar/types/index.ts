/**
 * Calendar Types
 */
import type { ReactNode, CSSProperties } from 'react';

export type CalendarMode = 'month' | 'year';
export type CalendarHeaderRenderProps = {
  value: Date;
  type: CalendarMode;
  onChange: (date: Date) => void;
  onTypeChange: (type: CalendarMode) => void;
};

export interface CalendarProps {
  /** Current value */
  value?: Date | string;
  /** Default value */
  defaultValue?: Date | string;
  /** Display mode */
  mode?: CalendarMode;
  /** Default mode */
  defaultMode?: CalendarMode;
  /** Full screen mode */
  fullscreen?: boolean;
  /** Valid date range */
  validRange?: [Date, Date];
  /** Disabled date */
  disabledDate?: (currentDate: Date) => boolean;
  /** Custom date cell render */
  dateCellRender?: (date: Date) => ReactNode;
  /** Custom month cell render */
  monthCellRender?: (date: Date) => ReactNode;
  /** Custom full cell render */
  dateFullCellRender?: (date: Date) => ReactNode;
  /** Custom full month cell render */
  monthFullCellRender?: (date: Date) => ReactNode;
  /** Cell render (new API) */
  cellRender?: (date: Date, info: { originNode: ReactNode; today: Date; type: 'date' | 'month' }) => ReactNode;
  /** Full cell render (new API) */
  fullCellRender?: (date: Date, info: { originNode: ReactNode; today: Date; type: 'date' | 'month' }) => ReactNode;
  /** Header render */
  headerRender?: (props: CalendarHeaderRenderProps) => ReactNode;
  /** Callback when panel changes */
  onPanelChange?: (date: Date, mode: CalendarMode) => void;
  /** Callback when value changes */
  onChange?: (date: Date) => void;
  /** Callback when select changes */
  onSelect?: (date: Date, info: { source: 'year' | 'month' | 'date' | 'customize' }) => void;
  /** Locale */
  locale?: {
    lang?: {
      locale?: string;
      month?: string;
      year?: string;
      today?: string;
      monthSelect?: string;
      yearSelect?: string;
    };
    monthFormat?: string;
    monthBeforeYear?: boolean;
  };
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** ID */
  id?: string;
}

export const CALENDAR_DEFAULTS: Partial<CalendarProps> = {
  mode: 'month',
  fullscreen: true,
};
