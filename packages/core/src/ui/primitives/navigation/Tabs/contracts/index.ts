/**
 * @fileoverview Tabs Type Definitions - Rottay Design System
 * @description TypeScript interfaces and types for the Tabs component.
 * Defines the contract for tabs across all engine implementations.
 *
 * @remarks
 * These types ensure consistency across Classic, Modern, and Rustic engines
 * while providing full TypeScript intellisense and type safety.
 *
 * @module Tabs/Types
 * @category Navigation
 * @package @rottay/design-system
 */

import type React from 'react';
import type { ReactNode } from 'react';
import type { EngineAwareProps, Size } from '../../../../../foundation/contracts';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';

// ============================================================================
// Tab Item Interface
// ============================================================================

/**
 * Configuration for a single tab item.
 *
 * @description
 * Defines the structure of each tab in the items array.
 * Used to programmatically configure tabs.
 *
 * @example
 * ```tsx
 * const tabItems: TabItem[] = [
 *   { key: 'home', label: 'Home', children: <HomeContent /> },
 *   { key: 'profile', label: 'Profile', icon: <UserIcon />, children: <ProfileContent /> },
 *   { key: 'settings', label: 'Settings', disabled: true },
 * ];
 * ```
 */
export interface TabItem {
  /**
   * Unique identifier for the tab.
   * Used to track active state and for accessibility.
   */
  key: string;

  /**
   * The tab's label displayed in the tab bar.
   * Can be a string or any React node (e.g., with icons).
   */
  label: ReactNode;

  /**
   * Content rendered when this tab is active.
   * Displayed in the tab panel area below the tab bar.
   */
  children?: ReactNode;

  /**
   * Whether the tab is disabled and cannot be selected.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether this destination is resolving asynchronous content or state.
   * Loading tabs stay readable (including when already selected), expose
   * `aria-busy`, and are temporarily removed from click/keyboard activation.
   * @default false
   */
  loading?: boolean;

  /**
   * Optional icon displayed before the label.
   * Typically a React icon component.
   */
  icon?: ReactNode;

  /**
   * Optional count or compact status rendered in the component-owned badge.
   * Prefer this explicit channel over embedding a badge in `label`; it keeps
   * geometry, contrast and tenant theming under the Tabs contract.
   */
  badge?: ReactNode;

  /** Accessible name for a non-text badge (for example an unread dot). */
  badgeAriaLabel?: string;
}

// ============================================================================
// Type Aliases
// ============================================================================

/**
 * Visual style variants for the tabs component.
 *
 * @description
 * - `underline`: Quiet rail with a measured active indicator
 * - `contained`: Framed tray with elevated active destination
 * - `segmented`: Compact grouped choice without active lift
 * - `pills`: Rounded tray with a filled active destination
 *
 * @example
 * ```tsx
 * <Tabs type="underline" items={items} />
 * <Tabs type="contained" items={items} />
 * <Tabs type="segmented" items={items} />
 * <Tabs type="pills" items={items} />
 * ```
 */
export type TabsRecipe = 'underline' | 'contained' | 'segmented' | 'pills';

/**
 * Public visual recipe. `line` and `card` remain as compatibility aliases for
 * `underline` and `contained`; engines stamp the canonical recipe in the DOM.
 */
export type TabsType = TabsRecipe | 'line' | 'card';

/** How a constrained tab rail reveals destinations that do not fit. */
export type TabsOverflow = 'auto' | 'scroll' | 'menu' | 'wrap';

/** Whether focus movement immediately selects a tab. */
export type TabsActivationMode = 'automatic' | 'manual';

/** Width source for the underline recipe's active indicator. */
export type TabsIndicator = 'tab' | 'label' | 'none';

/** Visual treatment of the active tab panel. */
export type TabsPanelVariant = 'plain' | 'contained';

/** Localizable labels for Tabs-owned overflow controls. */
export interface TabsAccessibilityLabels {
  previous?: string;
  next?: string;
  more?: string;
  /** Announcement appended to a loading destination in the polite live region. */
  loading?: string;
}

/**
 * Size variants for the tabs component.
 *
 * @description
 * Controls the padding and font size of tab buttons.
 * - `sm`: Small - compact tabs for dense UIs
 * - `md`: Medium - standard size (default)
 * - `lg`: Large - prominent tabs for main navigation
 *
 * @example
 * ```tsx
 * <Tabs size="sm" items={items} />  // Compact
 * <Tabs size="md" items={items} />  // Default
 * <Tabs size="lg" items={items} />  // Large
 * ```
 */
export type TabsSize = Extract<Size, 'sm' | 'md' | 'lg'>;

// ============================================================================
// Main Props Interface
// ============================================================================

/**
 * Props for the Tabs component.
 *
 * @description
 * Complete prop interface for the Tabs component, supporting both
 * controlled and uncontrolled modes, multiple visual variants,
 * and full engine awareness for multi-engine rendering.
 *
 * @extends EngineAwareProps - Inherits engine override capability
 *
 * @example Uncontrolled Mode
 * ```tsx
 * <Tabs
 *   items={tabItems}
 *   defaultActiveKey="home"
 *   type="line"
 *   size="md"
 * />
 * ```
 *
 * @example Controlled Mode
 * ```tsx
 * const [activeKey, setActiveKey] = useState('home');
 *
 * <Tabs
 *   items={tabItems}
 *   activeKey={activeKey}
 *   onChange={setActiveKey}
 * />
 * ```
 */
export interface TabsProps extends EngineAwareProps {
  /**
   * Array of tab items to render.
   * Each item defines a tab's key, label, content, and state.
   * @see {@link TabItem}
   */
  items: TabItem[];

  /**
   * Currently active tab key (controlled mode).
   * When provided, the component is fully controlled.
   * Use with `onChange` to manage state externally.
   */
  activeKey?: string;

  /**
   * Initial active tab key (uncontrolled mode).
   * Used only on initial render if `activeKey` is not provided.
   * @default First item's key
   */
  defaultActiveKey?: string;

  /**
   * Visual style of the tabs.
   * @default 'line' (compatibility alias for `underline`)
   * @see {@link TabsType}
   */
  type?: TabsType;

  /**
   * Constrained-container behavior. `auto` uses touch scrolling plus edge
   * controls when needed; `menu` also exposes every destination in a menu.
   * @default 'auto'
   */
  overflow?: TabsOverflow;

  /** Keyboard activation behavior following the WAI-ARIA tabs pattern. */
  activationMode?: TabsActivationMode;

  /** Underline measurement source, or `none` to remove the indicator. */
  indicator?: TabsIndicator;

  /** Whether panel content is visually framed by the Tabs primitive. */
  panelVariant?: TabsPanelVariant;

  /** Localized accessible names for previous/next/more controls. */
  accessibilityLabels?: TabsAccessibilityLabels;

  /**
   * Size variant of the tabs. Accepts a plain value or a responsive breakpoint object.
   * @default 'md'
   * @see {@link TabsSize}
   * @example
   * ```tsx
   * <Tabs size="lg" items={items} />
   * <Tabs size={{ base: 'sm', md: 'md', xl: 'lg' }} items={items} />
   * ```
   */
  size?: ResponsiveValue<TabsSize>;

  /**
   * Whether to center the tabs in the container.
   * @default false
   */
  centered?: boolean;

  /**
   * Callback fired when the active tab changes.
   * Receives the new active tab's key.
   *
   * @param key - The key of the newly selected tab
   *
   * @example
   * ```tsx
   * <Tabs
   *   items={items}
   *   onChange={(key) => console.log('Active tab:', key)}
   * />
   * ```
   */
  onChange?: (key: string) => void;

  /**
   * Additional CSS class name(s) to apply.
   * Merged with the component's default classes.
   */
  className?: string;

  /**
   * Inline styles to apply to the root element.
   * Use CSS variables for theme-aware styling.
   */
  style?: React.CSSProperties;

  /**
   * Child elements (for compound component usage).
   * When using TabPane children instead of items array.
   */
  children?: ReactNode;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default values for Tabs props.
 *
 * @description
 * Provides sensible defaults for optional props.
 * Used by all engine implementations for consistency.
 *
 * @example
 * ```tsx
 * // These are applied automatically:
 * // type: 'line'
 * // size: 'md'
 * // centered: false
 * ```
 */
export const TABS_DEFAULTS: Partial<TabsProps> = {
  /** Default visual style - underlined tabs */
  type: 'line',
  /** Default size - medium */
  size: 'md',
  /** Default alignment - left aligned */
  centered: false,
  overflow: 'auto',
  activationMode: 'automatic',
  indicator: 'tab',
  panelVariant: 'plain',
};
