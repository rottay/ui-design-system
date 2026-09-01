'use client';

/**
 * @fileoverview Cascader Component - Rottay Design System
 * @description A hierarchical multi-level selection component for navigating
 * nested data structures with expandable dropdown panels.
 *
 * @remarks
 * The Cascader component provides hierarchical selection for:
 * - **Location selection**: Country → State → City → District
 * - **Category navigation**: Department → Category → Subcategory
 * - **Organization hierarchy**: Company → Division → Team
 * - **Product classification**: Type → Brand → Model
 *
 * Key features:
 * - **Multi-engine support**: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla)
 * - **Expand triggers**: Click or hover to expand children
 * - **Multiple selection**: Select multiple leaf nodes
 * - **Search support**: Filter options with search input
 * - **Custom display**: Custom render for selected path
 * - **Async loading**: Load children dynamically
 * - **Controlled/uncontrolled**: Full state management flexibility
 *
 * @example Basic cascader with location data
 * ```tsx
 * import { Cascader } from '@rottay/design-system';
 *
 * const options = [
 *   {
 *     value: 'california',
 *     label: 'California',
 *     children: [
 *       { value: 'san-francisco', label: 'San Francisco' },
 *       { value: 'los-angeles', label: 'Los Angeles' },
 *     ],
 *   },
 * ];
 *
 * <Cascader
 *   options={options}
 *   placeholder="Select location"
 *   onChange={(value, options) => console.log(value, options)}
 * />
 * ```
 *
 * @example Multiple selection
 * ```tsx
 * <Cascader
 *   options={options}
 *   multiple
 *   maxTagCount={3}
 *   onChange={(values) => setSelectedLocations(values)}
 * />
 * ```
 *
 * @example Expand on hover
 * ```tsx
 * <Cascader
 *   options={options}
 *   expandTrigger="hover"
 *   placeholder="Hover to expand"
 * />
 * ```
 *
 * @example With search functionality
 * ```tsx
 * <Cascader
 *   options={options}
 *   showSearch
 *   placeholder="Search locations..."
 * />
 * ```
 *
 * @example Custom display render
 * ```tsx
 * <Cascader
 *   options={options}
 *   displayRender={(labels) => labels.join(' → ')}
 * />
 * ```
 *
 * @example Multi-engine usage
 * ```tsx
 * // Classic engine (Ant Design - default)
 * <Cascader engine="classic" options={options} showSearch />
 *
 * // Modern engine (DaisyUI/Tailwind)
 * <Cascader engine="modern" options={options} size="large" />
 *
 * // Rustic engine (Pure HTML/CSS)
 * <Cascader engine="rustic" options={options} />
 * ```
 *
 * @see {@link CascaderProps} for component props
 * @see {@link CascaderOption} for option structure
 * @module Cascader
 * @category Inputs
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { CascaderProps } from './contracts';

// Export types
export {
  type CascaderProps,
  type CascaderOption,
  type CascaderValue,
  type CascaderSize,
  type LegacyCascaderSize,
  type CascaderExpandTrigger,
  CASCADER_DEFAULTS,
} from './contracts';

/**
 * Create engine-aware Cascader component.
 *
 * The Cascader component automatically selects the appropriate rendering engine
 * based on the current context or explicit engine prop.
 *
 * Engines:
 * - **classic**: Full-featured implementation using Ant Design (default)
 * - **modern**: Lightweight implementation using DaisyUI/Tailwind
 * - **rustic**: Headless implementation using vanilla HTML/CSS
 */
export const Cascader = createEngineComponent<CascaderProps>('Cascader', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

export default Cascader;
