'use client';

/**
 * @fileoverview Breadcrumb Component - Rottay Design System
 * @description A navigation component that shows the current page's location within a hierarchy.
 * Part of the Rottay Design System's navigation primitives collection.
 *
 * @remarks
 * The Breadcrumb component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Classic (Ant Design), Modern (DaisyUI), and Rustic
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - breadcrumb styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * @example Basic Usage with Items Array
 * ```tsx
 * import { Breadcrumb } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   return (
 *     <Breadcrumb
 *       items={[
 *         { key: 'home', label: 'Home', href: '/' },
 *         { key: 'products', label: 'Products', href: '/products' },
 *         { key: 'current', label: 'Current Page' },
 *       ]}
 *     />
 *   );
 * }
 * ```
 *
 * @example With Compound Components
 * ```tsx
 * import { Breadcrumb } from '@rottay/design-system';
 *
 * <Breadcrumb items={[]}>
 *   <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
 *   <Breadcrumb.Item href="/products">Products</Breadcrumb.Item>
 *   <Breadcrumb.Item>Current Page</Breadcrumb.Item>
 * </Breadcrumb>
 * ```
 *
 * @example With Icons
 * ```tsx
 * import { Breadcrumb } from '@rottay/design-system';
 * import { HomeIcon, FolderIcon } from '@rottay/icons';
 *
 * <Breadcrumb
 *   items={[
 *     { key: 'home', label: 'Home', href: '/', icon: <HomeIcon /> },
 *     { key: 'docs', label: 'Documents', href: '/docs', icon: <FolderIcon /> },
 *     { key: 'file', label: 'README.md' },
 *   ]}
 * />
 * ```
 *
 * @example Custom Separator
 * ```tsx
 * // Using a custom separator character
 * <Breadcrumb
 *   separator=">"
 *   items={[
 *     { key: 'home', label: 'Home', href: '/' },
 *     { key: 'page', label: 'Page' },
 *   ]}
 * />
 *
 * // Using a custom separator component
 * <Breadcrumb
 *   separator={<ChevronRightIcon />}
 *   items={items}
 * />
 * ```
 *
 * @example With Max Items (Truncation)
 * ```tsx
 * // Shows first item, ellipsis, and last 2 items
 * <Breadcrumb
 *   maxItems={4}
 *   items={[
 *     { key: 'home', label: 'Home', href: '/' },
 *     { key: 'cat1', label: 'Category 1', href: '/cat1' },
 *     { key: 'cat2', label: 'Category 2', href: '/cat1/cat2' },
 *     { key: 'cat3', label: 'Category 3', href: '/cat1/cat2/cat3' },
 *     { key: 'current', label: 'Current Page' },
 *   ]}
 * />
 * // Renders: Home / ... / Category 3 / Current Page
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Breadcrumb automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <Breadcrumb items={items} />
 *   {/* Uses ACME Corp's brand colors and styling *\/}
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <Breadcrumb engine="modern" items={items} />
 * // Renders with DaisyUI/Tailwind styling
 *
 * <Breadcrumb engine="rustic" items={items} />
 * // Renders with pure HTML/CSS (zero dependencies)
 * ```
 *
 * @see {@link BreadcrumbProps} for complete prop documentation
 * @see {@link BreadcrumbItem} for item compound component
 * @see {@link BreadcrumbItemType} for item interface definition
 *
 * @module Breadcrumb
 * @category Navigation
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { BreadcrumbProps } from './Breadcrumb.types';
import { BreadcrumbItem } from './compound';

// ============================================================================
// Type Exports
// ============================================================================

export {
  type BreadcrumbProps,
  type BreadcrumbItem as BreadcrumbItemType,
  BREADCRUMB_DEFAULTS,
} from './Breadcrumb.types';

// ============================================================================
// Base Component Export
// ============================================================================


// ============================================================================
// Compound Component Exports
// ============================================================================

export { BreadcrumbItem };
export type { BreadcrumbItemProps } from './compound';

// ============================================================================
// Main Component
// ============================================================================

/**
 * Breadcrumb component with multi-engine support and compound components.
 *
 * @description
 * A navigation component that displays the user's current location within
 * a site hierarchy. Ideal for:
 * - Multi-level navigation structures
 * - E-commerce category paths
 * - File system paths
 * - Dashboard navigation
 * - Settings panels with nested sections
 *
 * @remarks
 * - Supports both items array and compound component syntax
 * - Includes automatic truncation via `maxItems` prop
 * - Customizable separators (string or React elements)
 * - Fully accessible with proper ARIA attributes
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link BreadcrumbProps}
 * @returns React component with Item compound component
 *
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { key: 'home', label: 'Home', href: '/' },
 *     { key: 'docs', label: 'Documentation', href: '/docs' },
 *     { key: 'api', label: 'API Reference' },
 *   ]}
 *   separator="/"
 * />
 * ```
 */
export const Breadcrumb = Object.assign(
  createEngineComponent<BreadcrumbProps>('Breadcrumb', {
    /** Ant Design implementation - full-featured with animations */
    classic: () => import('./engines/classic'),
    /** DaisyUI/Tailwind implementation - utility-first styling */
    modern: () => import('./engines/modern'),
    /** Vanilla HTML/CSS implementation - zero dependencies */
    rustic: () => import('./engines/rustic'),
  }),
  {
    /**
     * Individual breadcrumb item compound component.
     * Used for declarative breadcrumb definition.
     * @see {@link BreadcrumbItem}
     */
    Item: BreadcrumbItem,
  }
);
