'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { TabsProps } from './types';
import TitanTabs from './engines/titan';

/**
 * Tabs Component
 *
 * Multi-engine tabs that automatically use the correct implementation
 * based on the current engine context.
 *
 * Supported engines:
 * - titan: Ant Design Tabs (full featured)
 * - hermes: DaisyUI tabs
 * - apollo: HTML + Tailwind CSS tabs
 * - athena: Same as apollo
 */
export const Tabs = createEngineComponent<TabsProps>({
  titan: TitanTabs,
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
}, { displayName: 'Tabs' });
