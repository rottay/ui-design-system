'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { InputProps } from './types';
import TitanInput from './engines/titan';

/**
 * Input Component
 *
 * Multi-engine input that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design Input (default)
 * - hermes: DaisyUI Input (lazy loaded)
 * - apollo: Native HTML + Tailwind Input (lazy loaded)
 * - athena: Re-exports apollo implementation
 *
 * @example
 * ```tsx
 * <Input placeholder="Enter text" />
 * <Input type="password" size="large" />
 * <Input status="error" prefix={<SearchIcon />} />
 * ```
 */
export const Input = createEngineComponent<InputProps>(
  {
    titan: TitanInput,
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
  { displayName: 'Input' }
);
