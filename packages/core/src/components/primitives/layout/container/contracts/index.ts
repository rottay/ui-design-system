/**
 * @fileoverview Container Types - Rottay Design System
 * @description Type definitions for the Container layout component.
 * Provides comprehensive typing for max-width, padding, and centering options.
 *
 * @remarks
 * The Container component uses a breakpoint-based max-width system that aligns
 * with common screen sizes. The type system provides both preset values and
 * support for custom numeric values.
 *
 * Preset Max-widths:
 * - `sm`: 640px - Mobile landscape / small tablet
 * - `md`: 768px - Tablet portrait
 * - `lg`: 1024px - Tablet landscape / small desktop (default)
 * - `xl`: 1280px - Desktop
 * - `2xl`: 1536px - Large desktop
 * - `full`: 100% - Full width
 *
 * @example Type Usage
 * ```tsx
 * import type { ContainerProps, ContainerMaxWidth, ContainerPadding } from '@rottay/design-system';
 *
 * // Create a page wrapper component
 * interface PageProps extends Partial<ContainerProps> {
 *   title: string;
 * }
 *
 * // Type-safe max-width values
 * const maxWidth: ContainerMaxWidth = 'lg';
 * const padding: ContainerPadding = 'md';
 * ```
 *
 * @see {@link Container} - The main Container component
 * @module Container/Types
 * @category Layout
 * @package @rottay/design-system
 */

import type { AriaRole, ReactNode } from "react";
import type {
  BaseComponentProps,
  EngineAwareProps,
} from "../../../../../foundation/contracts";

export type ContainerMaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full";
export type ContainerPadding = "none" | "sm" | "md" | "lg";

export interface ContainerProps extends BaseComponentProps, EngineAwareProps {
  /** Maximum width of the container */
  maxWidth?: ContainerMaxWidth | number;
  /** Center the container horizontally */
  center?: boolean;
  /** Padding inside the container */
  padding?: ContainerPadding | number;
  /** If true, container takes full width of parent */
  fluid?: boolean;
  /** Container content */
  children?: ReactNode;
  /** Optional landmark or grouping role forwarded to the root. */
  role?: AriaRole;
  /** BCP 47 language metadata for localized descendants. */
  lang?: string;
  /** Logical reading direction used by centering and descendant layout. */
  dir?: "ltr" | "rtl" | "auto";
}

export const CONTAINER_DEFAULTS: Partial<ContainerProps> = {
  center: true,
  padding: "md",
  fluid: false,
  maxWidth: "lg",
};

/** Max width values — resolves through DS CSS custom properties */
export const CONTAINER_MAX_WIDTHS: Record<ContainerMaxWidth, string> = {
  sm: "var(--ds-container-sm, 640px)",
  md: "var(--ds-container-md, 768px)",
  lg: "var(--ds-container-lg, 1024px)",
  xl: "var(--ds-container-xl, 1280px)",
  "2xl": "var(--ds-container-2xl, 1536px)",
  full: "100%",
};

/** Padding values — resolves through DS CSS custom properties */
export const CONTAINER_PADDINGS: Record<ContainerPadding, string> = {
  none: "0",
  sm: "var(--ds-spacing-2, 8px)",
  md: "var(--ds-spacing-4, 16px)",
  lg: "var(--ds-spacing-6, 24px)",
};
