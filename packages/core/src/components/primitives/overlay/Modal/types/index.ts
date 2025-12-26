/**
 * Modal - Core Interface
 * Re-exports from centralized types
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
 * Modal CloseButton Props
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

// Default values
export const MODAL_DEFAULTS = {
  size: 'md' as const,
  placement: 'center' as const,
  closable: true,
  closeOnBackdropClick: true,
  closeOnEscape: true,
  showBackdrop: true,
  blurBackdrop: false,
  preventScroll: true,
  radius: 'lg' as const,
  shadow: true,
  padding: 'lg' as const,
  divider: false,
  zIndex: 1000,
  disableAnimation: false,
};

// Size mapping to pixel values (matches CSS tokens)
export const SIZE_MAP: Record<string, string> = {
  xs: '320px',   // --modal-xs-width
  sm: '400px',   // --modal-sm-width
  md: '500px',   // --modal-md-width
  lg: '640px',   // --modal-lg-width
  xl: '800px',   // --modal-xl-width
  '2xl': '960px',  // --modal-2xl-width
  '3xl': '1120px', // --modal-3xl-width
  '4xl': '1280px', // --modal-4xl-width
  '5xl': '1440px', // --modal-5xl-width
  full: '100%',    // --modal-full-width
};

// Max height mapping
export const MAX_HEIGHT_MAP: Record<string, string> = {
  xs: '90vh',
  sm: '90vh',
  md: '85vh',
  lg: '85vh',
  xl: '80vh',
  '2xl': '80vh',
  '3xl': '80vh',
  '4xl': '80vh',
  '5xl': '80vh',
  full: '100vh',
};

// Padding mapping
export const PADDING_MAP: Record<string, string> = {
  none: '0',
  sm: '12px',
  md: '16px',
  lg: '24px',
};

// Border radius mapping
export const RADIUS_MAP: Record<string, string> = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
};
