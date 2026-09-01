/**
 * @fileoverview Tour Component Types - Rottay Design System
 * @description Type definitions for the Tour component including step configuration,
 * placement options (13 positions), visual styles, mask options, and navigation callbacks.
 *
 * @remarks
 * The Tour types provide comprehensive configuration for:
 * - Step configuration: target, title, description, cover, placement
 * - Target types: CSS selectors, React refs, or getter functions
 * - Visual options: type (default/primary), mask, arrow
 * - Navigation: current step, onChange, onClose, onFinish
 * - Customization: indicators, close icon, gap settings
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   TourProps,
 *   TourStepProps,
 *   TourPlacement,
 *   TourType,
 * } from '@rottay/design-system';
 *
 * const step: TourStepProps = {
 *   target: '#my-element',
 *   title: 'Feature Title',
 *   description: 'Learn about this feature',
 *   placement: 'bottom',
 *   cover: <img src="/guide.png" alt="Guide" />,
 * };
 *
 * const tourProps: TourProps = {
 *   steps: [step],
 *   open: true,
 *   type: 'primary',
 *   onFinish: () => console.log('Done'),
 * };
 * ```
 *
 * @module Tour/Types
 * @category Overlay
 * @package @rottay/design-system
 */
import type { ReactNode, CSSProperties, RefObject } from 'react';

/**
 * Placement options for tour popover positioning.
 * Supports 12 positions around the target element plus center.
 */
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

/**
 * Visual style type for the tour.
 * - 'default': Standard neutral styling
 * - 'primary': Highlighted primary color styling
 */
export type TourType = 'default' | 'primary';

/**
 * Configuration for a single tour step.
 *
 * @example
 * ```tsx
 * const step: TourStepProps = {
 *   target: '#my-element',
 *   title: 'Step Title',
 *   description: 'This explains the feature',
 *   placement: 'bottom',
 *   cover: <img src="/guide.png" alt="Guide" />,
 * };
 * ```
 */
export interface TourStepProps {
  /**
   * Target element ref or selector.
   *
   * The ref may hold `null`: `useRef<HTMLElement>(null)` produces
   * `RefObject<HTMLElement | null>` under React 19, and a step can be
   * configured before its target has mounted. Every engine already resolves
   * the ref through a null check before measuring, so the nullable ref is the
   * shape callers actually hold.
   */
  target?: RefObject<HTMLElement | null> | (() => HTMLElement | null) | string;
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

/**
 * Props for the Tour component.
 *
 * @example
 * ```tsx
 * const props: TourProps = {
 *   steps: [
 *     { target: '#step1', title: 'Welcome' },
 *     { target: '#step2', title: 'Next Step' },
 *   ],
 *   open: true,
 *   onClose: () => setOpen(false),
 *   onFinish: () => console.log('Complete'),
 * };
 * ```
 */
export interface TourProps {
  /** Array of tour steps to display sequentially */
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
