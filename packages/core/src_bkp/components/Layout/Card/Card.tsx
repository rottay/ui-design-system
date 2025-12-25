'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { CardProps } from '../../../types/components/card';

// Import Titan (AntD) engine directly for default usage and subcomponents
import TitanCard from './engines/titan';

/**
 * Card Component
 *
 * Multi-engine card that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design Card (default, includes Grid and Meta subcomponents)
 * - hermes: DaisyUI Card (lazy loaded)
 * - apollo: Native HTML + Tailwind Card (lazy loaded)
 * - athena: Falls back to apollo implementation
 *
 * Note: Grid and Meta subcomponents are only available in Titan engine.
 *
 * @example
 * ```tsx
 * <Card title="Card Title" extra={<a>More</a>}>
 *   Card content
 * </Card>
 *
 * <Card
 *   cover={<img src="image.jpg" />}
 *   hoverable
 * >
 *   Content
 * </Card>
 * ```
 */
const CardBase = createEngineComponent<CardProps>({
  titan: TitanCard,
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
}, { displayName: 'Card' });

// Re-export Card with all its subcomponents from Titan
// Note: Grid and Meta are only available in Titan engine
export const Card = Object.assign(CardBase, {
  Grid: TitanCard.Grid,
  Meta: TitanCard.Meta,
});

// Export unified type
export type { CardProps } from '../../../types/components/card';
