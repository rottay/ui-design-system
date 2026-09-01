/**
 * @fileoverview Empty Types - Rottay Design System
 * @description Type definitions and constants for the Empty component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides type definitions and default configuration values
 * for the Empty component. The Empty component is used as a placeholder
 * when a container has no data to display, such as empty tables, search
 * results with no matches, or blank list views.
 *
 * **Type Categories:**
 * - `EmptyProps`: Main component properties (image, description, children, className, style)
 * - `EmptyImageType`: Image variant type ('default' | 'simple' | ReactNode)
 *
 * **Multi-Tenant Support:**
 * The Empty component uses design tokens for colors and spacing, ensuring
 * consistent appearance across tenant themes.
 *
 * @example Type Usage
 * ```tsx
 * import type { EmptyProps, EmptyImageType } from '@rottay/design-system';
 *
 * // Basic empty state
 * const props: EmptyProps = {
 *   image: 'simple',
 *   description: 'No data available',
 * };
 *
 * // Custom image type
 * const imageType: EmptyImageType = 'simple';
 * ```
 *
 * @example Default Values Usage
 * ```tsx
 * import { EMPTY_DEFAULTS } from '@rottay/design-system';
 *
 * // Access default configuration
 * console.log(EMPTY_DEFAULTS.description); // 'No Data'
 * console.log(EMPTY_DEFAULTS.image);       // 'default'
 * ```
 *
 * @see {@link EmptyProps} - Main component props
 * @see {@link EMPTY_DEFAULTS} - Default configuration values
 * @module Empty/types
 * @category Display
 * @package @rottay/design-system
 */

import type { ReactNode } from 'react';
import type { BaseComponentProps, WithChildren } from '../../../../../foundation/contracts/kernel/common';
import type { EngineAwareProps } from '../../../../../foundation/contracts/runtime/engine';

// ============================================================================
// Type Definitions
// ============================================================================

/** Preset image type for the empty state illustration. */
export type EmptyImageType = 'default' | 'simple' | 'custom';

export interface EmptyProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  image?: ReactNode | 'default' | 'simple';
  imageStyle?: React.CSSProperties;
  description?: ReactNode;
  /**
   * ARIA role for the placeholder region. Defaults to `status`, which makes the
   * region an implicit polite live region.
   *
   * Declaring it is what lets a caller silence or re-role a placeholder that is
   * already announced by its container — a table body that renders its own
   * "no results" summary would otherwise announce twice, with no way to opt out.
   */
  role?: string;
  /**
   * Live-region politeness. Defaults to `polite` only while `role` is the
   * default `status`: a caller who re-roles the region owns its announcement
   * semantics, and pinning `polite` under `role="alert"` would contradict it.
   */
  'aria-live'?: 'off' | 'polite' | 'assertive';
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration values for the Empty component.
 * Used by engine implementations to ensure consistent behavior
 * when no explicit props are provided.
 *
 * @constant
 *
 * @example Applying Defaults
 * ```tsx
 * import { EMPTY_DEFAULTS } from '@rottay/design-system';
 *
 * const MyEmpty = (props: EmptyProps) => {
 *   const description = props.description ?? EMPTY_DEFAULTS.description;
 *   const image = props.image ?? EMPTY_DEFAULTS.image;
 *   // ...
 * };
 * ```
 */
export const EMPTY_DEFAULTS = {
  /** Default description text shown below the empty state illustration. @default 'No Data' */
  description: 'No Data',

  /** Default image variant: 'default' shows the detailed illustration, 'simple' shows a minimal icon. @default 'default' */
  image: 'default' as const,
} as const;
