/**
 * @fileoverview Breadcrumb Types - Rottay Design System
 * @description Type definitions for the Breadcrumb component and its items.
 * Part of the Rottay Design System's navigation primitives collection.
 *
 * @remarks
 * This module defines the core TypeScript interfaces for the Breadcrumb component.
 * The types are designed to work across all three rendering engines (Classic,
 * Modern, Rustic) while providing a consistent API for developers.
 *
 * **Type Categories:**
 * - `BreadcrumbItem`: Individual navigation item structure
 * - `BreadcrumbProps`: Main component props interface
 *
 * **Multi-Tenant Support:**
 * Props extend `EngineAwareProps` to ensure compatibility with tenant
 * theming and engine switching across all implementations.
 *
 * @example Type Usage
 * ```tsx
 * import type { BreadcrumbProps, BreadcrumbItem } from '@rottay/design-system';
 *
 * // Custom breadcrumb wrapper with typed props
 * interface CustomBreadcrumbProps extends BreadcrumbProps {
 *   showHomeIcon?: boolean;
 * }
 *
 * // Type-safe item creation
 * const items: BreadcrumbItem[] = [
 *   { key: 'home', label: 'Home', href: '/' },
 *   { key: 'products', label: 'Products', href: '/products' },
 *   { key: 'current', label: 'Product Details' },
 * ];
 * ```
 *
 * @example Default Values Usage
 * ```tsx
 * import { BREADCRUMB_DEFAULTS } from '@rottay/design-system';
 *
 * // Access default configuration
 * console.log(BREADCRUMB_DEFAULTS.separator); // '/'
 * ```
 *
 * @see {@link BreadcrumbProps} - Main component props
 * @see {@link BreadcrumbItem} - Item interface
 * @see {@link BREADCRUMB_DEFAULTS} - Default configuration values
 * @module Breadcrumb/Types
 * @category Navigation
 * @package @rottay/design-system
 */

import type { CSSProperties, ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../../foundation/contracts';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Individual breadcrumb navigation item.
 * Represents a single step in the navigation hierarchy.
 *
 * @interface BreadcrumbItem
 *
 * @example Basic Item
 * ```tsx
 * const homeItem: BreadcrumbItem = {
 *   key: 'home',
 *   label: 'Home',
 *   href: '/',
 * };
 * ```
 *
 * @example Item with Icon
 * ```tsx
 * const docsItem: BreadcrumbItem = {
 *   key: 'docs',
 *   label: 'Documentation',
 *   href: '/docs',
 *   icon: <BookIcon />,
 * };
 * ```
 *
 * @example Item with Click Handler
 * ```tsx
 * const actionItem: BreadcrumbItem = {
 *   key: 'action',
 *   label: 'Navigate',
 *   onClick: () => router.push('/custom-route'),
 * };
 * ```
 */
export interface BreadcrumbItem {
  /**
   * Unique identifier for the breadcrumb item.
   * Used as React key for efficient rendering.
   * @example 'home'
   * @example 'products-category'
   */
  key: string;

  /**
   * Content displayed for the breadcrumb item.
   * Can be a string or custom React elements.
   * @example 'Home'
   * @example <><Icon /> Products</>
   */
  label: ReactNode;

  /**
   * URL for navigation link.
   * When provided, the item renders as an anchor tag.
   * Omit for the current/active page (last item).
   * @example '/'
   * @example '/products/electronics'
   */
  href?: string;

  /**
   * Icon to display before the label.
   * @example <HomeIcon />
   * @example <FolderIcon size={16} />
   */
  icon?: ReactNode;

  /**
   * Click handler for custom navigation behavior.
   * Called when the item is clicked.
   */
  onClick?: () => void;

  /**
   * Per-item menu. When present, the crumb becomes the trigger for a
   * Dropdown listing these entries (the crumb keeps its own href/onClick
   * rendering; the Dropdown composes around it and stamps
   * `aria-haspopup`/`aria-expanded` on it).
   * @example
   * ```tsx
   * { key: 'v2', label: 'v2.4', menu: [
   *   { key: 'v2.3', label: 'v2.3', href: '/docs/v2.3' },
   *   { key: 'v2.2', label: 'v2.2', href: '/docs/v2.2' },
   * ] }
   * ```
   */
  menu?: BreadcrumbMenuItem[];
}

/**
 * A single entry in a {@link BreadcrumbItem.menu} or in the collapsed-items
 * menu opened by the {@link BreadcrumbProps.overflow} trigger.
 *
 * @remarks
 * The underlying Dropdown menu item contract has no native `href` — it is
 * click-only. An entry with `href` still "navigates" (a synthesized click
 * handler assigns `window.location.href`), but this is a full navigation,
 * not a client-side route transition. An entry that also needs SPA routing
 * should use `onClick` (the same convention the crumb's own `onClick`
 * already follows) instead of relying on `href` alone.
 */
export interface BreadcrumbMenuItem {
  /** Unique identifier for the menu entry. */
  key: string;
  /** Display content for the menu entry. */
  label: ReactNode;
  /** URL "navigated" to on click (see the class remarks for the caveat). */
  href?: string;
  /** Click handler; called before any `href` navigation. */
  onClick?: () => void;
}

// ============================================================================
// Props Interface
// ============================================================================

/**
 * Props for the Breadcrumb component.
 *
 * @interface BreadcrumbProps
 * @extends {EngineAwareProps} - Engine selection support
 *
 * @example Complete Usage
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { key: 'home', label: 'Home', href: '/', icon: <HomeIcon /> },
 *     { key: 'category', label: 'Electronics', href: '/electronics' },
 *     { key: 'product', label: 'Laptop Pro 15"' },
 *   ]}
 *   separator=">"
 *   maxItems={4}
 *   className="my-breadcrumb"
 * />
 * ```
 */
export interface BreadcrumbProps extends EngineAwareProps {
  // ---------------------------------------------------------------------------
  // Content
  // ---------------------------------------------------------------------------

  /**
   * Array of breadcrumb items to display.
   * Items are rendered in order from left to right.
   * The last item typically represents the current page.
   */
  items: BreadcrumbItem[];

  /**
   * Separator displayed between breadcrumb items.
   * Can be a string character or a React element.
   * @default '/'
   * @example '/'
   * @example '>'
   * @example <ChevronRightIcon />
   */
  separator?: ReactNode;

  /**
   * Maximum number of items to display before truncation.
   * When exceeded, middle items are replaced with an ellipsis.
   * Superseded entirely by `overflow` when that prop is present.
   * @example 4 - Shows: Home / ... / Parent / Current
   */
  maxItems?: number;

  /**
   * Overflow configuration governing collapse. When present, `overflow`
   * takes over collapse entirely (`maxItems` is ignored); when absent,
   * `maxItems` keeps working exactly as before. Unlike the legacy `maxItems`
   * ellipsis (an inert `<li role="note">`), collapsed items open behind a
   * real trigger button (`data-part="overflow-trigger"`) that composes the
   * public Dropdown, listing the hidden items with their label/href/onClick
   * honored.
   *
   * @example
   * ```tsx
   * <Breadcrumb items={items} overflow={{ maxVisible: 4, keepFirst: 1, keepLast: 2 }} />
   * ```
   */
  overflow?: BreadcrumbOverflowConfig;

  // ---------------------------------------------------------------------------
  // Styling
  // ---------------------------------------------------------------------------

  /**
   * Optional CSS class name for custom styling.
   * Applied to the root breadcrumb container.
   */
  className?: string;

  /**
   * Optional inline styles for the breadcrumb container.
   */
  style?: CSSProperties;

  // ---------------------------------------------------------------------------
  // Advanced
  // ---------------------------------------------------------------------------

  /**
   * Optional children for base component usage.
   * Used with compound component syntax (Breadcrumb.Item).
   */
  children?: ReactNode;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration values for the Breadcrumb component.
 * Used by engine implementations to ensure consistent behavior.
 *
 * @constant
 *
 * @example Accessing Defaults
 * ```tsx
 * import { BREADCRUMB_DEFAULTS } from '@rottay/design-system';
 *
 * const MyBreadcrumb = (props: BreadcrumbProps) => {
 *   const separator = props.separator ?? BREADCRUMB_DEFAULTS.separator;
 *   // ...
 * };
 * ```
 */
export const BREADCRUMB_DEFAULTS: Partial<BreadcrumbProps> = {
  /** Default separator is a forward slash */
  separator: '/',
};

/**
 * Configuration for {@link BreadcrumbProps.overflow}.
 *
 * @remarks Implemented by the modern engine only; classic and rustic keep
 * their current `maxItems`-only collapse (the axis is typed for all three,
 * but only modern renders the real overflow trigger).
 */
export interface BreadcrumbOverflowConfig {
  /** Collapse triggers once `items.length` exceeds this count. */
  maxVisible: number;
  /**
   * Number of items always kept visible at the start, before the trigger.
   * @default 1
   */
  keepFirst?: number;
  /**
   * Number of items always kept visible at the end, after the trigger
   * (the last of these is always the current page).
   * @default 2
   */
  keepLast?: number;
}

/** Defaults for the optional fields of {@link BreadcrumbOverflowConfig}. */
export const BREADCRUMB_OVERFLOW_DEFAULTS = {
  keepFirst: 1,
  keepLast: 2,
} as const;
