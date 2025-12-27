/**
 * Modal Component Types
 *
 * Type definitions for the Modal component including size, placement,
 * and compound component props for header, body, and footer sections.
 *
 * @module ModalTypes
 */

export type {
  ModalProps,
  ModalSize,
  ModalPlacement,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalButtonConfig,
  ModalConfirmProps,
} from '../../../../../types/primitives/feedback/Modal';

/**
 * Props for the Modal CloseButton component.
 * Used to render a custom close button within the modal.
 */
export interface ModalCloseButtonProps {
  /** Callback when close is triggered */
  onClose?: () => void;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** Size of the close button */
  size?: 'sm' | 'md' | 'lg';
  /** Aria label for accessibility */
  'aria-label'?: string;
}

/**
 * Default values for Modal component props.
 * These are applied when no explicit value is provided.
 */
export const MODAL_DEFAULTS = {
  /** Default modal size */
  size: 'md' as const,
  /** Default modal placement */
  placement: 'center' as const,
  /** Whether close button is shown by default */
  closable: true,
  /** Whether clicking backdrop closes modal by default */
  closeOnBackdropClick: true,
  /** Whether ESC key closes modal by default */
  closeOnEscape: true,
  /** Whether backdrop is shown by default */
  showBackdrop: true,
  /** Whether backdrop is blurred by default */
  blurBackdrop: false,
  /** Whether to prevent body scroll by default */
  preventScroll: true,
  /** Default border radius */
  radius: 'lg' as const,
  /** Whether shadow is shown by default */
  shadow: true,
  /** Default padding size */
  padding: 'lg' as const,
  /** Whether dividers are shown by default */
  divider: false,
  /** Default z-index value */
  zIndex: 1000,
  /** Whether animations are disabled by default */
  disableAnimation: false,
};

/**
 * Size mapping to CSS width values.
 * Uses CSS custom properties for consistent theming.
 */
export const SIZE_MAP: Record<string, string> = {
  /** Extra small: 320px */
  xs: 'var(--modal-xs-width)',
  /** Small: 400px */
  sm: 'var(--modal-sm-width)',
  /** Medium: 500px - default */
  md: 'var(--modal-md-width)',
  /** Large: 640px */
  lg: 'var(--modal-lg-width)',
  /** Extra large: 800px */
  xl: 'var(--modal-xl-width)',
  /** 2X large: 960px */
  '2xl': 'var(--modal-2xl-width)',
  /** 3X large: 1120px */
  '3xl': 'var(--modal-3xl-width)',
  /** 4X large: 1280px */
  '4xl': 'var(--modal-4xl-width)',
  /** 5X large: 1440px */
  '5xl': 'var(--modal-5xl-width)',
  /** Full width: 100% */
  full: 'var(--modal-full-width)',
};

/**
 * Maximum height mapping for each size variant.
 * Uses CSS custom properties for consistent theming.
 */
export const MAX_HEIGHT_MAP: Record<string, string> = {
  xs: 'var(--modal-xs-max-height)',
  sm: 'var(--modal-sm-max-height)',
  md: 'var(--modal-md-max-height)',
  lg: 'var(--modal-lg-max-height)',
  xl: 'var(--modal-xl-max-height)',
  '2xl': 'var(--modal-2xl-max-height)',
  '3xl': 'var(--modal-3xl-max-height)',
  '4xl': 'var(--modal-4xl-max-height)',
  '5xl': 'var(--modal-5xl-max-height)',
  full: 'var(--modal-full-max-height)',
};

/**
 * Padding mapping to CSS values.
 * Uses CSS custom properties for consistent theming.
 */
export const PADDING_MAP: Record<string, string> = {
  /** No padding */
  none: 'var(--modal-padding-none)',
  /** Small padding: 12px */
  sm: 'var(--modal-padding-sm)',
  /** Medium padding: 16px */
  md: 'var(--modal-padding-md)',
  /** Large padding: 24px */
  lg: 'var(--modal-padding-lg)',
};

/**
 * Border radius mapping to CSS values.
 * Uses CSS custom properties for consistent theming.
 */
export const RADIUS_MAP: Record<string, string> = {
  /** No border radius */
  none: 'var(--modal-radius-none)',
  /** Small radius: 4px */
  sm: 'var(--modal-radius-sm)',
  /** Medium radius: 8px */
  md: 'var(--modal-radius-md)',
  /** Large radius: 12px */
  lg: 'var(--modal-radius-lg)',
  /** Extra large radius: 16px */
  xl: 'var(--modal-radius-xl)',
};
