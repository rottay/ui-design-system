'use client';

/**
 * Statistic Component
 *
 * Multi-engine statistic display component.
 * Supports titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import { createEngineComponent, lazyEngine } from '../../../engine';
import type { StatisticProps } from './types';

// Default engine (titan) - loaded synchronously
import TitanStatistic from './engines/titan';

// Lazy-loaded engines
const HermesStatistic = lazyEngine(() => import('./engines/hermes'));
const ApolloStatistic = lazyEngine(() => import('./engines/apollo'));
const AthenaStatistic = lazyEngine(() => import('./engines/athena'));

/**
 * Statistic component with multi-engine support
 */
export const Statistic = createEngineComponent<StatisticProps>({
  titan: TitanStatistic,
  hermes: HermesStatistic,
  apollo: ApolloStatistic,
  athena: AthenaStatistic,
});

Statistic.displayName = 'Statistic';
