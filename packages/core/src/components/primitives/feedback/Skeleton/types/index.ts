/**
 * @fileoverview Skeleton Types - Rottay Design System
 * @description Type definitions for the Skeleton component and its compound components.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * This module defines the core TypeScript interfaces for the Skeleton component.
 * The types are designed to work across all three rendering engines (Classic,
 * Modern, Rustic) while providing a consistent API for developers.
 *
 * **Type Categories:**
 * - `SkeletonVariant`: Shape of the skeleton placeholder
 * - `SkeletonAnimation`: Animation type for loading effect
 * - `SkeletonProps`: Main component props interface
 *
 * **Multi-Tenant Support:**
 * Props extend `BaseComponentProps` and `EngineAwareProps` to ensure
 * compatibility with tenant theming and engine switching.
 *
 * @example Type Usage
 * ```tsx
 * import type { SkeletonProps, SkeletonVariant, SkeletonAnimation } from '@rottay/design-system';
 *
 * // Custom skeleton wrapper with typed props
 * interface CustomSkeletonProps extends SkeletonProps {
 *   customLoader?: React.ReactNode;
 * }
 *
 * // Type-safe variant handling
 * const variant: SkeletonVariant = 'circular';
 * const animation: SkeletonAnimation = 'pulse';
 * ```
 *
 * @example Default Values Usage
 * ```tsx
 * import { SKELETON_DEFAULTS } from '@rottay/design-system';
 *
 * // Access default configuration
 * console.log(SKELETON_DEFAULTS.variant);    // 'text'
 * console.log(SKELETON_DEFAULTS.animation);  // 'pulse'
 * console.log(SKELETON_DEFAULTS.rows);       // 3
 * ```
 *
 * @see {@link SkeletonProps} - Main component props
 * @see {@link SKELETON_DEFAULTS} - Default configuration values
 * @module Skeleton/Types
 * @category Feedback
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps, BaseComponentProps } from '../../../../../types';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Variant options for the Skeleton component.
 * Determines the shape of the skeleton placeholder.
 *
 * @type {string}
 *
 * | Value | Description |
 * |-------|-------------|
 * | `text` | Text line placeholder (default) |
 * | `circular` | Circle shape for avatars |
 * | `rectangular` | Rectangle with no border radius |
 * | `rounded` | Rectangle with rounded corners |
 */
export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

/**
 * Animation options for the Skeleton component.
 * Controls the loading animation effect.
 *
 * @type {string | boolean}
 *
 * | Value | Description |
 * |-------|-------------|
 * | `pulse` | Fade in/out animation (default) |
 * | `wave` | Shimmer wave animation |
 * | `false` | No animation |
 */
export type SkeletonAnimation = 'pulse' | 'wave' | false;

// ============================================================================
// Props Interface
// ============================================================================

/**
 * Props for the Skeleton component.
 *
 * @interface SkeletonProps
 * @extends {BaseComponentProps} - Standard props (className, style, id, etc.)
 * @extends {EngineAwareProps} - Engine selection support
 *
 * @example Complete Usage
 * ```tsx
 * <Skeleton
 *   variant="text"
 *   width={200}
 *   height={16}
 *   animation="pulse"
 *   active
 *   rows={3}
 *   avatar
 *   avatarSize={48}
 *   avatarShape="circle"
 *   paragraph={{ rows: 4 }}
 *   title
 *   className="custom-skeleton"
 * />
 * ```
 */
export interface SkeletonProps extends BaseComponentProps, EngineAwareProps {
  // ---------------------------------------------------------------------------
  // Styling
  // ---------------------------------------------------------------------------

  /**
   * Additional CSS class name for custom styling.
   */
  className?: string;

  /**
   * Inline styles applied to the skeleton container.
   */
  style?: CSSProperties;

  /**
   * Children elements (typically not used, skeleton is self-contained).
   */
  children?: ReactNode;

  // ---------------------------------------------------------------------------
  // Appearance
  // ---------------------------------------------------------------------------

  /**
   * Shape variant of the skeleton placeholder.
   * @default 'text'
   */
  variant?: SkeletonVariant;

  /**
   * Width of the skeleton element.
   * Number values are treated as pixels.
   * @example 200
   * @example '100%'
   * @example 'calc(100% - 40px)'
   */
  width?: number | string;

  /**
   * Height of the skeleton element.
   * Number values are treated as pixels.
   * @example 16
   * @example '1.5rem'
   * @example 'auto'
   */
  height?: number | string;

  // ---------------------------------------------------------------------------
  // Animation
  // ---------------------------------------------------------------------------

  /**
   * Animation type for the loading effect.
   * Set to `false` to disable animation.
   * @default 'pulse'
   */
  animation?: SkeletonAnimation;

  /**
   * Whether the skeleton animation is active.
   * @default true
   */
  active?: boolean;

  // ---------------------------------------------------------------------------
  // Text Configuration
  // ---------------------------------------------------------------------------

  /**
   * Number of skeleton rows for text variant.
   * Used when `paragraph` is true without specific rows.
   * @default 3
   */
  rows?: number;

  // ---------------------------------------------------------------------------
  // Avatar Configuration
  // ---------------------------------------------------------------------------

  /**
   * Whether to show an avatar skeleton placeholder.
   * @default false
   */
  avatar?: boolean;

  /**
   * Size of the avatar skeleton in pixels.
   * @default 40
   */
  avatarSize?: number;

  /**
   * Shape of the avatar skeleton.
   * @default 'circle'
   */
  avatarShape?: 'circle' | 'square';

  // ---------------------------------------------------------------------------
  // Content Structure
  // ---------------------------------------------------------------------------

  /**
   * Whether to show paragraph skeleton lines.
   * Can be a boolean or object with row configuration.
   * @example true
   * @example { rows: 4 }
   */
  paragraph?: boolean | { rows?: number };

  /**
   * Whether to show a title skeleton line.
   * Displays a wider line above paragraph lines.
   * @default false
   */
  title?: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration values for the Skeleton component.
 * Used by engine implementations to ensure consistent behavior.
 *
 * @constant
 *
 * @example Accessing Defaults
 * ```tsx
 * import { SKELETON_DEFAULTS } from '@rottay/design-system';
 *
 * const MySkeleton = (props: SkeletonProps) => {
 *   const variant = props.variant ?? SKELETON_DEFAULTS.variant;
 *   const animation = props.animation ?? SKELETON_DEFAULTS.animation;
 *   // ...
 * };
 * ```
 */
export const SKELETON_DEFAULTS: Partial<SkeletonProps> = {
  /** Default variant is text line */
  variant: 'text',

  /** Default animation is pulse */
  animation: 'pulse',

  /** Animation is active by default */
  active: true,

  /** Default number of paragraph rows */
  rows: 3,

  /** Default avatar size in pixels */
  avatarSize: 40,

  /** Default avatar shape is circle */
  avatarShape: 'circle',
};
