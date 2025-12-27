/**
 * @fileoverview Breadcrumb Compound Components - Rottay Design System
 * @description Re-exports all compound components for the Breadcrumb primitive.
 *
 * @remarks
 * This barrel file provides convenient access to all Breadcrumb compound
 * components. These components enable a declarative API for defining
 * breadcrumb navigation items.
 *
 * **Component Hierarchy:**
 * ```
 * <Breadcrumb>
 *   <Breadcrumb.Item href="/" />     ← Clickable link to home
 *   <Breadcrumb.Item href="/cat" />  ← Clickable link to category
 *   <Breadcrumb.Item />              ← Current page (no href)
 * </Breadcrumb>
 * ```
 *
 * **Usage Patterns:**
 * The Breadcrumb component supports two patterns:
 *
 * 1. **Items Array (Recommended):**
 *    ```tsx
 *    <Breadcrumb items={[
 *      { key: 'home', label: 'Home', href: '/' },
 *      { key: 'page', label: 'Current' },
 *    ]} />
 *    ```
 *
 * 2. **Compound Components:**
 *    ```tsx
 *    <Breadcrumb items={[]}>
 *      <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
 *      <Breadcrumb.Item>Current</Breadcrumb.Item>
 *    </Breadcrumb>
 *    ```
 *
 * @example Full Breadcrumb Layout
 * ```tsx
 * import { Breadcrumb } from '@rottay/design-system';
 *
 * <Breadcrumb items={[]}>
 *   <Breadcrumb.Item href="/" icon={<HomeIcon />}>
 *     Home
 *   </Breadcrumb.Item>
 *   <Breadcrumb.Item href="/products">
 *     Products
 *   </Breadcrumb.Item>
 *   <Breadcrumb.Item href="/products/electronics">
 *     Electronics
 *   </Breadcrumb.Item>
 *   <Breadcrumb.Item>
 *     Laptop Pro 15"
 *   </Breadcrumb.Item>
 * </Breadcrumb>
 * ```
 *
 * @module Breadcrumb/Compound
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Component Exports
// ============================================================================

export { BreadcrumbItem } from './Item';
export type { BreadcrumbItemProps } from './Item';
