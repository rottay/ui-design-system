'use client';

/**
 * Timeline Component
 *
 * Multi-engine timeline display component.
 * Supports titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import { createEngineComponent, lazyEngine } from '../../../engine';
import type { TimelineProps } from './types';

// Default engine (titan) - loaded synchronously
import TitanTimeline from './engines/titan';

// Lazy-loaded engines
const HermesTimeline = lazyEngine(() => import('./engines/hermes'));
const ApolloTimeline = lazyEngine(() => import('./engines/apollo'));
const AthenaTimeline = lazyEngine(() => import('./engines/athena'));

/**
 * Timeline component with multi-engine support
 */
export const Timeline = createEngineComponent<TimelineProps>({
  titan: TitanTimeline,
  hermes: HermesTimeline,
  apollo: ApolloTimeline,
  athena: AthenaTimeline,
});

Timeline.displayName = 'Timeline';
