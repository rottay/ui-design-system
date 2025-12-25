'use client';

/**
 * Calendar Component
 *
 * Multi-engine calendar component.
 * Supports titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import { createEngineComponent, lazyEngine } from '../../../engine';
import type { CalendarProps } from './types';

// Default engine (titan) - loaded synchronously
import TitanCalendar from './engines/titan';

// Lazy-loaded engines
const HermesCalendar = lazyEngine(() => import('./engines/hermes'));
const ApolloCalendar = lazyEngine(() => import('./engines/apollo'));
const AthenaCalendar = lazyEngine(() => import('./engines/athena'));

/**
 * Calendar component with multi-engine support
 */
export const Calendar = createEngineComponent<CalendarProps>({
  titan: TitanCalendar,
  hermes: HermesCalendar,
  apollo: ApolloCalendar,
  athena: AthenaCalendar,
});

Calendar.displayName = 'Calendar';
