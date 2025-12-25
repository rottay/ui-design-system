'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { PopoverProps } from './types';
import TitanPopover from './engines/titan';

/**
 * Popover Component
 *
 * Multi-engine popover that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Supported engines:
 * - titan: Ant Design Popover (full featured)
 * - hermes: DaisyUI dropdown-based popover
 * - apollo: HTML + Tailwind CSS popover
 * - athena: Same as apollo
 */
export const Popover = createEngineComponent<PopoverProps>({
  titan: TitanPopover,
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
}, { displayName: 'Popover' });
