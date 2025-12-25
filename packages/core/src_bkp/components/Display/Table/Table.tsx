'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { TableProps } from './types';
import TitanTable from './engines/titan';

/**
 * Table Component
 *
 * Multi-engine table that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Supported engines:
 * - titan: Ant Design Table (full featured with sorting, filtering, pagination)
 * - hermes: DaisyUI basic table
 * - apollo: HTML + Tailwind CSS table
 * - athena: Same as apollo
 */
export const Table = createEngineComponent<TableProps<any>>({
  titan: TitanTable,
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
}, { displayName: 'Table' });
