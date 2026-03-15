/**
 * BhClientForm - All Presets
 */

import type { BhClientFormPreset, BhClientFormProps } from '../core';
import type { ComponentType } from 'react';
import { FullBhClientForm } from './full';
import { CompactBhClientForm } from './compact';

export { FullBhClientForm } from './full';
export { CompactBhClientForm } from './compact';

export const BH_CLIENT_FORM_PRESETS: Record<BhClientFormPreset, ComponentType<BhClientFormProps>> = {
  full: FullBhClientForm,
  compact: CompactBhClientForm,
};
