'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { DatePickerProps } from './types';
import TitanDatePicker from './engines/titan';

/**
 * DatePicker Component
 *
 * Multi-engine date picker that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design DatePicker with dayjs (default, full featured)
 * - hermes: DaisyUI-based calendar picker (lazy loaded)
 * - apollo: Native HTML + Tailwind calendar (lazy loaded)
 * - athena: Re-exports apollo implementation
 *
 * @example
 * ```tsx
 * // Basic usage
 * <DatePicker
 *   placeholder="Select date"
 *   onChange={(date, dateString) => console.log(date, dateString)}
 * />
 *
 * // With min/max dates
 * <DatePicker
 *   minDate={new Date()}
 *   maxDate={new Date(2025, 11, 31)}
 * />
 *
 * // With presets
 * <DatePicker
 *   presets={[
 *     { label: 'Today', value: new Date() },
 *     { label: 'Tomorrow', value: () => {
 *       const d = new Date();
 *       d.setDate(d.getDate() + 1);
 *       return d;
 *     }},
 *   ]}
 * />
 * ```
 */
export const DatePicker = createEngineComponent<DatePickerProps>(
  {
    titan: TitanDatePicker,
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
  { displayName: 'DatePicker' }
);
