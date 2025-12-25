/**
 * Modal - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { ModalProps } from './types';

export { type ModalProps, type ModalSize, MODAL_DEFAULTS } from './types';

export { BaseModal } from './base';

export const Modal = createEngineComponent<ModalProps>('Modal', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
