/**
 * @fileoverview Tooltip Types - Rottay Design System
 * @description Type definitions for the Tooltip component and its compound components.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides comprehensive type definitions for the Tooltip component,
 * including props interfaces, placement options, trigger types, and default values.
 *
 * **Exported Types:**
 * - `TooltipProps` - Main component properties
 * - `TooltipPlacement` - Position options (12 positions)
 * - `TooltipTrigger` - Trigger event types
 * - `TooltipState` - Internal visibility state
 * - `TooltipTriggerProps` - Trigger compound component props
 * - `TooltipContentProps` - Content compound component props
 *
 * **Exported Constants:**
 * - `TOOLTIP_DEFAULTS` - Default prop values
 * - `PLACEMENT_MAP` - CSS position mappings
 *
 * @example Type Usage
 * ```tsx
 * import type { TooltipProps, TooltipPlacement } from '@rottay/design-system';
 *
 * const placement: TooltipPlacement = 'top-start';
 * const props: TooltipProps = {
 *   content: 'Tooltip text',
 *   placement,
 *   trigger: 'hover',
 * };
 * ```
 *
 * @see {@link Tooltip} for component implementation
 * @module Tooltip/types
 * @category Display
 * @package @rottay/design-system
 */

import type { ReactNode } from "react";
import type {
  BaseComponentProps,
  WithChildren,
} from "../../../../../foundation/contracts/kernel/common";
import type { EngineAwareProps } from "../../../../../foundation/contracts/runtime/engine";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Tooltip placement options combining edge and logical alignment. `start` and
 * `end` follow writing direction on the inline axis, so a `top-start` tooltip
 * aligns to the right edge in RTL.
 */
export type TooltipPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

/**
 * Tooltip trigger.
 */
export type TooltipTrigger = "hover" | "click" | "focus" | "manual";

/** Touch equivalent for hover-only tooltip discovery. */
export type TooltipTouchBehavior = "long-press" | "none";

/**
 * Bounded visual recipes for the Modern engine. Recipes alter coordinated
 * material, density and typography tokens without changing tooltip anatomy.
 */
export type TooltipRecipe = "minimal" | "bordered" | "inverse" | "rich";

/** Explicit local density override; omitted values inherit the tenant scope. */
export type TooltipDensity = "compact" | "comfortable" | "spacious";

/**
 * Tooltip component props.
 */
export interface TooltipProps
  extends BaseComponentProps,
    EngineAwareProps,
    WithChildren {
  /**
   * Tooltip content.
   *
   * Keep non-interactive tooltips concise. When content contains focusable
   * controls, set `interactive` (which promotes the relationship to a dialog)
   * or prefer Popover for workflow-critical content.
   */
  content: ReactNode;

  /**
   * Tooltip placement.
   * @default 'top'
   */
  placement?: TooltipPlacement;

  /**
   * Trigger that opens the tooltip.
   * @default 'hover'
   */
  trigger?: TooltipTrigger | TooltipTrigger[];

  /**
   * Whether the tooltip is visible (controlled mode).
   */
  visible?: boolean;

  /**
   * Whether the tooltip is visible by default (uncontrolled mode).
   */
  defaultVisible?: boolean;

  /**
   * Visibility change callback.
   */
  onVisibleChange?: (visible: boolean) => void;

  /**
   * Delay in ms before showing the tooltip.
   * @default 200
   */
  showDelay?: number;

  /**
   * Delay in ms before hiding the tooltip.
   * @default 0
   */
  hideDelay?: number;

  /**
   * Touch equivalent for a hover-only tooltip. `long-press` keeps incidental
   * taps available to the trigger while making its description discoverable
   * on coarse pointers. Click-triggered tooltips already work with touch and
   * do not need this fallback.
   * @default 'long-press'
   */
  touchBehavior?: TooltipTouchBehavior;

  /**
   * Duration in milliseconds before a touch becomes a long press.
   * @default 500
   */
  touchLongPressDelay?: number;

  /**
   * Tooltip color.
   * @default 'default'
   */
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "error";

  /**
   * Coordinated tooltip material/density recipe.
   * @default 'bordered'
   */
  recipe?: TooltipRecipe;

  /**
   * Local density override. When omitted, the tooltip inherits the active
   * tenant density, including when its bubble is rendered through a portal.
   */
  density?: TooltipDensity;

  /**
   * Whether to show the tooltip arrow.
   * @default true
   */
  arrow?: boolean;

  /**
   * Tooltip border radius.
   * @default 'md'
   */
  radius?: "none" | "sm" | "md" | "lg";

  /**
   * Offset from the trigger element.
   * @default 8
   */
  offset?: number;

  /**
   * Whether the tooltip is disabled.
   * Disabling tooltip behavior never changes the visual state of its trigger.
   */
  disabled?: boolean;

  /**
   * Tooltip z-index.
   */
  zIndex?: number;

  /**
   * Maximum width of the tooltip.
   * @default 300
   */
  maxWidth?: number | string;

  /**
   * Tooltip trigger element.
   */
  children: ReactNode;

  /**
   * Whether to allow interaction with overlay content. The Modern engine
   * promotes interactive content to a non-modal `dialog` relationship because
   * ARIA tooltips cannot contain focusable controls; use Popover for larger or
   * workflow-critical interactive surfaces.
   * @default false
   */
  interactive?: boolean;

  /**
   * Optional keyboard shortcut to render as key chips alongside `content`
   * (e.g. `'ctrl+k'`, `'g+i'`). Formatted via `formatShortcutKey` from
   * `hooks/shortcuts`. Display-only -- passing this does NOT register a
   * keyboard listener; the caller is still responsible for binding the
   * actual shortcut (e.g. via `useGlobalShortcut`).
   */
  shortcut?: string;
}

/**
 * Tooltip state.
 */
export interface TooltipState {
  /** Whether visible */
  visible: boolean;
  /** Calculated position */
  position?: { x: number; y: number };
  /** Whether hovering */
  hovering: boolean;
}

// ============================================================================
// Compound Component Props
// ============================================================================

/**
 * Props for the Tooltip.Trigger compound component.
 * Used to wrap the element that triggers the tooltip.
 */
export interface TooltipTriggerProps extends BaseComponentProps {
  /**
   * The trigger element that activates the tooltip.
   * Must be a valid React element.
   */
  children: React.ReactElement;

  /**
   * When true, clones props to the child element instead of wrapping.
   * Useful for preserving the original element type.
   * @default false
   */
  asChild?: boolean;
}

/**
 * Props for the Tooltip.Content compound component.
 * Used to define the content displayed within the tooltip.
 */
export interface TooltipContentProps extends BaseComponentProps {
  /**
   * The content to display inside the tooltip.
   * Can be any valid React node.
   */
  children: React.ReactNode;

  /**
   * Whether to show the tooltip arrow.
   * @default true
   */
  arrow?: boolean;

  /**
   * Side of the tooltip where the arrow appears.
   * @default 'top'
   */
  side?: "top" | "bottom" | "left" | "right";
}

/**
 * Default values for Tooltip component props.
 * Used across all engine implementations for consistent defaults.
 */
export const TOOLTIP_DEFAULTS = {
  /** Default placement position */
  placement: "top" as const,
  /** Default trigger type */
  trigger: "hover" as const,
  /** Whether to show arrow by default */
  arrow: true,
  /** Default delay before showing tooltip (ms) */
  showDelay: 200,
  /** Default delay before hiding tooltip (ms) */
  hideDelay: 0,
  /** Default coarse-pointer discovery behavior */
  touchBehavior: "long-press" as const,
  /** Deliberate enough to avoid competing with ordinary taps */
  touchLongPressDelay: 500,
  /** Default tooltip color */
  color: "default" as const,
  /** Default coordinated Modern recipe */
  recipe: "bordered" as const,
  /** Default border radius */
  radius: "md" as const,
  /** Default offset from trigger element (px) */
  offset: 8,
  /** Default max width (px) */
  maxWidth: 300,
  /** Default disabled state */
  disabled: false,
  /** Default interactive state */
  interactive: false,
};

/**
 * Placement to CSS position mapping.
 *
 * Maps each of the 12 tooltip placement options to the inline CSS
 * positioning properties needed to render the tooltip relative to
 * its trigger element. Used by engine implementations to calculate
 * the absolute position of the tooltip container.
 *
 * Placement naming convention:
 * - `{side}` - centered along the given side.
 * - `{side}-start` - aligned to the start edge (left or top).
 * - `{side}-end` - aligned to the end edge (right or bottom).
 *
 * @constant
 */
export const PLACEMENT_MAP: Record<string, React.CSSProperties> = {
  top: { bottom: "100%", left: "50%", transform: "translateX(-50%)" },
  "top-start": { bottom: "100%", left: "0" },
  "top-end": { bottom: "100%", right: "0" },
  bottom: { top: "100%", left: "50%", transform: "translateX(-50%)" },
  "bottom-start": { top: "100%", left: "0" },
  "bottom-end": { top: "100%", right: "0" },
  left: { right: "100%", top: "50%", transform: "translateY(-50%)" },
  "left-start": { right: "100%", top: "0" },
  "left-end": { right: "100%", bottom: "0" },
  right: { left: "100%", top: "50%", transform: "translateY(-50%)" },
  "right-start": { left: "100%", top: "0" },
  "right-end": { left: "100%", bottom: "0" },
};
