/**
 * Affix - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { AffixProps } from './types';

export { type AffixProps, AFFIX_DEFAULTS } from './types';

export const Affix = createEngineComponent<AffixProps>('Affix', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Affix;
