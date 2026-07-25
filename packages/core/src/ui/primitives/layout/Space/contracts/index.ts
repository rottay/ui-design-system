/**
 * @fileoverview Space Component Types - Rottay Design System
 * @description Type definitions for the Space layout component including props,
 * size presets, direction options, alignment values, and configuration constants.
 *
 * @remarks
 * The Space component types support:
 * - Preset sizes (small, middle, large) mapped to CSS variables
 * - Custom numeric pixel values
 * - Asymmetric [horizontal, vertical] gap arrays
 * - Horizontal and vertical flow directions
 * - Flexbox alignment options
 * - Split separator elements
 *
 * @example Type Usage
 * ```tsx
 * import type { SpaceProps, SpaceSize, SpaceDirection } from '@rottay/design-system';
 *
 * const customSpace: SpaceProps = {
 *   size: 'middle',
 *   direction: 'vertical',
 *   wrap: true,
 *   align: 'start',
 * };
 * ```
 *
 * @module Space/Types
 * @category Layout
 * @package @rottay/design-system
 */
import type { AriaRole, ReactNode } from "react";
import type {
  BaseComponentProps,
  EngineAwareProps,
  Size,
} from "../../../../../foundation/contracts";

/**
 * Preset size options for the Space component, derived from the canonical {@link Size} scale.
 * Each size maps to a CSS variable for consistent theming.
 *
 * @remarks
 * - `sm`: Compact spacing (default: 8px)
 * - `md`: Standard spacing (default: 16px)
 * - `lg`: Generous spacing (default: 24px)
 */
export type SpaceSize = Extract<Size, "sm" | "md" | "lg">;

/**
 * @deprecated Legacy antd-style spelling; use {@link SpaceSize} ('sm' | 'md' | 'lg') instead.
 * Retained for one release so existing values keep compiling.
 */
export type LegacySpaceSize = "small" | "middle" | "large";

/**
 * Flow direction for Space component.
 *
 * @remarks
 * - `horizontal`: Items flow left-to-right (default)
 * - `vertical`: Items flow top-to-bottom
 */
export type SpaceDirection = "horizontal" | "vertical";

/**
 * Cross-axis alignment options for Space items.
 * Maps to CSS `align-items` values.
 *
 * @remarks
 * - `start`: Align to flex-start
 * - `end`: Align to flex-end
 * - `center`: Center alignment (default)
 * - `baseline`: Align to text baseline
 */
export type SpaceAlign = "start" | "end" | "center" | "baseline";

/**
 * Props for the Space component.
 *
 * @interface SpaceProps
 * @example
 * ```tsx
 * <Space
 *   size="middle"
 *   direction="horizontal"
 *   wrap={true}
 *   align="center"
 *   split={<Divider orientation="vertical" />}
 * >
 *   <Button>Action 1</Button>
 *   <Button>Action 2</Button>
 * </Space>
 * ```
 */
export interface SpaceProps extends BaseComponentProps, EngineAwareProps {
  /**
   * Size of spacing between items.
   * - Preset: 'sm' | 'md' | 'lg' (or the deprecated 'small' | 'middle' | 'large' spelling)
   * - Number: Custom pixel value (e.g., 16)
   * - Array: [horizontal, vertical] gaps (e.g., [8, 16])
   * @default 'small'
   */
  size?: SpaceSize | LegacySpaceSize | number | [number, number];

  /**
   * Direction of item flow.
   * @default 'horizontal'
   */
  direction?: SpaceDirection;

  /**
   * Whether items should wrap to new lines when they overflow.
   * @default false
   */
  wrap?: boolean;

  /**
   * Cross-axis alignment of items.
   * @default 'center'
   */
  align?: SpaceAlign;

  /**
   * Element to render between each child item.
   * Useful for dividers or custom separators.
   */
  split?: ReactNode;

  /** Child elements to space out. */
  children?: ReactNode;

  /** Optional semantic grouping role forwarded to the root. */
  role?: AriaRole;
  /** BCP 47 language metadata for localized groups. */
  lang?: string;
  /** Logical direction; horizontal flow follows this value automatically. */
  dir?: "ltr" | "rtl" | "auto";
}

/**
 * Default values for Space component props.
 * Used when props are not explicitly provided.
 */
export const SPACE_DEFAULTS: Partial<SpaceProps> = {
  size: "small",
  direction: "horizontal",
  wrap: false,
  align: "center",
};

/**
 * Size values mapped to CSS custom property tokens.
 * Enables consistent theming across the design system.
 *
 * @remarks
 * These CSS variables should be defined in the theme:
 * - `--ds-space-small-size`: Default 8px
 * - `--ds-space-middle-size`: Default 16px
 * - `--ds-space-large-size`: Default 24px
 */
export const SPACE_SIZE_MAP: Record<LegacySpaceSize, string> = {
  small: "var(--ds-space-small-size)",
  middle: "var(--ds-space-middle-size)",
  large: "var(--ds-space-large-size)",
};

/**
 * Mapping from SpaceAlign values to CSS align-items values.
 * Used by engine implementations for cross-axis alignment.
 */
export const SPACE_ALIGN_MAP: Record<SpaceAlign, string> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  baseline: "baseline",
};
