'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { DividerProps } from './types';
import TitanDivider from './engines/titan';

/**
 * Divider Component
 *
 * Multi-engine divider that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Supported engines:
 * - titan: Ant Design Divider (full featured)
 * - hermes: DaisyUI divider
 * - apollo: HTML + Tailwind CSS divider
 * - athena: Same as apollo
 */
export const Divider = createEngineComponent<DividerProps>({
  titan: TitanDivider,
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
}, { displayName: 'Divider' });
