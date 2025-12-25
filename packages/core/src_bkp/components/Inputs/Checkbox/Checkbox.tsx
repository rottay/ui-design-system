'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { CheckboxProps } from './types';

/**
 * Checkbox Component
 *
 * Multi-engine checkbox that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design Checkbox (default)
 * - hermes: DaisyUI Checkbox (lazy loaded)
 * - apollo: Native HTML + Tailwind Checkbox (lazy loaded)
 * - athena: Falls back to apollo or hermes
 *
 * @example
 * ```tsx
 * <Checkbox>Remember me</Checkbox>
 * <Checkbox checked disabled>Checked disabled</Checkbox>
 * <Checkbox indeterminate>Indeterminate</Checkbox>
 * ```
 */
export const Checkbox = createEngineComponent<CheckboxProps>(
  {
    titan: lazyEngine(() =>
      import('./engines/titan').then((m) => ({
        default: m.default,
      }))
    ),
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
  },
  { displayName: 'Checkbox' }
);
