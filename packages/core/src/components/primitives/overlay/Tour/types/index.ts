/**
 * Tour Types
 */
import type { ReactNode, CSSProperties, RefObject } from 'react';

export type TourPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'leftTop'
  | 'leftBottom'
  | 'right'
  | 'rightTop'
  | 'rightBottom'
  | 'center';

export type TourType = 'default' | 'primary';

export interface TourStepProps {
  /** Target element ref or selector */
  target?: RefObject<HTMLElement> | (() => HTMLElement | null) | string;
  /** Title of the step */
  title: ReactNode;
  /** Description of the step */
  description?: ReactNode;
  /** Cover image */
  cover?: ReactNode;
  /** Placement of the popover */
  placement?: TourPlacement;
  /** Whether to show arrow */
  arrow?: boolean | { pointAtCenter: boolean };
  /** Type of the step */
  type?: TourType;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
  /** Mask style */
  mask?: boolean | { style?: CSSProperties; color?: string };
  /** Next button text */
  nextButtonProps?: {
    children?: ReactNode;
    onClick?: () => void;
  };
  /** Prev button text */
  prevButtonProps?: {
    children?: ReactNode;
    onClick?: () => void;
  };
}

export interface TourProps {
  /** Tour steps */
  steps: TourStepProps[];
  /** Current step index (controlled) */
  current?: number;
  /** Whether tour is open */
  open?: boolean;
  /** Callback when step changes */
  onChange?: (current: number) => void;
  /** Callback when tour closes */
  onClose?: () => void;
  /** Callback when tour finishes */
  onFinish?: () => void;
  /** Type of tour */
  type?: TourType;
  /** Show mask */
  mask?: boolean | { style?: CSSProperties; color?: string };
  /** Show arrow */
  arrow?: boolean | { pointAtCenter: boolean };
  /** Default placement */
  placement?: TourPlacement;
  /** Z-index */
  zIndex?: number;
  /** Gap between target and popover */
  gap?: { offset?: number; radius?: number };
  /** Indicator render function */
  indicatorsRender?: (current: number, total: number) => ReactNode;
  /** Close icon */
  closeIcon?: ReactNode;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

export const TOUR_DEFAULTS: Partial<TourProps> = {
  type: 'default',
  mask: true,
  arrow: true,
  placement: 'bottom',
  zIndex: 1001,
};
