'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { SpinProps } from './types';
import TitanSpin from './engines/titan';

/**
 * Spin Component
 *
 * Multi-engine spinner/loading indicator that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Supported engines:
 * - titan: Ant Design Spin (full featured)
 * - hermes: DaisyUI loading component
 * - apollo: HTML + Tailwind CSS spinner
 * - athena: Same as apollo
 */
export const Spin = createEngineComponent<SpinProps>({
  titan: TitanSpin,
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
}, { displayName: 'Spin' });
