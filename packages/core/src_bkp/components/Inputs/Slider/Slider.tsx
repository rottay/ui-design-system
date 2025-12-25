'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { SliderProps } from './types';
import TitanSlider from './engines/titan';

/**
 * Slider Component
 *
 * Multi-engine slider input that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design Slider (default, full featured)
 * - hermes: DaisyUI-based slider (lazy loaded)
 * - apollo: Native HTML + Tailwind slider (lazy loaded)
 * - athena: Re-exports apollo implementation
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Slider defaultValue={30} />
 *
 * // Range slider
 * <Slider range defaultValue={[20, 50]} />
 *
 * // With marks
 * <Slider
 *   marks={{
 *     0: '0°C',
 *     26: '26°C',
 *     37: '37°C',
 *     100: '100°C',
 *   }}
 *   defaultValue={37}
 * />
 *
 * // Controlled
 * <Slider
 *   value={value}
 *   onChange={setValue}
 * />
 * ```
 */
export const Slider = createEngineComponent<SliderProps>(
  {
    titan: TitanSlider,
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
  { displayName: 'Slider' }
);
