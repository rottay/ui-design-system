/**
 * @fileoverview Overlay primitives barrel export.
 * Re-exports all overlay-category primitive components.
 *
 * `feedback/modal` is the sole Modal owner, and it is the only one. The
 * `OverlayModal` alias that used to sit at the top of this file is retired: it
 * re-exported the identical component object through a folder of pure
 * forwarding shims, so the package advertised two dialog primitives while
 * shipping one. Its compatibility constants went with it — a second
 * `MODAL_PADDING_MAP` that disagreed with the canonical one is a trap, not a
 * contract. Consumers use `Modal` from feedback/.
 */

// Dropdown
export { Dropdown } from './dropdown';
export type {
  DropdownProps,
  DropdownMenuItem,
  DropdownMenuProps,
  DropdownTrigger,
  DropdownPlacement,
} from './dropdown';
export { DROPDOWN_DEFAULTS } from './dropdown';

// Popover
export { Popover } from './popover';
export type {
  PopoverProps,
  PopoverTrigger,
  PopoverPlacement,
  PopoverRecipe,
  PopoverRole,
  PopoverTouchBehavior,
} from './popover';
export { POPOVER_DEFAULTS } from './popover';

// Popconfirm
export { Popconfirm } from './popconfirm';
export type {
  PopconfirmProps,
  PopconfirmPlacement,
  PopconfirmOkType,
} from './popconfirm';
export { POPCONFIRM_DEFAULTS } from './popconfirm';

// Tour
export { Tour } from './tour';
export type {
  TourProps,
  TourStepProps,
  TourPlacement,
  TourType,
} from './tour';
export { TOUR_DEFAULTS } from './tour';

// Watermark
export { Watermark } from './watermark';
export type {
  WatermarkProps,
  WatermarkFont,
} from './watermark';
export { WATERMARK_DEFAULTS } from './watermark';

// ContextMenu
export { ContextMenu } from './context-menu';
export type {
  ContextMenuProps,
  ContextMenuItem,
} from './context-menu';
export { CONTEXTMENU_DEFAULTS } from './context-menu';

// HoverCard
export { HoverCard } from './hover-card';
export type {
  HoverCardProps,
  HoverCardSide,
  HoverCardAlign,
} from './hover-card';
export { HOVERCARD_DEFAULTS } from './hover-card';

// Sheet
export { Sheet } from './sheet';
export type {
  SheetProps,
  SheetSide,
} from './sheet';
export { SHEET_DEFAULTS } from './sheet';

// ConfirmDialog
export { ConfirmDialog } from './confirm-dialog';
export type { ConfirmDialogProps, ConfirmDialogVariant } from './confirm-dialog';
export { CONFIRM_DIALOG_DEFAULTS, VARIANT_COLORS as CONFIRM_DIALOG_VARIANT_COLORS } from './confirm-dialog';

// AlertDialog
export { AlertDialog } from './alert-dialog';
export type { AlertDialogProps } from './alert-dialog';
export { ALERT_DIALOG_DEFAULTS } from './alert-dialog';

// Overlay layer-stack manager (shared z-band, Escape routing, scroll-lock)
export { useOverlayLayer } from '../runtime/overlay/layer-stack';
export type {
  OverlayLayerKind,
  UseOverlayLayerOptions,
  OverlayLayerProps,
  OverlayLayerHandle,
} from '../runtime/overlay/layer-stack';
