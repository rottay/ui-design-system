'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { InputNumberProps } from './types';
import TitanInputNumber from './engines/titan';

/**
 * InputNumber Component
 *
 * Multi-engine number input that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design InputNumber (default, full featured)
 * - hermes: DaisyUI-based input number (lazy loaded)
 * - apollo: Native HTML + Tailwind input number (lazy loaded)
 * - athena: Re-exports apollo implementation
 *
 * @example
 * ```tsx
 * // Basic usage
 * <InputNumber defaultValue={3} min={1} max={10} />
 *
 * // With step
 * <InputNumber defaultValue={0} step={0.1} precision={1} />
 *
 * // With formatter
 * <InputNumber
 *   defaultValue={1000}
 *   formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
 *   parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
 * />
 *
 * // Controlled
 * <InputNumber
 *   value={value}
 *   onChange={setValue}
 * />
 * ```
 */
export const InputNumber = createEngineComponent<InputNumberProps>(
  {
    titan: TitanInputNumber,
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
  { displayName: 'InputNumber' }
);
