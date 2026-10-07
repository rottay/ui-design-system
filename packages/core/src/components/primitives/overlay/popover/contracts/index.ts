/**
 * @fileoverview Popover Component Types - Rottay Design System
 * @description Type definitions for the Popover component including trigger types,
 * placement options (12 positions), delay configurations, and component props.
 *
 * @remarks
 * The Popover types provide comprehensive configuration for:
 * - Trigger methods: click, hover, or focus activation
 * - Placement options: 12 positions around the trigger element
 * - Delay configurations: mouse enter/leave timing control
 * - Controlled/uncontrolled state management
 * - Styling options: overlays, z-index, and custom classes
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   PopoverProps,
 *   PopoverTrigger,
 *   PopoverPlacement,
 * } from '@rottay/design-system';
 *
 * const props: PopoverProps = {
 *   content: 'Help text here',
 *   title: 'Information',
 *   trigger: 'click',
 *   placement: 'rightTop',
 *   mouseEnterDelay: 200,
 * };
 * ```
 *
 * @module Popover/Types
 * @category Overlay
 * @package @rottay/design-system
 */
import type { ReactNode, CSSProperties, RefObject } from 'react';
import type { DensityPosture } from '@/foundation/tokens/ts/foundation/base/density';
import type { OverlayPlacement } from '../../../runtime/overlay/positioning';

/**
 * Trigger methods for opening the popover.
 * - 'click': Opens on click
 * - 'hover': Opens on mouse hover
 * - 'focus': Opens when element receives focus
 */
export type PopoverTrigger = 'click' | 'hover' | 'focus';

/** Bounded Modern material recipes; anatomy remains stable across recipes. */
export type PopoverRecipe = 'minimal' | 'bordered' | 'inverse' | 'rich';

/** Coarse-pointer fallback for hover/focus-only popovers. */
export type PopoverTouchBehavior = 'toggle' | 'none';

/** Supported non-modal popup semantics. */
export type PopoverRole = 'dialog' | 'menu' | 'listbox';

/**
 * Placement options for the popover.
 * Supports 12 positions around the trigger element.
 */
export type PopoverPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'leftTop'
  | 'leftBottom'
  | 'right'
  | 'rightTop'
  | 'rightBottom';

/**
 * Maps the component's 12-position placement vocabulary onto the shared
 * overlay positioning engine's side-align vocabulary (`{side}` centers,
 * `{side}Left`/`{side}Top` and `{side}Right`/`{side}Bottom` become the
 * engine's `-start`/`-end` edge alignment). Internal to the engines --
 * the public `PopoverPlacement` prop vocabulary is unchanged.
 *
 * The engine side of the map is spelled logically (`left` -> `inline-start`,
 * `right` -> `inline-end`); the public prop keeps its antd-shaped physical
 * NAMES, because renaming them would break every caller. What that spelling
 * RESOLVES to is the adopting engine's door, not this table:
 *
 * - Modern reaches the positioning runtime through `useFieldOverlay`, which
 *   declares `inlineSides: 'logical'`, so a Modern popover declared `left`
 *   opens on the reader's near side and mirrors under `dir=rtl`.
 * - The frozen Rustic engine calls `useOverlayPosition` directly and takes its
 *   physical default, so a Rustic popover declared `left` opens on the physical
 *   left edge in both reading directions -- the behaviour it has always had.
 *
 * Do not "fix" that asymmetry by making this table physical: Modern's geometry
 * resolver speaks the logical vocabulary and would then compare two different
 * alphabets when it stamps `data-collision-adjusted`.
 */
export const POPOVER_TO_OVERLAY_PLACEMENT: Record<PopoverPlacement, OverlayPlacement> = {
  top: 'top',
  topLeft: 'top-start',
  topRight: 'top-end',
  bottom: 'bottom',
  bottomLeft: 'bottom-start',
  bottomRight: 'bottom-end',
  left: 'inline-start',
  leftTop: 'inline-start-start',
  leftBottom: 'inline-start-end',
  right: 'inline-end',
  rightTop: 'inline-end-start',
  rightBottom: 'inline-end-end',
};

/** Props both Popover modes carry, with one meaning in each. */
interface PopoverSharedProps {
  /** Content of the popover */
  content: ReactNode;
  /** Placement of the popover */
  placement?: PopoverPlacement;
  /** Whether the popover is open (controlled) */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Coordinated material and density recipe. @default 'bordered' */
  recipe?: PopoverRecipe;
  /** Local density override; omitted values inherit the active tenant density. */
  density?: DensityPosture;
  /** Gap in pixels between trigger and surface. @default 10 */
  offset?: number;
  /** Maximum inline size, additionally clamped to the viewport. @default 384 */
  maxWidth?: number | string;
  /** Close an open popover when Escape is pressed. @default true */
  closeOnEscape?: boolean;
  /** Close an open popover on pointer interaction outside. @default true */
  closeOnInteractOutside?: boolean;
  /** Semantic role for the non-modal popup surface. @default 'dialog' */
  role?: PopoverRole;
  /** Overlay class name */
  overlayClassName?: string;
  /** Overlay styles */
  overlayStyle?: CSSProperties;
}

/**
 * Props for the Popover component.
 * A floating panel for displaying rich content on user interaction.
 *
 * @example
 * ```tsx
 * <Popover
 *   content={<div>Rich content here</div>}
 *   title="Popover Title"
 *   trigger="click"
 *   placement="bottom"
 * >
 *   <Button>Open Popover</Button>
 * </Popover>
 * ```
 */
export interface PopoverTriggerProps extends PopoverSharedProps {
  /** Title of the popover */
  title?: ReactNode;
  /** Trigger method */
  trigger?: PopoverTrigger | PopoverTrigger[];
  /** Default open state */
  defaultOpen?: boolean;
  /** Whether to show arrow */
  arrow?: boolean | { pointAtCenter: boolean };
  /** The trigger element */
  children: ReactNode;
  /** Mouse enter delay in ms */
  mouseEnterDelay?: number;
  /** Mouse leave delay in ms */
  mouseLeaveDelay?: number;
  /** Coarse-pointer fallback for hover/focus-only popovers. @default 'toggle' */
  touchBehavior?: PopoverTouchBehavior;
  /** Accessible label when no visible title labels the surface. */
  'aria-label'?: string;
  /** External accessible label id. Takes precedence over the visible title. */
  'aria-labelledby'?: string;
  /** Destroy tooltip when hidden */
  destroyTooltipOnHide?: boolean;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** z-index */
  zIndex?: number;
  anchor?: never;
  id?: never;
  initialFocus?: never;
}

/** Where focus lands when an anchored disclosure opens. */
export type PopoverInitialFocus = 'first-control' | 'surface' | 'none';

interface PopoverAnchoredBase extends PopoverSharedProps {
  /**
   * Caller-owned element the surface pins to. The surface renders in-tree at
   * the Popover's own mount point and is never portalled. Modern engine only.
   */
  anchor: RefObject<HTMLElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Surface id; the caller's trigger points `aria-controls` at it. */
  id: string;
  /** @default 'first-control' */
  initialFocus?: PopoverInitialFocus;
  // Present as `never` so a destructure over the union compiles in every engine.
  children?: never;
  title?: never;
  trigger?: never;
  defaultOpen?: never;
  arrow?: never;
  mouseEnterDelay?: never;
  mouseLeaveDelay?: never;
  touchBehavior?: never;
  destroyTooltipOnHide?: never;
  className?: never;
  style?: never;
  zIndex?: never;
}

/**
 * Anchored disclosure: the trigger is caller-owned and lives elsewhere in the
 * tree. Controlled, named, in-tree under the tenant scope.
 */
export type PopoverAnchoredProps =
  | (PopoverAnchoredBase & { 'aria-label': string; 'aria-labelledby'?: never })
  | (PopoverAnchoredBase & { 'aria-labelledby': string; 'aria-label'?: never });

export type PopoverProps = PopoverTriggerProps | PopoverAnchoredProps;

/**
 * Default values for Popover component props.
 * These are applied when no explicit value is provided.
 */
export const POPOVER_DEFAULTS: Partial<PopoverProps> = {
  /** Default trigger method */
  trigger: 'hover',
  /** Default placement */
  placement: 'top',
  /** Show arrow by default */
  arrow: true,
  /** Token-coordinated default material */
  recipe: 'bordered',
  /** Delay before showing on hover (ms) */
  mouseEnterDelay: 100,
  /** Delay before hiding on mouse leave (ms) */
  mouseLeaveDelay: 100,
  /** Default trigger-to-surface gap */
  offset: 10,
  /** Viewport-safe default measure */
  maxWidth: 384,
  /** Taps expose hover-only content on coarse pointers */
  touchBehavior: 'toggle',
  /** Escape is a universal non-modal dismiss affordance */
  closeOnEscape: true,
  /** Pointer-down outside performs light dismiss */
  closeOnInteractOutside: true,
  /** Rich contextual content is announced as a non-modal dialog */
  role: 'dialog',
  /** Keep popover mounted when hidden */
  destroyTooltipOnHide: false,
  /** Default z-index */
  zIndex: 1030,
};
