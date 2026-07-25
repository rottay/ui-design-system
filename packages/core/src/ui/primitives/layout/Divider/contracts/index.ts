/**
 * @fileoverview Divider Types - Rottay Design System
 * @description Type definitions for the Divider component.
 * Part of the Rottay Design System's layout primitives collection.
 *
 * @remarks
 * This module defines all TypeScript interfaces, types, and constants for the
 * Divider component. These types are shared across all engine implementations.
 *
 * @module DividerTypes
 * @category Layout
 * @package @rottay/design-system
 */

import type {
  BaseComponentProps,
  EngineAwareProps,
} from "../../../../../foundation/contracts";
import type { ReactNode, CSSProperties } from "react";

/**
 * Orientation of the divider line.
 * - 'horizontal': Creates a horizontal line across the container width
 * - 'vertical': Creates a vertical line across the container height
 */
export type DividerOrientation = "horizontal" | "vertical";

/**
 * Visual style of the divider line.
 * - 'solid': Continuous line
 * - 'dashed': Series of short dashes
 * - 'dotted': Series of dots
 */
export type DividerVariant = "solid" | "dashed" | "dotted";

/**
 * Position of the text content within the divider.
 * Only applies when children are provided.
 * - 'start': Text aligned to logical inline start (recommended)
 * - 'center': Text centered (default)
 * - 'end': Text aligned to logical inline end (recommended)
 * - 'left'/'right': Deprecated aliases retained for source compatibility;
 *   they resolve to start/end so RTL never requires application-side inversion.
 */
export type DividerLogicalTextPosition = "start" | "center" | "end";
export type DividerTextPosition = DividerLogicalTextPosition | "left" | "right";

/**
 * Thickness preset for the divider line.
 * - 'thin': 1px line
 * - 'medium': 2px line (default)
 * - 'thick': 3px line
 */
export type DividerThicknessPreset = "thin" | "medium" | "thick";

/**
 * Thickness of the divider line - can be a preset or custom pixel value.
 */
export type DividerThickness = DividerThicknessPreset | number;

/**
 * Spacing/margin preset around the divider.
 * - 'none': No margin
 * - 'xs': Extra small margin (0.25rem)
 * - 'sm': Small margin (0.5rem)
 * - 'md': Medium margin (1rem) - default
 * - 'lg': Large margin (1.5rem)
 * - 'xl': Extra large margin (2rem)
 */
export type DividerSpacing = "none" | "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Props for the Divider component.
 */
export interface DividerProps extends BaseComponentProps, EngineAwareProps {
  /**
   * Orientation of the divider.
   * @default 'horizontal'
   */
  orientation?: DividerOrientation;
  /**
   * Alias for orientation prop.
   * @default 'horizontal'
   */
  type?: DividerOrientation;
  /**
   * Visual style variant of the divider line.
   * @default 'solid'
   */
  variant?: DividerVariant;
  /**
   * Shorthand for variant="dashed".
   * @default false
   */
  dashed?: boolean;
  /**
   * Optional text or content to display in the center of the divider.
   * Only works with horizontal orientation.
   */
  children?: ReactNode;
  /**
   * Position of the text content.
   * Only applies when children are provided.
   * Prefer logical `start`/`end`; `left`/`right` are compatibility aliases.
   * @default 'center'
   */
  textPosition?: DividerTextPosition;
  /**
   * Alias for textPosition prop (for backwards compatibility with some libraries).
   * @deprecated Use textPosition instead
   */
  orientationMargin?: DividerTextPosition;
  /**
   * Display text without styling (plain text).
   * When true, text won't have extra font styling.
   * @default false
   */
  plain?: boolean;
  /**
   * Color of the divider line.
   * Can be any valid CSS color value.
   */
  color?: string;
  /**
   * Thickness of the divider line.
   * Can be a preset ('thin', 'medium', 'thick') or a custom pixel value.
   * @default 'thin'
   */
  thickness?: DividerThickness;
  /**
   * Spacing (margin) around the divider.
   * @default 'md'
   */
  spacing?: DividerSpacing;
  /**
   * Alias for spacing prop (legacy support).
   * @deprecated Use spacing instead
   */
  margin?: DividerSpacing;
  /**
   * Additional CSS class name(s) for the component.
   */
  className?: string;
  /**
   * Inline CSS styles for the component.
   */
  style?: CSSProperties;
  /**
   * Test ID for testing purposes.
   */
  "data-testid"?: string;
  /** BCP 47 language metadata for an optional textual divider label. */
  lang?: string;
  /** Logical reading direction inherited by label placement. */
  dir?: "ltr" | "rtl" | "auto";
}

/**
 * Default values for the Divider component.
 */
export const DIVIDER_DEFAULTS: Partial<DividerProps> = {
  orientation: "horizontal",
  variant: "solid",
  dashed: false,
  textPosition: "center",
  plain: false,
  thickness: "thin",
  spacing: "md",
};

/**
 * Mapping of spacing presets — resolves through DS CSS custom properties.
 */
export const SPACING_MAP: Record<DividerSpacing, string> = {
  none: "0",
  xs: "var(--ds-spacing-1, 0.25rem)",
  sm: "var(--ds-spacing-2, 0.5rem)",
  md: "var(--ds-spacing-4, 1rem)",
  lg: "var(--ds-spacing-6, 1.5rem)",
  xl: "var(--ds-spacing-8, 2rem)",
};

/**
 * Mapping of thickness presets to CSS values.
 */
export const THICKNESS_MAP: Record<DividerThicknessPreset, string> = {
  thin: "var(--ds-divider-thickness-thin, 1px)",
  medium: "var(--ds-divider-thickness-medium, 2px)",
  thick: "var(--ds-divider-thickness-thick, 3px)",
};

/**
 * Converts a thickness value to its CSS equivalent.
 * Accepts preset names ('thin', 'medium', 'thick') or numeric pixel values.
 *
 * @param thickness - Thickness value: preset name or number in pixels
 * @returns CSS-compatible thickness value string
 */
export function getThicknessValue(
  thickness: DividerThickness | undefined
): string {
  if (thickness === undefined) return THICKNESS_MAP.thin;
  if (typeof thickness === "number") {
    return Number.isFinite(thickness) && thickness >= 0
      ? `${thickness}px`
      : THICKNESS_MAP.thin;
  }
  return THICKNESS_MAP[thickness] || THICKNESS_MAP.thin;
}

/**
 * Normalizes legacy physical labels onto the logical positioning contract.
 * Flexbox then mirrors `start`/`end` automatically through the inherited
 * writing direction, so consumers never branch on locale or `dir`.
 */
export function resolveDividerTextPosition(
  position: DividerTextPosition | undefined
): DividerLogicalTextPosition {
  if (position === "left") return "start";
  if (position === "right") return "end";
  return position ?? "center";
}

/**
 * Default colors for different themes/engines.
 */
export const DEFAULT_COLORS = {
  classic:
    "var(--ds-divider-color, var(--ds-color-border, rgba(5, 5, 5, 0.06)))",
  modern:
    "var(--ds-divider-color, var(--ds-color-border-subtle, var(--ds-color-border)))",
  rustic: "var(--ds-divider-color, #d9d9d9)",
};
