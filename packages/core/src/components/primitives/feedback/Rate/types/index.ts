/**
 * Rate Types
 * Star rating component
 */
import type { ReactNode, CSSProperties } from 'react';

export interface RateProps {
  /** Current value */
  value?: number;
  /** Default value (uncontrolled) */
  defaultValue?: number;
  /** Number of stars */
  count?: number;
  /** Allow half stars */
  allowHalf?: boolean;
  /** Allow clearing value */
  allowClear?: boolean;
  /** Whether component is disabled */
  disabled?: boolean;
  /** Callback when value changes */
  onChange?: (value: number) => void;
  /** Callback when hovering */
  onHoverChange?: (value: number) => void;
  /** Custom character/icon for each star */
  character?: ReactNode | ((props: { index: number; value: number }) => ReactNode);
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: CSSProperties;
  /** Tooltip for each star */
  tooltips?: string[];
  /** Auto focus */
  autoFocus?: boolean;
  /** Keyboard navigation */
  keyboard?: boolean;
}

export const RATE_DEFAULTS: Partial<RateProps> = {
  count: 5,
  defaultValue: 0,
  allowHalf: false,
  allowClear: true,
  disabled: false,
  keyboard: true,
};
