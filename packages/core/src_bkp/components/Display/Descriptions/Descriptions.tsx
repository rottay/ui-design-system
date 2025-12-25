'use client';

/**
 * Descriptions Component
 *
 * Multi-engine descriptions/key-value list component.
 * Supports titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import { createEngineComponent, lazyEngine } from '../../../engine';
import type { DescriptionsProps } from './types';

// Default engine (titan) - loaded synchronously
import TitanDescriptions from './engines/titan';

// Lazy-loaded engines
const HermesDescriptions = lazyEngine(() => import('./engines/hermes'));
const ApolloDescriptions = lazyEngine(() => import('./engines/apollo'));
const AthenaDescriptions = lazyEngine(() => import('./engines/athena'));

/**
 * Descriptions component with multi-engine support
 */
export const Descriptions = createEngineComponent<DescriptionsProps>({
  titan: TitanDescriptions,
  hermes: HermesDescriptions,
  apollo: ApolloDescriptions,
  athena: AthenaDescriptions,
}) as ReturnType<typeof createEngineComponent<DescriptionsProps>> & {
  Item: typeof TitanDescriptions.Item;
};

// Attach Item from titan engine as default
Descriptions.Item = TitanDescriptions.Item;
Descriptions.displayName = 'Descriptions';
