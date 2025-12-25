'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { AvatarProps } from './types';
import TitanAvatar from './engines/titan';

/**
 * Avatar Component
 *
 * Multi-engine avatar that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Supported engines:
 * - titan: Ant Design Avatar (full featured)
 * - hermes: DaisyUI avatar
 * - apollo: HTML + Tailwind CSS avatar
 * - athena: Same as apollo
 */
export const Avatar = createEngineComponent<AvatarProps>({
  titan: TitanAvatar,
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
}, { displayName: 'Avatar' });
