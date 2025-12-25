'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { ProgressProps } from './types';
import TitanProgress from './engines/titan';

/**
 * Progress Component
 *
 * Multi-engine progress indicator that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Supported engines:
 * - titan: Ant Design Progress (full featured)
 * - hermes: DaisyUI progress
 * - apollo: HTML + Tailwind CSS progress
 * - athena: Same as apollo
 */
export const Progress = createEngineComponent<ProgressProps>({
  titan: TitanProgress,
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
}, { displayName: 'Progress' });
