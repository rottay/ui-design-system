'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { TooltipProps } from '../../../types/components/tooltip';
import TitanTooltip from './engines/titan';

/**
 * Tooltip Component
 *
 * Multi-engine tooltip that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Supported engines:
 * - titan: Ant Design Tooltip (full featured)
 * - hermes: DaisyUI tooltip
 * - apollo: HTML + Tailwind CSS tooltip (CSS positioning)
 * - athena: Same as apollo
 */
export const Tooltip = createEngineComponent<TooltipProps>({
  titan: TitanTooltip,
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
}, { displayName: 'Tooltip' });
