'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { TagProps } from './types';
import TitanTag from './engines/titan';

/**
 * Tag Component
 *
 * Multi-engine tag/label that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Supported engines:
 * - titan: Ant Design Tag (full featured)
 * - hermes: DaisyUI badge component
 * - apollo: HTML + Tailwind CSS tag
 * - athena: Same as apollo
 */
export const Tag = createEngineComponent<TagProps>({
  titan: TitanTag,
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
}, { displayName: 'Tag' });
