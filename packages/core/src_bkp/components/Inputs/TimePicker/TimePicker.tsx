'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { TimePickerProps } from './types';
import TitanTimePicker from './engines/titan';

/**
 * TimePicker Component
 *
 * Multi-engine time picker that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design TimePicker with dayjs (default, full featured)
 * - hermes: DaisyUI-based time picker (lazy loaded)
 * - apollo: Native HTML + Tailwind time picker (lazy loaded)
 * - athena: Re-exports apollo implementation
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TimePicker
 *   placeholder="Select time"
 *   onChange={(time, timeString) => console.log(time, timeString)}
 * />
 *
 * // 12-hour format
 * <TimePicker use12Hours format="h:mm A" />
 *
 * // With disabled hours
 * <TimePicker
 *   disabledHours={() => [0, 1, 2, 3, 4, 5]}
 * />
 * ```
 */
export const TimePicker = createEngineComponent<TimePickerProps>(
  {
    titan: TitanTimePicker,
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
  { displayName: 'TimePicker' }
);
