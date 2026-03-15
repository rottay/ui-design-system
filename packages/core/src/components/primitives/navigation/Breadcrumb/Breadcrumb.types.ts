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
import type { EngineAwareProps } from '../../../../contracts';

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
   * @example 4 - Shows: Home / ... / Parent / Current
   */
  maxItems?: number;

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
