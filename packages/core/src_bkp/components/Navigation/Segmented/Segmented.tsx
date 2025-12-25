'use client';

/**
 * Segmented Component
 *
 * Multi-engine segmented control (iOS-style).
 * Supports titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import { createEngineComponent, lazyEngine } from '../../../engine';
import type { SegmentedProps } from './types';

import TitanSegmented from './engines/titan';

const HermesSegmented = lazyEngine(() => import('./engines/hermes'));
const ApolloSegmented = lazyEngine(() => import('./engines/apollo'));
const AthenaSegmented = lazyEngine(() => import('./engines/athena'));

/**
 * Segmented component with multi-engine support
 */
export const Segmented = createEngineComponent<SegmentedProps>({
  titan: TitanSegmented,
  hermes: HermesSegmented,
  apollo: ApolloSegmented,
  athena: AthenaSegmented,
});

Segmented.displayName = 'Segmented';
