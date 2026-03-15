/**
 * @fileoverview Empty Types - Rottay Design System
 * @description Type definitions and constants for the Empty component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module re-exports types from the centralized type system and provides
 * default configuration values for the Empty component.
 *
 * **Exported Types:**
 * - `EmptyProps` - Main component properties
 * - `EmptyImageType` - Image variant type ('default' | 'simple' | ReactNode)
 *
 * **Exported Constants:**
 * - `EMPTY_DEFAULTS` - Default configuration values
 *
 * @example Type Usage
 * ```tsx
 * import type { EmptyProps, EmptyImageType } from '@rottay/design-system';
 *
 * const props: EmptyProps = {
 *   image: 'simple',
 *   description: 'No data available',
 * };
 * ```
 *
 * @see {@link Empty} for component implementation
 * @module Empty/types
 * @category Display
 * @package @rottay/design-system
 */

export type {
  EmptyProps,
  EmptyImageType,
} from '../../../../contracts/primitives/display/Empty';

/**
 * Default configuration values for the Empty component.
 * These values are used when no explicit props are provided.
 */
export const EMPTY_DEFAULTS = {
  /** Default description text when no data is present */
  description: 'No Data',
  /** Default image type to display */
  image: 'default' as const,
} as const;
