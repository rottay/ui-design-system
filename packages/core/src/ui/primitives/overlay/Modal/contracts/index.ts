/**
 * @deprecated Contract adapter for the former overlay-owned Modal.
 *
 * The canonical contract lives at `feedback/Modal`. The mapping constants
 * remain as compatibility metadata for legacy direct imports; they do not
 * define a second component contract or engine.
 */

import { MODAL_DEFAULTS as CANONICAL_MODAL_DEFAULTS } from '../../../facade';

export type {
  ModalBodyProps,
  ModalButtonConfig,
  ModalCloseButtonProps,
  ModalConfirmProps,
  ModalFooterProps,
  ModalHeaderProps,
  ModalPlacement,
  ModalProps,
  ModalSize,
} from '../../../facade';

export const MODAL_DEFAULTS = {
  ...CANONICAL_MODAL_DEFAULTS,
  placement: 'center' as const,
};

export const SIZE_MAP: Record<string, string> = {
  xs: 'var(--ds-modal-xs-width)',
  sm: 'var(--ds-modal-sm-width)',
  md: 'var(--ds-modal-md-width)',
  lg: 'var(--ds-modal-lg-width)',
  xl: 'var(--ds-modal-xl-width)',
  '2xl': 'var(--ds-modal-2xl-width)',
  '3xl': 'var(--ds-modal-3xl-width)',
  '4xl': 'var(--ds-modal-4xl-width)',
  '5xl': 'var(--ds-modal-5xl-width)',
  full: 'var(--ds-modal-full-width)',
};

export const MAX_HEIGHT_MAP: Record<string, string> = {
  xs: 'var(--ds-modal-xs-max-height)',
  sm: 'var(--ds-modal-sm-max-height)',
  md: 'var(--ds-modal-md-max-height)',
  lg: 'var(--ds-modal-lg-max-height)',
  xl: 'var(--ds-modal-xl-max-height)',
  '2xl': 'var(--ds-modal-2xl-max-height)',
  '3xl': 'var(--ds-modal-3xl-max-height)',
  '4xl': 'var(--ds-modal-4xl-max-height)',
  '5xl': 'var(--ds-modal-5xl-max-height)',
  full: 'var(--ds-modal-full-max-height)',
};

export const PADDING_MAP: Record<string, string> = {
  none: 'var(--ds-modal-padding-none)',
  sm: 'var(--ds-modal-padding-sm)',
  md: 'var(--ds-modal-padding-md)',
  lg: 'var(--ds-modal-padding-lg)',
};

export const RADIUS_MAP: Record<string, string> = {
  none: 'var(--ds-modal-radius-none)',
  sm: 'var(--ds-modal-radius-sm)',
  md: 'var(--ds-modal-radius-md)',
  lg: 'var(--ds-modal-radius-lg)',
  xl: 'var(--ds-modal-radius-xl)',
};
