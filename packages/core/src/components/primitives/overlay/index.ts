/**
 * Overlay primitives
 *
 * Note: Modal is also available from './feedback/Modal' with simpler API.
 * This overlay Modal provides advanced features: Portal, Overlay, FocusTrap.
 */

// Re-export Modal with alias to avoid conflict with feedback/Modal
export { Modal as OverlayModal } from './Modal';

// Export compound components directly (no conflict)
export {
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  BaseModal,
} from './Modal';

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
// Note: ModalSize is already exported from ./feedback, so we use an alias here
export type {
  ModalProps as OverlayModalProps,
  ModalSize as OverlayModalSize,
  ModalPlacement,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalButtonConfig,
  ModalConfirmProps,
  ModalCloseButtonProps,
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
