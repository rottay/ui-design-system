'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { SelectProps } from './types';

/**
 * Select Component
 *
 * Multi-engine select that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design Select (default)
 * - hermes: DaisyUI Select (lazy loaded)
 * - apollo: Native HTML + Tailwind Select (lazy loaded)
 * - athena: Falls back to apollo or hermes
 *
 * Note: Hermes and Apollo engines have simplified select props that differ
 * from Ant Design's full SelectProps. When using these engines, only basic
 * select features are available (options, value, onChange, placeholder, disabled).
 *
 * @example
 * ```tsx
 * <Select
 *   options={[
 *     { value: '1', label: 'Option 1' },
 *     { value: '2', label: 'Option 2' }
 *   ]}
 *   placeholder="Select an option"
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 */
export const Select = createEngineComponent<SelectProps>(
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
  { displayName: 'Select' }
);
