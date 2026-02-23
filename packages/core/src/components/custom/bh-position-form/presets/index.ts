/**
 * BhPositionForm - All Presets
 */

import type { BhPositionFormPreset, BhPositionFormProps } from '../core';
import type { ComponentType } from 'react';
import { FullBhPositionForm } from './full';
import { CompactBhPositionForm } from './compact';

export { FullBhPositionForm } from './full';
export { CompactBhPositionForm } from './compact';

export const BH_POSITION_FORM_PRESETS: Record<BhPositionFormPreset, ComponentType<BhPositionFormProps>> = {
  full: FullBhPositionForm,
  compact: CompactBhPositionForm,
};
