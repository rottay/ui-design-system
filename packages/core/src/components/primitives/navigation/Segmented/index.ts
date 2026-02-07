'use client';

/**
 * @fileoverview Segmented Component - Rottay Design System
 * @description A segmented control component for switching between different views or options.
 * Part of the Rottay Design System's navigation primitives collection.
 *
 * @remarks
 * The Segmented component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Classic (Ant Design), Modern (DaisyUI), and Rustic
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - segmented styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * @example Basic Usage
 * ```tsx
 * import { Segmented } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   const [value, setValue] = useState('daily');
 *
 *   return (
 *     <Segmented
 *       options={['daily', 'weekly', 'monthly']}
 *       value={value}
 *       onChange={setValue}
 *     />
 *   );
 * }
 * ```
 *
 * @example With Icons and Labels
 * ```tsx
 * import { Segmented } from '@rottay/design-system';
 * import { ListIcon, GridIcon, CalendarIcon } from '@rottay/icons';
 *
 * <Segmented
 *   options={[
 *     { label: 'List', value: 'list', icon: <ListIcon /> },
 *     { label: 'Grid', value: 'grid', icon: <GridIcon /> },
 *     { label: 'Calendar', value: 'calendar', icon: <CalendarIcon /> },
 *   ]}
 *   value={viewMode}
 *   onChange={setViewMode}
 * />
 * ```
 *
 * @example Block Mode (Full Width)
 * ```tsx
 * <Segmented
 *   block
 *   options={['Option A', 'Option B', 'Option C']}
 *   value={selected}
 *   onChange={setSelected}
 * />
 * ```
 *
 * @example Different Sizes
 * ```tsx
 * // Small size
 * <Segmented size="small" options={['S', 'M', 'L']} />
 *
 * // Middle size (default)
 * <Segmented size="middle" options={['S', 'M', 'L']} />
 *
 * // Large size
 * <Segmented size="large" options={['S', 'M', 'L']} />
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Segmented automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <Segmented options={['Tab 1', 'Tab 2']}>
 *     {/* Uses ACME Corp's brand colors and styling *\/}
 *   </Segmented>
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <Segmented engine="modern" options={['Option 1', 'Option 2']}>
 *   {/* Renders with DaisyUI/Tailwind styling *\/}
 * </Segmented>
 * ```
 *
 * @see {@link SegmentedProps} for complete prop documentation
 * @see {@link SegmentedOption} for option object structure
 * @see {@link Tabs} for a related navigation component
 * @see {@link Radio} for single-select alternatives
 *
 * @module Segmented
 * @category Navigation
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { SegmentedProps } from './types';

// ============================================================================
// Type Exports
// ============================================================================

export { type SegmentedProps, type SegmentedOption, SEGMENTED_DEFAULTS } from './types';

// ============================================================================
// Main Component
// ============================================================================

/**
 * Segmented component with multi-engine support.
 *
 * @description
 * A segmented control for selecting between mutually exclusive options.
 * Ideal for:
 * - View switching (list/grid/calendar)
 * - Time period selection (daily/weekly/monthly)
 * - Filter toggles (all/active/completed)
 * - Size selectors (S/M/L/XL)
 * - Mode switches (light/dark/auto)
 *
 * @remarks
 * - Supports both controlled and uncontrolled modes
 * - Options can be simple strings/numbers or rich objects with icons
 * - Block mode stretches to fill container width
 * - Individual options can be disabled
 * - Fully accessible with keyboard navigation
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link SegmentedProps}
 * @returns React component for segmented selection
 *
 * @example
 * ```tsx
 * <Segmented
 *   options={[
 *     { label: 'Daily', value: 'daily' },
 *     { label: 'Weekly', value: 'weekly' },
 *     { label: 'Monthly', value: 'monthly' },
 *   ]}
 *   value={period}
 *   onChange={(val) => setPeriod(val)}
 *   size="middle"
 * />
 * ```
 */
export const Segmented = createEngineComponent<SegmentedProps>('Segmented', {
  /** Ant Design implementation - full-featured with animations */
  classic: () => import('./engines/classic'),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  modern: () => import('./engines/modern'),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  rustic: () => import('./engines/rustic'),
});

export default Segmented;
