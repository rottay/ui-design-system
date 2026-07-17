/**
 * @fileoverview BottomTabBar Component Types - Rottay Design System
 * @description Type definitions for the BottomTabBar shell structure.
 * A bottom tab bar for mobile app-style navigation.
 *
 * @module Structures/Shell/BottomTabBar/Contracts
 * @category Structure
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Single tab bar item configuration.
 */
export interface BottomTabBarItem {
  /** Unique identifier for this tab. */
  key: string;
  /** Text label displayed below the icon. */
  label: string;
  /** Icon element rendered above the label (24px recommended). */
  icon: ReactNode;
  /** Optional badge count. Renders as a small indicator top-right of the icon. */
  badge?: number;
  /** Navigation URL. When provided, the tab acts as a link. */
  href?: string;
  /** Click handler for this tab. */
  onClick?: () => void;
}

/**
 * Props interface for the BottomTabBar component.
 *
 * @description
 * Fixed-bottom tab bar for mobile app-style navigation. Supports up to 5 items,
 * each with an icon, label, and optional badge. Handles safe area insets for
 * notched devices.
 *
 * @example
 * ```tsx
 * <BottomTabBar
 *   items={[
 *     { key: 'home', label: 'Home', icon: <HomeIcon /> },
 *     { key: 'search', label: 'Search', icon: <SearchIcon /> },
 *     { key: 'profile', label: 'Profile', icon: <UserIcon />, badge: 3 },
 *   ]}
 *   activeKey="home"
 *   onChange={(key) => navigate(key)}
 * />
 * ```
 */
export interface BottomTabBarProps {
  /** Array of tab items (max 5). */
  items: BottomTabBarItem[];
  /** The key of the currently active tab. */
  activeKey?: string;
  /** Callback invoked when a tab is selected. */
  onChange?: (key: string) => void;
  /** Additional inline styles merged with the tab bar container. */
  style?: CSSProperties;
}

/**
 * Default values for BottomTabBar component props.
 */
export const BOTTOM_TAB_BAR_DEFAULTS: Partial<BottomTabBarProps> = {};
