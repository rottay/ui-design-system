/**
 * @fileoverview Segmented Types - Rottay Design System
 * @description Type definitions for the Segmented component.
 * Part of the Rottay Design System's navigation primitives collection.
 *
 * @remarks
 * This module defines the core TypeScript interfaces for the Segmented component.
 * The types are designed to work across all three rendering engines (Classic,
 * Modern, Rustic) while providing a consistent API for developers.
 *
 * **Type Categories:**
 * - `SegmentedOption`: Individual option object with label, value, icon, and disabled state
 * - `SegmentedSize`: Size steps of the public `size` prop ('sm' | 'md' | 'lg')
 * - `SegmentedEngineSize`: The spelling the engines key their size lookups by
 * - `SegmentedEngineProps`: Props every engine implements
 *
 * **Multi-Tenant Support:**
 * Props are designed to be compatible with tenant theming and engine switching,
 * ensuring consistent behavior across different configurations.
 *
 * @example Type Usage
 * ```tsx
 * import type { SegmentedProps, SegmentedOption } from '@rottay/design-system';
 *
 * // Custom segmented wrapper with typed props
 * interface CustomSegmentedProps extends SegmentedProps {
 *   customLabel?: string;
 * }
 *
 * // Type-safe option creation
 * const options: SegmentedOption[] = [
 *   { label: 'Daily', value: 'daily', icon: <DailyIcon /> },
 *   { label: 'Weekly', value: 'weekly', icon: <WeeklyIcon /> },
 * ];
 * ```
 *
 * @example Default Values Usage
 * ```tsx
 * import { SEGMENTED_DEFAULTS } from '@rottay/design-system';
 *
 * // Access default configuration
 * console.log(SEGMENTED_DEFAULTS.size);     // 'middle'
 * console.log(SEGMENTED_DEFAULTS.block);    // false
 * console.log(SEGMENTED_DEFAULTS.disabled); // false
 * ```
 *
 * @see {@link SegmentedProps} - Main component props
 * @see {@link SegmentedOption} - Individual option interface
 * @see {@link SEGMENTED_DEFAULTS} - Default configuration values
 * @module Segmented/Types
 * @category Navigation
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from "react";
import type { EngineAwareProps } from "../../../../../foundation/contracts";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Size steps of the public `size` prop.
 *
 * | Value | Use Case |
 * |-------|----------|
 * | `sm` | Compact UIs, toolbars |
 * | `md` | Standard forms (default) |
 * | `lg` | Touch-friendly interfaces |
 */
export type SegmentedSize = "sm" | "md" | "lg";

/**
 * The spelling the engines key their size lookups by: the Ant Design component
 * of the Classic engine, the style table of the Rustic engine and the
 * `data-size` stamp the Modern skin selects on. The facade resolves a
 * {@link SegmentedSize} step to it before an engine is chosen.
 */
export type SegmentedEngineSize = "large" | "middle" | "small";

/**
 * Resolves a public size step to the spelling the engines read. A value outside
 * the three steps is returned unchanged.
 */
export function toSegmentedEngineSize(
  size: SegmentedSize | undefined,
): SegmentedEngineSize | undefined {
  if (size === "sm") return "small";
  if (size === "md") return "middle";
  if (size === "lg") return "large";
  return size;
}

/**
 * Individual option configuration for the Segmented component.
 * Allows rich content with icons and custom styling per option.
 *
 * @interface SegmentedOption
 *
 * @example Basic Option
 * ```tsx
 * const option: SegmentedOption = {
 *   label: 'Daily',
 *   value: 'daily',
 * };
 * ```
 *
 * @example Option with Icon
 * ```tsx
 * const option: SegmentedOption = {
 *   label: 'Grid View',
 *   value: 'grid',
 *   icon: <GridIcon />,
 * };
 * ```
 *
 * @example Disabled Option
 * ```tsx
 * const option: SegmentedOption = {
 *   label: 'Premium',
 *   value: 'premium',
 *   disabled: true,
 *   className: 'premium-option',
 * };
 * ```
 */
export interface SegmentedOption {
  // ---------------------------------------------------------------------------
  // Required Properties
  // ---------------------------------------------------------------------------

  /**
   * The display content for the option.
   * Can be a string, number, or any React node.
   * @example "Daily"
   * @example <><Icon /> Daily</>
   */
  label: ReactNode;

  /**
   * The unique value for this option.
   * Used for controlled state and onChange callbacks.
   * @example "daily"
   * @example 1
   */
  value: string | number;

  // ---------------------------------------------------------------------------
  // Optional Properties
  // ---------------------------------------------------------------------------

  /**
   * Optional icon displayed before the label.
   * Rendered inline with the label text.
   * @example <CalendarIcon />
   * @example <img src="/icon.svg" alt="" />
   */
  icon?: ReactNode;

  /**
   * Whether this specific option is disabled.
   * Disabled options cannot be selected and appear visually muted.
   * @default false
   */
  disabled?: boolean;

  /**
   * Additional CSS class name for this option.
   * Useful for custom styling of specific options.
   * @example "premium-tier"
   */
  className?: string;

  /** Accessible name when the visual label is icon-only or abbreviated. */
  ariaLabel?: string;
}

// ============================================================================
// Props Interface
// ============================================================================

/**
 * Props every Segmented engine implements. The public props of the `Segmented`
 * component are these with `size` narrowed to {@link SegmentedSize}; they are
 * declared next to the component.
 *
 * @interface SegmentedEngineProps
 *
 * @example Complete Usage
 * ```tsx
 * <Segmented
 *   options={[
 *     { label: 'List', value: 'list', icon: <ListIcon /> },
 *     { label: 'Grid', value: 'grid', icon: <GridIcon /> },
 *     { label: 'Map', value: 'map', icon: <MapIcon />, disabled: true },
 *   ]}
 *   value={viewMode}
 *   defaultValue="list"
 *   onChange={(val) => setViewMode(val)}
 *   block={false}
 *   disabled={false}
 *   size="md"
 *   className="view-selector"
 *   style={{ marginBottom: 16 }}
 * />
 * ```
 */
export interface SegmentedEngineProps extends EngineAwareProps {
  /** Caller-owned root anatomy hook (P-79). */
  "data-part"?: string;
  // ---------------------------------------------------------------------------
  // Options Configuration
  // ---------------------------------------------------------------------------

  /**
   * Array of options for the segmented control.
   * Can be simple strings/numbers or rich SegmentedOption objects.
   *
   * @example Simple options
   * ```tsx
   * options={['Daily', 'Weekly', 'Monthly']}
   * ```
   *
   * @example Object options
   * ```tsx
   * options={[
   *   { label: 'Daily', value: 'daily' },
   *   { label: 'Weekly', value: 'weekly' },
   * ]}
   * ```
   */
  options: (string | number | SegmentedOption)[];

  // ---------------------------------------------------------------------------
  // Value Control
  // ---------------------------------------------------------------------------

  /**
   * Currently selected value (controlled mode).
   * When set, component becomes controlled and requires onChange.
   */
  value?: string | number;

  /**
   * Default selected value (uncontrolled mode).
   * Used when component manages its own state.
   */
  defaultValue?: string | number;

  /**
   * Callback fired when selection changes.
   * Receives the new selected value.
   * @param value - The newly selected option value
   */
  onChange?: (value: string | number) => void;

  // ---------------------------------------------------------------------------
  // Display Options
  // ---------------------------------------------------------------------------

  /**
   * Whether the segmented control fills its container width.
   * When true, options expand to fill available space equally.
   * @default false
   */
  block?: boolean;

  /**
   * Whether the entire segmented control is disabled.
   * When true, no options can be selected.
   * @default false
   */
  disabled?: boolean;

  /**
   * Size preset for the segmented control, in the engine spelling.
   * Affects padding, font size, and overall height.
   *
   * @default 'middle'
   */
  size?: SegmentedEngineSize;

  /** Accessible name for the grouped choice control. */
  ariaLabel?: string;

  // ---------------------------------------------------------------------------
  // Styling
  // ---------------------------------------------------------------------------

  /**
   * Additional CSS class name for the container.
   * Applied to the outermost element.
   */
  className?: string;

  /**
   * Inline styles for the container.
   * Applied to the outermost element.
   */
  style?: CSSProperties;
}

/** The props type the engines import. */
export type SegmentedProps = SegmentedEngineProps;

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration values for the Segmented component.
 * Used by engine implementations to ensure consistent behavior.
 *
 * @constant
 *
 * @example Accessing Defaults
 * ```tsx
 * import { SEGMENTED_DEFAULTS } from '@rottay/design-system';
 *
 * const MySegmented = (props: SegmentedEngineProps) => {
 *   const size = props.size ?? SEGMENTED_DEFAULTS.size;
 *   const block = props.block ?? SEGMENTED_DEFAULTS.block;
 *   // ...
 * };
 * ```
 */
export const SEGMENTED_DEFAULTS: Partial<SegmentedProps> = {
  /** Default size is middle, in the engine spelling */
  size: "middle",

  /** Not block mode by default */
  block: false,

  /** Not disabled by default */
  disabled: false,
};
