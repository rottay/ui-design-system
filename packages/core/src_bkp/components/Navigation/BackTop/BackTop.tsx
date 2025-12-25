'use client';

/**
 * BackTop Component
 *
 * Multi-engine back-to-top button with scroll tracking.
 * Supports titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import { createEngineComponent, lazyEngine } from '../../../engine';
import type { BackTopProps } from './types';

import TitanBackTop from './engines/titan';

const HermesBackTop = lazyEngine(() => import('./engines/hermes'));
const ApolloBackTop = lazyEngine(() => import('./engines/apollo'));
const AthenaBackTop = lazyEngine(() => import('./engines/athena'));

/**
 * BackTop component with multi-engine support
 */
export const BackTop = createEngineComponent<BackTopProps>({
  titan: TitanBackTop,
  hermes: HermesBackTop,
  apollo: ApolloBackTop,
  athena: AthenaBackTop,
});

BackTop.displayName = 'BackTop';
