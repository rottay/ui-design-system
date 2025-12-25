'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { ButtonProps } from './types';
import TitanButton from './engines/titan';

/**
 * Button Component
 *
 * Multi-engine button that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design Button (default)
 * - hermes: DaisyUI Button (lazy loaded)
 * - apollo: Native HTML + Tailwind Button (lazy loaded)
 * - athena: Re-exports apollo implementation
 *
 * @example
 * ```tsx
 * <Button type="primary" size="large">Click me</Button>
 * <Button type="default" loading>Loading...</Button>
 * <Button danger onClick={handleDelete}>Delete</Button>
 * ```
 */
export const Button = createEngineComponent<ButtonProps>(
  {
    titan: TitanButton,
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
  { displayName: 'Button' }
);
