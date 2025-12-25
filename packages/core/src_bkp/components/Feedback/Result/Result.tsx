'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { ResultProps } from './types';
import TitanResult from './engines/titan';

/**
 * Result Component
 *
 * Multi-engine result component that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Supported engines:
 * - titan: Ant Design Result (full featured)
 * - hermes: HTML + Tailwind CSS result
 * - apollo: HTML + Tailwind CSS result
 * - athena: Same as apollo
 */
export const Result = createEngineComponent<ResultProps>(
  {
    titan: TitanResult,
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
  { displayName: 'Result' }
);
