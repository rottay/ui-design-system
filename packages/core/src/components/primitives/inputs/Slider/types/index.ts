/**
 * Slider Types
 */
import type { ReactNode, CSSProperties } from 'react';

export interface SliderMarks {
  [key: number]: ReactNode | { style?: CSSProperties; label: ReactNode };
}

export interface SliderProps {
  /** Current value (single or range) */
  value?: number | [number, number];
  /** Default value */
  defaultValue?: number | [number, number];
  /** Callback when value changes */
  onChange?: (value: number | [number, number]) => void;
  /** Callback when slider is released */
  onChangeComplete?: (value: number | [number, number]) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number | null;
  /** Enable range mode (dual handles) */
  range?: boolean;
  /** Marks on the slider */
  marks?: SliderMarks;
  /** Include marks endpoints */
  included?: boolean;
  /** Whether disabled */
  disabled?: boolean;
  /** Vertical mode */
  vertical?: boolean;
  /** Reverse direction */
  reverse?: boolean;
  /** Custom tooltip */
  tooltip?: {
    open?: boolean;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    formatter?: ((value?: number) => ReactNode) | null;
  };
  /** Allow keyboard interaction */
  keyboard?: boolean;
  /** Dots on each step */
  dots?: boolean;
  /** Track style */
  trackStyle?: CSSProperties | CSSProperties[];
  /** Rail style */
  railStyle?: CSSProperties;
  /** Handle style */
  handleStyle?: CSSProperties | CSSProperties[];
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

export const SLIDER_DEFAULTS: Partial<SliderProps> = {
  min: 0,
  max: 100,
  step: 1,
  range: false,
  included: true,
  disabled: false,
  vertical: false,
  reverse: false,
  keyboard: true,
  dots: false,
};
