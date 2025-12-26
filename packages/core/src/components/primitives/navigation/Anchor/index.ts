/**
 * Anchor - Engine Router (Compound Component)
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { AnchorProps, AnchorLinkProps } from './types';

export {
  type AnchorProps,
  type AnchorLinkProps,
  ANCHOR_DEFAULTS,
} from './types';

const AnchorBase = createEngineComponent<AnchorProps>('Anchor', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Anchor })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Anchor })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Anchor })),
});

const Link = createEngineComponent<AnchorLinkProps>('Anchor.Link', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Link })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Link })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Link })),
});

export const Anchor = Object.assign(AnchorBase, {
  Link,
});

export default Anchor;
