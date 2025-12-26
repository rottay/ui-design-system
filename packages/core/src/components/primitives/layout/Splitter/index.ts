/**
 * Splitter - Engine Router (Compound Component)
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { SplitterProps, SplitterPanelProps } from './types';

export {
  type SplitterProps,
  type SplitterPanelProps,
  SPLITTER_DEFAULTS,
} from './types';

const SplitterBase = createEngineComponent<SplitterProps>('Splitter', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Splitter })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Splitter })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Splitter })),
});

const Panel = createEngineComponent<SplitterPanelProps>('Splitter.Panel', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Panel })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Panel })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Panel })),
});

export const Splitter = Object.assign(SplitterBase, {
  Panel,
});

export default Splitter;
