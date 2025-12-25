'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { MentionsProps } from './types';
import TitanMentions from './engines/titan';

/**
 * Mentions Component
 *
 * Multi-engine mentions input that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design Mentions (default, full featured)
 * - hermes: DaisyUI-based mentions (lazy loaded)
 * - apollo: Native HTML + Tailwind mentions (lazy loaded)
 * - athena: Re-exports apollo implementation
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Mentions
 *   options={[
 *     { value: 'john', label: 'John Doe' },
 *     { value: 'jane', label: 'Jane Smith' },
 *   ]}
 *   placeholder="Type @ to mention someone"
 * />
 *
 * // With custom prefix
 * <Mentions
 *   prefix={['@', '#']}
 *   options={users}
 *   onSelect={(option, prefix) => console.log(option, prefix)}
 * />
 *
 * // Controlled
 * <Mentions
 *   value={text}
 *   onChange={setText}
 *   options={suggestions}
 * />
 * ```
 */
export const Mentions = createEngineComponent<MentionsProps>(
  {
    titan: TitanMentions,
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
  { displayName: 'Mentions' }
);
