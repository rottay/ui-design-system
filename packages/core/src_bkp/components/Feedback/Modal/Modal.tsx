'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { ModalProps } from './types';
import TitanModal from './engines/titan';

/**
 * Modal Component
 *
 * Multi-engine modal that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Supported engines:
 * - titan: Ant Design Modal (full featured)
 * - hermes: DaisyUI native HTML dialog
 * - apollo: HTML + Tailwind CSS with portal
 * - athena: Same as apollo
 */
export const Modal = createEngineComponent<ModalProps>({
  titan: TitanModal,
  hermes: lazyEngine(() =>
    import('./engines/hermes').then((m) => ({
      default: m.default,
    }))
  ),
  apollo: lazyEngine(() =>
    import('./engines/apollo').then((m) => ({
      default: m.default,
    }))
  ),
  athena: lazyEngine(() =>
    import('./engines/athena').then((m) => ({
      default: m.default,
    }))
  ),
}, { displayName: 'Modal' });
