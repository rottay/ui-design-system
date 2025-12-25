'use client';

/**
 * Anchor Component
 *
 * Multi-engine anchor navigation with scroll tracking.
 * Supports titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import { createEngineComponent, lazyEngine } from '../../../engine';
import type { AnchorProps } from './types';

import TitanAnchor from './engines/titan';

const HermesAnchor = lazyEngine(() => import('./engines/hermes'));
const ApolloAnchor = lazyEngine(() => import('./engines/apollo'));
const AthenaAnchor = lazyEngine(() => import('./engines/athena'));

/**
 * Anchor component with multi-engine support
 */
export const Anchor = createEngineComponent<AnchorProps>({
  titan: TitanAnchor,
  hermes: HermesAnchor,
  apollo: ApolloAnchor,
  athena: AthenaAnchor,
});

Anchor.displayName = 'Anchor';
