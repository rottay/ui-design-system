'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { BadgeProps } from './types';
import TitanBadge from './engines/titan';

/**
 * Badge Component
 *
 * Multi-engine badge that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Supported engines:
 * - titan: Ant Design Badge (full featured)
 * - hermes: DaisyUI indicator/badge
 * - apollo: HTML + Tailwind CSS badge
 * - athena: Same as apollo
 *
 * Features:
 * - Count mode: Display numeric values with overflow handling
 * - Dot mode: Simple indicator without count
 * - Status colors: success, processing, default, error, warning
 * - Standalone or wrapper usage
 * - Custom colors and positioning
 */
export const Badge = createEngineComponent<BadgeProps>({
  titan: TitanBadge,
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
}, { displayName: 'Badge' });
