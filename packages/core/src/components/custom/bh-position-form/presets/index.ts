/**
 * BhPositionForm - All Presets
 */

import type { BhPositionFormPreset } from '../core';
import { FullBhPositionForm } from './full';
import { CompactBhPositionForm } from './compact';

export { FullBhPositionForm } from './full';
export { CompactBhPositionForm } from './compact';

export const BH_POSITION_FORM_PRESETS: Record<BhPositionFormPreset, React.ComponentType<any>> = {
  full: FullBhPositionForm,
  compact: CompactBhPositionForm,
};
