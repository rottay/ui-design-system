'use client';

/**
 * Tree Component
 *
 * Multi-engine hierarchical tree component.
 * Supports titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import { createEngineComponent, lazyEngine } from '../../../engine';
import type { TreeProps } from './types';

// Default engine (titan) - loaded synchronously
import TitanTree from './engines/titan';

// Lazy-loaded engines
const HermesTree = lazyEngine(() => import('./engines/hermes'));
const ApolloTree = lazyEngine(() => import('./engines/apollo'));
const AthenaTree = lazyEngine(() => import('./engines/athena'));

/**
 * Tree component with multi-engine support
 */
export const Tree = createEngineComponent<TreeProps>({
  titan: TitanTree,
  hermes: HermesTree,
  apollo: ApolloTree,
  athena: AthenaTree,
});

Tree.displayName = 'Tree';
