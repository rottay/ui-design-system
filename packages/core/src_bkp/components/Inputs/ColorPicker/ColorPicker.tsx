'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { ColorPickerProps } from './types';
import TitanColorPicker from './engines/titan';

/**
 * ColorPicker Component
 *
 * Multi-engine color picker that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design ColorPicker (default, full featured)
 * - hermes: DaisyUI-based color picker (lazy loaded)
 * - apollo: Native HTML + Tailwind color picker (lazy loaded)
 * - athena: Re-exports apollo implementation
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ColorPicker
 *   defaultValue="#1677FF"
 *   onChange={(color) => console.log(color)}
 * />
 *
 * // With text display
 * <ColorPicker showText allowClear />
 *
 * // With presets
 * <ColorPicker
 *   presets={[
 *     { label: 'Brand', colors: ['#1677FF', '#52C41A', '#FF4D4F'] },
 *   ]}
 * />
 * ```
 */
export const ColorPicker = createEngineComponent<ColorPickerProps>(
  {
    titan: TitanColorPicker,
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
  { displayName: 'ColorPicker' }
);
