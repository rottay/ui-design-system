'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { CascaderProps } from './types';
import TitanCascader from './engines/titan';

/**
 * Cascader Component
 *
 * Multi-engine cascading selector that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design Cascader (default, full featured)
 * - hermes: DaisyUI-based cascader (lazy loaded)
 * - apollo: Native HTML + Tailwind cascader (lazy loaded)
 * - athena: Re-exports apollo implementation
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Cascader
 *   options={[
 *     {
 *       value: 'zhejiang',
 *       label: 'Zhejiang',
 *       children: [
 *         { value: 'hangzhou', label: 'Hangzhou' },
 *       ],
 *     },
 *   ]}
 *   onChange={(value, selectedOptions) => console.log(value)}
 * />
 *
 * // With search
 * <Cascader options={options} showSearch />
 *
 * // Allow selecting parent nodes
 * <Cascader options={options} changeOnSelect />
 * ```
 */
export const Cascader = createEngineComponent<CascaderProps>(
  {
    titan: TitanCascader,
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
  { displayName: 'Cascader' }
);
