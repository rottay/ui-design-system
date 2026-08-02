/**
 * @fileoverview FloatButton Type Definitions - Rottay Design System
 * @description TypeScript interfaces and types for the FloatButton component family.
 * Includes props for FloatButton, FloatButton.Group, and FloatButton.BackTop.
 *
 * @remarks
 * These types are designed to be engine-agnostic, providing a unified API across
 * Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla) implementations.
 * Each engine maps these props to its underlying implementation.
 *
 * @example Type usage
 * ```tsx
 * import type { FloatButtonProps, FloatButtonGroupProps } from '@rottay/design-system';
 *
 * const MyFloatButton: React.FC<FloatButtonProps> = (props) => {
 *   return <FloatButton {...props} />;
 * };
 *
 * const config: FloatButtonGroupProps = {
 *   trigger: 'hover',
 *   shape: 'circle',
 *   type: 'primary',
 * };
 * ```
 *
 * @see {@link FloatButton} for component implementation
 * @see {@link FLOAT_BUTTON_DEFAULTS} for default values
 *
 * @module FloatButton/Types
 * @category Navigation
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '@/foundation/contracts/runtime/engine';

// ============================================================================
// FloatButton Props
// ============================================================================

/**
 * Props for the FloatButton component.
 *
 * @description
 * Defines the configuration options for a floating action button.
 * Supports icons, tooltips, badges, and various visual styles.
 *
 * @example
 * ```tsx
 * const buttonProps: FloatButtonProps = {
 *   icon: <PlusOutlined />,
 *   tooltip: 'Add new item',
 *   type: 'primary',
 *   shape: 'circle',
 *   badge: { count: 5 },
 *   onClick: () => console.log('clicked'),
 * };
 * ```
 */
export interface FloatButtonProps extends EngineAwareProps {
  /** Button icon - typically an icon component */
  icon?: ReactNode;

  /** Button description text - displayed below the icon */
  description?: ReactNode;

  /** Tooltip text or node - shown on hover */
  tooltip?: ReactNode;

  /** Button type - affects background color styling
   * @default 'default'
   */
  type?: 'default' | 'primary';

  /** Button shape - circle or square with rounded corners
   * @default 'circle'
   */
  shape?: 'circle' | 'square';

  /** Click handler - called when button is clicked */
  onClick?: (e: React.MouseEvent) => void;

  /** Link href - renders as anchor tag when provided */
  href?: string;

  /** Link target - used with href for anchor behavior */
  target?: string;

  /** Badge configuration - shows indicator on button
   * @property dot - Shows a small dot indicator
   * @property count - Shows a number badge (max 99+)
   */
  badge?: { dot?: boolean; count?: number };

  /** Custom class name for additional styling */
  className?: string;

  /** Custom inline styles */
  style?: CSSProperties;

  /** Children content - for accessibility or custom content */
  children?: ReactNode;
}

// ============================================================================
// FloatButton.Group Props
// ============================================================================

/**
 * Props for the FloatButton.Group compound component.
 *
 * @description
 * Defines the configuration for a group of expandable float buttons.
 * Supports click or hover triggers for revealing child buttons.
 *
 * @example
 * ```tsx
 * const groupProps: FloatButtonGroupProps = {
 *   trigger: 'click',
 *   icon: <MenuOutlined />,
 *   closeIcon: <CloseOutlined />,
 *   shape: 'circle',
 *   onOpenChange: (open) => console.log('Group open:', open),
 * };
 * ```
 */
export interface FloatButtonGroupProps extends EngineAwareProps {
  /** Trigger mode for expanding/collapsing the group
   * @default 'click'
   */
  trigger?: 'click' | 'hover';

  /** Whether group is open - for controlled mode */
  open?: boolean;

  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;

  /** Group trigger button icon - shown when closed */
  icon?: ReactNode;

  /** Close icon - shown when group is open
   * @default '×'
   */
  closeIcon?: ReactNode;

  /** Button shape for the trigger button
   * @default 'circle'
   */
  shape?: 'circle' | 'square';

  /** Button type for the trigger button
   * @default 'default'
   */
  type?: 'default' | 'primary';

  /** Tooltip text for the trigger button */
  tooltip?: ReactNode;

  /** Child FloatButton components */
  children?: ReactNode;

  /** Custom class name for additional styling */
  className?: string;

  /** Custom inline styles */
  style?: CSSProperties;
}

// ============================================================================
// FloatButton.BackTop Props
// ============================================================================

/**
 * Props for the FloatButton.BackTop compound component.
 *
 * @description
 * Defines the configuration for a scroll-to-top floating button.
 * Automatically shows/hides based on scroll position.
 *
 * @example
 * ```tsx
 * const backTopProps: FloatButtonBackTopProps = {
 *   visibilityHeight: 200,
 *   duration: 300,
 *   target: () => document.getElementById('scroll-container'),
 *   onClick: () => console.log('Scrolling to top'),
 * };
 * ```
 */
export interface FloatButtonBackTopProps extends EngineAwareProps {
  /** Visibility threshold - button appears when scroll exceeds this value
   * @default 400
   */
  visibilityHeight?: number;

  /** Scroll target - element or window to monitor for scroll
   * @default window
   */
  target?: () => HTMLElement | Window;

  /** Click callback - called when button is clicked */
  onClick?: () => void;

  /** Animation duration in milliseconds for scroll animation
   * @default 450
   */
  duration?: number;

  /** Button icon - defaults to up arrow */
  icon?: ReactNode;

  /** Button description text */
  description?: ReactNode;

  /** Button type
   * @default 'default'
   */
  type?: 'default' | 'primary';

  /** Button shape
   * @default 'circle'
   */
  shape?: 'circle' | 'square';

  /** Tooltip text */
  tooltip?: ReactNode;

  /** Custom class name for additional styling */
  className?: string;

  /** Custom inline styles */
  style?: CSSProperties;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default values for FloatButton components.
 *
 * @description
 * Provides consistent default values across all engine implementations.
 * These values are used when props are not explicitly provided.
 *
 * @example
 * ```tsx
 * import { FLOAT_BUTTON_DEFAULTS } from '@rottay/design-system';
 *
 * console.log(FLOAT_BUTTON_DEFAULTS.type);            // 'default'
 * console.log(FLOAT_BUTTON_DEFAULTS.shape);           // 'circle'
 * console.log(FLOAT_BUTTON_DEFAULTS.visibilityHeight); // 400
 * console.log(FLOAT_BUTTON_DEFAULTS.duration);        // 450
 * ```
 */
export const FLOAT_BUTTON_DEFAULTS = {
  /** Default button type */
  type: 'default' as const,

  /** Default button shape */
  shape: 'circle' as const,

  /** Default visibility height for BackTop (in pixels) */
  visibilityHeight: 400,

  /** Default scroll animation duration (in milliseconds) */
  duration: 450,
};
