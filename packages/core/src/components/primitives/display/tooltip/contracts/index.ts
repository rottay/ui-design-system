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
 * - `TooltipPlacement` - Position options (12 logical, plus 6 deprecated
 *   physical aliases of the inline sides)
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
 * Tooltip placement: a SIDE, optionally qualified by an edge ALIGNMENT.
 *
 * The side's inline axis is LOGICAL (WO-INV-01): `inline-start` is the
 * reader's near side and `inline-end` the far one, so one request means the
 * same thing in both reading directions and the bubble mirrors under
 * `dir=rtl` without the caller computing anything. The block sides keep
 * `top`/`bottom`, which no reading direction moves.
 *
 * The alignment (`-start`/`-end`) was already logical: it follows writing
 * direction on the inline axis, so a `top-start` tooltip aligns to the right
 * edge in RTL.
 *
 * `left`/`right` and their aligned forms are kept as deprecated aliases of the
 * logical sides -- the same migration table the overlay positioning runtime
 * publishes as `OVERLAY_PLACEMENT_ALIASES` -- so no caller breaks.
 *
 * ENGINE REACH, and it is a LIMITATION rather than a capability. Only the
 * Modern engine implements this vocabulary. It rewrites an alias to its logical
 * side, so a Modern tooltip asking for `left` mirrors under `dir=rtl`.
 *
 * The frozen Classic and Rustic engines implement the PHYSICAL vocabulary and
 * nothing else. They read the raw prop through a physical placement map:
 *
 * - `left`/`right` and their aligned forms land on the edge they name, in both
 *   reading directions -- unchanged, established behaviour.
 * - `inline-start`/`inline-end` and their aligned forms are NOT in that map.
 *   The engine falls back to `top`, deterministically and for every one of the
 *   six spellings. That fallback is a refusal, not support: it never guesses an
 *   inline edge and it never mirrors. It is pinned by
 *   `tests/Tooltip.frozen-placement-reach.test.tsx` so it cannot quietly become
 *   a half-implementation.
 *
 * And the refusal is AUDIBLE. In development the shared engine router refuses
 * the request before a frozen engine renders it -- an error naming the engine,
 * the spelling it cannot honor and the physical one that works -- so the
 * degraded paint is never mistaken for the requested placement. Production is
 * unchanged: the `top` fallback above is what ships, because a placement is not
 * worth crashing a customer over. The disposition is
 * `refuseFrozenPlacement`, stated by the owner of the placement vocabulary
 * itself and declared by the Tooltip at the boundary both the frozen and the
 * Modern paths cross.
 *
 * So: target the frozen engines with a physical spelling. The logical spellings
 * are Modern-only until those engines are unfrozen.
 */
export type TooltipPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "inline-start"
  | "inline-start-start"
  | "inline-start-end"
  | "inline-end"
  | "inline-end-start"
  | "inline-end-end"
  /** @deprecated Use `inline-start`. */
  | "left"
  /** @deprecated Use `inline-start-start`. */
  | "left-start"
  /** @deprecated Use `inline-start-end`. */
  | "left-end"
  /** @deprecated Use `inline-end`. */
  | "right"
  /** @deprecated Use `inline-end-start`. */
  | "right-start"
  /** @deprecated Use `inline-end-end`. */
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

/** Absolute offsets of a bubble around its trigger, per placement. */
export interface TooltipPlacementOffsets {
  readonly top?: string;
  readonly right?: string;
  readonly bottom?: string;
  readonly left?: string;
  readonly transform?: string;
}

/**
 * Placement to position offsets.
 *
 * Maps the physical tooltip placement spellings to the offsets the frozen
 * Rustic engine applies around its trigger. The Modern engine positions its
 * bubble through the shared overlay kernel and does not read this map.
 *
 * The logical inline sides have no row here ON PURPOSE. This engine is frozen,
 * it has no direction authority and no mirroring machinery, and a row inventing
 * one would be new behaviour in a frozen engine. Its caller resolves a missing
 * key to the `top` row, which is a documented refusal -- stated out loud in
 * development by `refuseFrozenPlacement`, see
 * {@link TooltipPlacement}. Do not add logical rows to make a gate green.
 *
 * Placement naming convention:
 * - `{side}` - centered along the given side.
 * - `{side}-start` - aligned to the start edge (left or top).
 * - `{side}-end` - aligned to the end edge (right or bottom).
 *
 * @constant
 */
export const PLACEMENT_MAP: Record<string, TooltipPlacementOffsets> = {
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
