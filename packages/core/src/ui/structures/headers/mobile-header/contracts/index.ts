/**
 * @fileoverview MobileHeader Component Types - Rottay Design System
 * @description Type definitions for the MobileHeader page-header structure.
 * A compact header for mobile screens with left/center/right slots.
 *
 * @module Structures/Headers/MobileHeader/Contracts
 * @category Structure
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Props interface for the MobileHeader component.
 *
 * @description
 * Defines all configurable properties for a mobile-optimized header bar
 * with left action, centered title, and right action slots.
 *
 * @example
 * ```tsx
 * <MobileHeader
 *   title="My Page"
 *   onBack={() => router.back()}
 *   rightActions={<Button size="sm" variant="ghost"><SearchIcon /></Button>}
 *   sticky
 * />
 * ```
 */
export interface MobileHeaderProps {
  /** Title text displayed in the center of the header. Truncated with ellipsis if too long. */
  title?: string;
  /** Custom content for the left slot. Overrides the default back button when provided. */
  leftAction?: ReactNode;
  /** Content for the right slot, typically action icons or buttons. */
  rightActions?: ReactNode;
  /** Callback invoked when the default back button is pressed. Renders a back arrow when provided and no leftAction is set. */
  onBack?: () => void;
  /** When true, the header sticks to the top of the viewport with z-index 40. @default false */
  sticky?: boolean;
  /** Additional inline styles merged with the header container. */
  style?: CSSProperties;
  /** Optional children rendered below the title area (e.g. subtitle, search bar). */
  children?: ReactNode;
}

/**
 * Default values for MobileHeader component props.
 */
export const MOBILE_HEADER_DEFAULTS: Partial<MobileHeaderProps> = {
  sticky: false,
};
