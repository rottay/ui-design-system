/**
 * @fileoverview BackTop Component Types - Rottay Design System
 * @description Type definitions for the BackTop navigation component.
 * Provides comprehensive TypeScript interfaces for all BackTop variants and configurations.
 *
 * @remarks
 * These types are designed to be engine-agnostic, ensuring consistent prop
 * interfaces across Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla)
 * implementations. All engines must satisfy these type contracts.
 *
 * @example Type Usage
 * ```tsx
 * import type { BackTopProps } from '@rottay/design-system';
 *
 * const backTopConfig: BackTopProps = {
 *   visibilityHeight: 300,
 *   duration: 500,
 *   onClick: (e) => console.log('Clicked!'),
 * };
 * ```
 *
 * @example Using Defaults
 * ```tsx
 * import { BACKTOP_DEFAULTS } from '@rottay/design-system';
 *
 * console.log(BACKTOP_DEFAULTS.visibilityHeight); // 400
 * console.log(BACKTOP_DEFAULTS.duration); // 450
 * ```
 *
 * @see {@link BackTop} for the main component
 * @see {@link FloatButton} for related floating button types
 *
 * @module BackTop/Types
 * @category Navigation
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties, MouseEvent } from 'react';

// ============================================================================
// Main Props Interface
// ============================================================================

/**
 * Props interface for the BackTop component.
 *
 * @description
 * Defines all configurable properties for the BackTop component across
 * all rendering engines. These props control visibility, scroll behavior,
 * and visual customization.
 *
 * @example
 * ```tsx
 * const props: BackTopProps = {
 *   target: () => document.getElementById('scroll-container')!,
 *   visibilityHeight: 200,
 *   duration: 300,
 *   onClick: handleClick,
 *   className: 'custom-back-top',
 * };
 * ```
 */
export interface BackTopProps {
  /**
   * Function that returns the scrollable target element.
   * When omitted, defaults to the window object.
   *
   * @default () => window
   *
   * @example
   * ```tsx
   * // Custom scroll container
   * target={() => containerRef.current}
   *
   * // Window (default)
   * target={() => window}
   * ```
   */
  target?: () => Window | HTMLElement;

  /**
   * The scroll position threshold (in pixels) at which the button becomes visible.
   * The button appears when scroll position exceeds this value.
   *
   * @default 400
   *
   * @example
   * ```tsx
   * // Show after scrolling 200px
   * visibilityHeight={200}
   *
   * // Show after scrolling 50% of viewport
   * visibilityHeight={window.innerHeight * 0.5}
   * ```
   */
  visibilityHeight?: number;

  /**
   * Callback function fired when the button is clicked.
   * Called after the scroll animation begins.
   *
   * @param e - The mouse event from the click
   *
   * @example
   * ```tsx
   * onClick={(e) => {
   *   console.log('Scrolling to top');
   *   trackAnalytics('back_to_top_clicked');
   * }}
   * ```
   */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;

  /**
   * Duration of the scroll animation in milliseconds.
   * Only applies to the Classic engine (Ant Design).
   *
   * @default 450
   *
   * @example
   * ```tsx
   * // Faster scroll
   * duration={200}
   *
   * // Slower, smoother scroll
   * duration={800}
   * ```
   */
  duration?: number;

  /**
   * Custom content to render inside the button.
   * When omitted, displays a default up arrow icon.
   *
   * @example
   * ```tsx
   * // Custom icon
   * <BackTop>
   *   <ArrowUpIcon />
   * </BackTop>
   *
   * // Text content
   * <BackTop>
   *   <span>TOP</span>
   * </BackTop>
   * ```
   */
  children?: ReactNode;

  /**
   * Additional CSS class name(s) to apply to the button.
   * Useful for custom styling and overrides.
   *
   * @example
   * ```tsx
   * className="my-custom-back-top hover:scale-110"
   * ```
   */
  className?: string;

  /**
   * Inline styles to apply to the button.
   * Merged with default styles (custom styles take precedence).
   *
   * @example
   * ```tsx
   * style={{
   *   bottom: '60px',
   *   right: '20px',
   *   backgroundColor: '#ff4d4f',
   * }}
   * ```
   */
  style?: CSSProperties;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default values for BackTop component props.
 *
 * @description
 * These defaults are used when props are not explicitly provided.
 * They ensure consistent behavior across all engine implementations.
 *
 * @example
 * ```tsx
 * import { BACKTOP_DEFAULTS } from '@rottay/design-system';
 *
 * // Access default values
 * const defaultHeight = BACKTOP_DEFAULTS.visibilityHeight; // 400
 * const defaultDuration = BACKTOP_DEFAULTS.duration; // 450
 * ```
 */
export const BACKTOP_DEFAULTS: Partial<BackTopProps> = {
  /** Default scroll threshold for button visibility */
  visibilityHeight: 400,
  /** Default scroll animation duration in milliseconds */
  duration: 450,
};
