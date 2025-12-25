'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { SwitchProps } from './types';
import TitanSwitch from './engines/titan';

/**
 * Switch Component
 *
 * Multi-engine switch/toggle that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Supported engines:
 * - titan: Ant Design Switch (full featured)
 * - hermes: DaisyUI toggle
 * - apollo: HTML + Tailwind CSS toggle
 * - athena: Same as apollo
 */
export const Switch = createEngineComponent<SwitchProps>({
  titan: TitanSwitch,
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
}, { displayName: 'Switch' });
