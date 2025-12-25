'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { EmptyProps } from './types';
import TitanEmpty from './engines/titan';

/**
 * Empty Component
 *
 * Multi-engine empty state component that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Supported engines:
 * - titan: Ant Design Empty (full featured)
 * - hermes: Simple HTML empty state
 * - apollo: HTML + Tailwind CSS empty state
 * - athena: Same as apollo
 */
export const Empty = createEngineComponent<EmptyProps>({
  titan: TitanEmpty,
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
}, { displayName: 'Empty' });
