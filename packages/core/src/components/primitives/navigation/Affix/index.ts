/**
 * Affix - Engine Router
 * Makes elements stick to viewport when scrolling
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { AffixProps } from './types';

// Export types
export type { AffixProps, AffixState } from './types';
export { AFFIX_DEFAULTS } from './types';

// Export base component
export { BaseAffix } from './base';

// Create engine-aware Affix component
export const Affix = createEngineComponent<AffixProps>('Affix', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Affix;
