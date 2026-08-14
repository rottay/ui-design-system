/**
 * @fileoverview Overlay primitives barrel export.
 * Re-exports all overlay-category primitive components.
 *
 * `feedback/Modal` is the sole Modal owner, and it is the only one. The
 * `OverlayModal` alias that used to sit at the top of this file is retired: it
 * re-exported the identical component object through a folder of pure
 * forwarding shims, so the package advertised two dialog primitives while
 * shipping one. Its compatibility constants went with it — a second
 * `MODAL_PADDING_MAP` that disagreed with the canonical one is a trap, not a
 * contract. Consumers use `Modal` from feedback/.
 */

// Dropdown
export { Dropdown } from './Dropdown';
export type {
  DropdownProps,
  DropdownMenuItem,
  DropdownMenuProps,
  DropdownTrigger,
  DropdownPlacement,
} from './Dropdown';
export { DROPDOWN_DEFAULTS } from './Dropdown';

// Popover
export { Popover } from './Popover';
export type {
  PopoverProps,
  PopoverTrigger,
  PopoverPlacement,
  PopoverRecipe,
  PopoverRole,
  PopoverTouchBehavior,
} from './Popover';
export { POPOVER_DEFAULTS } from './Popover';

// Popconfirm
export { Popconfirm } from './Popconfirm';
export type {
  PopconfirmProps,
  PopconfirmPlacement,
  PopconfirmOkType,
} from './Popconfirm';
export { POPCONFIRM_DEFAULTS } from './Popconfirm';

// Tour
export { Tour } from './Tour';
export type {
  TourProps,
  TourStepProps,
  TourPlacement,
  TourType,
} from './Tour';
export { TOUR_DEFAULTS } from './Tour';

// Watermark
export { Watermark } from './Watermark';
export type {
  WatermarkProps,
  WatermarkFont,
} from './Watermark';
export { WATERMARK_DEFAULTS } from './Watermark';

// ContextMenu
export { ContextMenu } from './ContextMenu';
export type {
  ContextMenuProps,
  ContextMenuItem,
} from './ContextMenu';
export { CONTEXTMENU_DEFAULTS } from './ContextMenu';

// HoverCard
export { HoverCard } from './HoverCard';
export type {
  HoverCardProps,
  HoverCardSide,
  HoverCardAlign,
} from './HoverCard';
export { HOVERCARD_DEFAULTS } from './HoverCard';

// Sheet
export { Sheet } from './Sheet';
export type {
  SheetProps,
  SheetSide,
} from './Sheet';
export { SHEET_DEFAULTS } from './Sheet';

// ConfirmDialog
export { ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps, ConfirmDialogVariant } from './ConfirmDialog';
export { CONFIRM_DIALOG_DEFAULTS, VARIANT_COLORS as CONFIRM_DIALOG_VARIANT_COLORS } from './ConfirmDialog';

// AlertDialog
export { AlertDialog } from './AlertDialog';
export type { AlertDialogProps } from './AlertDialog';
export { ALERT_DIALOG_DEFAULTS } from './AlertDialog';

// Overlay layer-stack manager (shared z-band, Escape routing, scroll-lock)
export { useOverlayLayer } from '../runtime/overlay/layer-stack';
export type {
  OverlayLayerKind,
  UseOverlayLayerOptions,
  OverlayLayerProps,
  OverlayLayerHandle,
} from '../runtime/overlay/layer-stack';
