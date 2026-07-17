/**
 * @fileoverview Overlay primitives barrel export.
 * Re-exports all overlay-category primitive components.
 *
 * Note: Modal compound components (Header, Body, Footer) are exported from
 * './feedback/Modal'. Use OverlayModal for advanced features like Portal.
 */

// ARCHITECTURE: Two Modal implementations coexist intentionally.
// - feedback/Modal (canonical public API): Full-featured modal with header/body/footer
//   compound components, confirmLoading, onOk/onCancel callbacks. Used by consumers.
// - overlay/Modal (internal/advanced): Lower-level overlay primitive focused on
//   positioning, animation, and backdrop. Used internally by other overlay components
//   (Sheet, Drawer, etc.) and available as OverlayModal for advanced use cases.
// Consolidation is a future consideration but not blocking -- both share the same
// visual language (backdrop, surface, elevation tokens) as of Wave 2B.
export { Modal as OverlayModal } from './Modal';


// Export utility components (unique to overlay)
export {
  Portal,
  usePortalContainer,
  Overlay,
  FocusTrap,
  useFocusTrap,
} from './Modal';

// Export defaults with alias to avoid conflict
export {
  MODAL_DEFAULTS as OVERLAY_MODAL_DEFAULTS,
  SIZE_MAP as MODAL_SIZE_MAP,
  MAX_HEIGHT_MAP as MODAL_MAX_HEIGHT_MAP,
  PADDING_MAP as MODAL_PADDING_MAP,
  RADIUS_MAP as MODAL_RADIUS_MAP,
} from './Modal';

// Re-export types with aliases where needed
export type {
  ModalProps as OverlayModalProps,
  ModalSize as OverlayModalSize,
  PortalProps,
  OverlayProps,
  FocusTrapProps,
} from './Modal';

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
