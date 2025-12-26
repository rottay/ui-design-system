/**
 * Empty Component - Type Definitions
 *
 * This module re-exports types from the centralized type system and provides
 * default values for the Empty component. The Empty component displays a
 * placeholder when no data is available.
 *
 * @module Empty/types
 * @category Display
 */

export type {
  EmptyProps,
  EmptyImageType,
} from '../../../../../types/primitives/display/Empty';

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
