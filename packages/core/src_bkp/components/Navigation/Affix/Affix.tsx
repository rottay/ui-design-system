'use client';

/**
 * Affix Component
 *
 * Multi-engine affix wrapper with sticky/fixed positioning.
 * Supports titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import { createEngineComponent, lazyEngine } from '../../../engine';
import type { AffixProps } from './types';

import TitanAffix from './engines/titan';

const HermesAffix = lazyEngine(() => import('./engines/hermes'));
const ApolloAffix = lazyEngine(() => import('./engines/apollo'));
const AthenaAffix = lazyEngine(() => import('./engines/athena'));

/**
 * Affix component with multi-engine support
 */
export const Affix = createEngineComponent<AffixProps>({
  titan: TitanAffix,
  hermes: HermesAffix,
  apollo: ApolloAffix,
  athena: AthenaAffix,
});

Affix.displayName = 'Affix';
