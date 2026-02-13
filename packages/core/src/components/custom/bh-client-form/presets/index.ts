/**
 * BhClientForm - All Presets
 */

import type { BhClientFormPreset } from '../core';
import { FullBhClientForm } from './full';
import { CompactBhClientForm } from './compact';

export { FullBhClientForm } from './full';
export { CompactBhClientForm } from './compact';

export const BH_CLIENT_FORM_PRESETS: Record<BhClientFormPreset, React.ComponentType<any>> = {
  full: FullBhClientForm,
  compact: CompactBhClientForm,
};
