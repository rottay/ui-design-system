'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { AlertProps } from './types';
import TitanAlert from './engines/titan';

/**
 * Alert Component
 *
 * Multi-engine alert/notification that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Supported engines:
 * - titan: Ant Design Alert (full featured)
 * - hermes: DaisyUI alert
 * - apollo: HTML + Tailwind CSS alert
 * - athena: Same as apollo
 */
export const Alert = createEngineComponent<AlertProps>({
  titan: TitanAlert,
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
}, { displayName: 'Alert' });
