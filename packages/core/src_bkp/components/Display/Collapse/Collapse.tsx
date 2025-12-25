'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { CollapseProps } from './types';
import TitanCollapse from './engines/titan';

/**
 * Collapse Component
 *
 * Multi-engine accordion/collapse that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design Collapse (default, full featured)
 * - hermes: DaisyUI-based collapse (lazy loaded)
 * - apollo: Native HTML + Tailwind collapse (lazy loaded)
 * - athena: Re-exports apollo implementation
 *
 * @example
 * ```tsx
 * // Basic usage with items
 * <Collapse
 *   items={[
 *     { key: '1', label: 'Panel 1', children: <p>Content 1</p> },
 *     { key: '2', label: 'Panel 2', children: <p>Content 2</p> },
 *   ]}
 * />
 *
 * // Accordion mode (only one open)
 * <Collapse
 *   accordion
 *   items={items}
 *   defaultActiveKey="1"
 * />
 *
 * // Controlled
 * <Collapse
 *   activeKey={activeKey}
 *   onChange={(key) => setActiveKey(key)}
 *   items={items}
 * />
 *
 * // Ghost style
 * <Collapse ghost items={items} />
 * ```
 */
export const Collapse = createEngineComponent<CollapseProps>(
  {
    titan: TitanCollapse,
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
  { displayName: 'Collapse' }
);
