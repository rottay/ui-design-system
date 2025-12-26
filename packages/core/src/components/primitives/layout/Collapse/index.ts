/**
 * Collapse - Engine Router (Compound Component)
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { CollapseProps, CollapsePanelProps } from './types';

export {
  type CollapseProps,
  type CollapsePanelProps,
  COLLAPSE_DEFAULTS,
} from './types';

const CollapseBase = createEngineComponent<CollapseProps>('Collapse', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Collapse })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Collapse })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Collapse })),
});

const Panel = createEngineComponent<CollapsePanelProps>('Collapse.Panel', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Panel })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Panel })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Panel })),
});

export const Collapse = Object.assign(CollapseBase, {
  Panel,
});

export default Collapse;
