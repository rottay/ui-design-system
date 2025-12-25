'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { RadioProps } from './types';

// Import Titan (AntD) engine directly for default usage
import TitanRadio from './engines/titan';

/**
 * Radio Component
 *
 * Multi-engine radio button that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design Radio (default)
 * - hermes: DaisyUI Radio (lazy loaded)
 * - apollo: Native HTML + Tailwind Radio (lazy loaded)
 * - athena: Falls back to apollo implementation
 *
 * @example
 * ```tsx
 * <Radio value="a">Option A</Radio>
 * <Radio value="b" disabled>Option B</Radio>
 * <Radio.Group onChange={onChange} value={value}>
 *   <Radio value={1}>Option 1</Radio>
 *   <Radio value={2}>Option 2</Radio>
 * </Radio.Group>
 * ```
 */
export const Radio = createEngineComponent<RadioProps>(
  {
    titan: TitanRadio,
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
  { displayName: 'Radio' }
);
