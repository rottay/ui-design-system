'use client';

/**
 * @fileoverview Pagination Component - Rottay Design System
 * @description A navigation component for traversing through paginated content.
 * Part of the Rottay Design System's navigation primitives collection.
 *
 * @remarks
 * The Pagination component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Classic (Ant Design), Modern (DaisyUI), and Rustic
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - pagination styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * @example Basic Usage
 * ```tsx
 * import { Pagination } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   const [page, setPage] = useState(1);
 *
 *   return (
 *     <Pagination
 *       current={page}
 *       total={100}
 *       onChange={(newPage) => setPage(newPage)}
 *     />
 *   );
 * }
 * ```
 *
 * @example With Page Size Changer
 * ```tsx
 * import { Pagination } from '@rottay/design-system';
 *
 * function DataTable() {
 *   const [page, setPage] = useState(1);
 *   const [pageSize, setPageSize] = useState(10);
 *
 *   return (
 *     <Pagination
 *       current={page}
 *       total={500}
 *       pageSize={pageSize}
 *       showSizeChanger
 *       onChange={(newPage, newSize) => {
 *         setPage(newPage);
 *         setPageSize(newSize);
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @example With Total Display
 * ```tsx
 * import { Pagination } from '@rottay/design-system';
 *
 * // Show total count alongside pagination
 * <Pagination
 *   current={1}
 *   total={250}
 *   showTotal
 *   pageSize={25}
 * />
 * ```
 *
 * @example Different Sizes
 * ```tsx
 * // Small pagination for compact UIs
 * <Pagination current={1} total={100} size="sm" />
 *
 * // Medium pagination (default)
 * <Pagination current={1} total={100} size="md" />
 *
 * // Large pagination for prominent navigation
 * <Pagination current={1} total={100} size="lg" />
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Pagination automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <Pagination current={page} total={total} onChange={handleChange}>
 *     {/* Uses ACME Corp's brand colors and styling *\/}
 *   </Pagination>
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <Pagination engine="modern" current={1} total={100}>
 *   {/* Renders with DaisyUI/Tailwind styling *\/}
 * </Pagination>
 * ```
 *
 * @example Disabled State
 * ```tsx
 * // Disable all pagination controls
 * <Pagination
 *   current={1}
 *   total={100}
 *   disabled
 *   onChange={handleChange}
 * />
 * ```
 *
 * @see {@link PaginationProps} for complete prop documentation
 * @see {@link BasePagination} for the base component implementation
 *
 * @module Pagination
 * @category Navigation
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { PaginationProps } from './types';

// ============================================================================
// Type Exports
// ============================================================================

export { type PaginationProps, type PaginationSize, PAGINATION_DEFAULTS } from './types';

// ============================================================================
// Base Component Export
// ============================================================================


// ============================================================================
// Main Component
// ============================================================================

/**
 * Pagination component with multi-engine support.
 *
 * @description
 * A navigation control for traversing through pages of content. Ideal for:
 * - Data tables with many rows
 * - Search results pages
 * - Image galleries
 * - Blog post listings
 * - Product catalogs
 *
 * @remarks
 * - Supports three sizes (sm, md, lg)
 * - Includes optional page size changer
 * - Shows total items count optionally
 * - Fully accessible with ARIA attributes
 * - Adapts to tenant theming automatically
 * - Handles edge cases like first/last page gracefully
 *
 * @param props - {@link PaginationProps}
 * @returns React component for page navigation
 *
 * @example
 * ```tsx
 * <Pagination
 *   current={currentPage}
 *   total={totalItems}
 *   pageSize={10}
 *   onChange={(page, size) => handlePageChange(page, size)}
 * />
 * ```
 */
export const Pagination = createEngineComponent<PaginationProps>('Pagination', {
  /** Ant Design implementation - full-featured with animations */
  classic: () => import('./engines/classic'),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  modern: () => import('./engines/modern'),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  rustic: () => import('./engines/rustic'),
});
