/**
 * BhAppealForm - All Presets
 */

import type { BhAppealFormPreset } from '../core';
import { FormBhAppealForm } from './form';
import { CompactBhAppealForm } from './compact';

export { FormBhAppealForm } from './form';
export { CompactBhAppealForm } from './compact';

export const BH_APPEAL_FORM_PRESETS: Record<BhAppealFormPreset, React.ComponentType<any>> = {
  'form': FormBhAppealForm,
  'compact': CompactBhAppealForm,
};
