/**
 * BhAppealForm - All Presets
 */

import type { BhAppealFormPreset, BhAppealFormProps } from '../core';
import type { ComponentType } from 'react';
import { FormBhAppealForm } from './form';
import { CompactBhAppealForm } from './compact';

export { FormBhAppealForm } from './form';
export { CompactBhAppealForm } from './compact';

export const BH_APPEAL_FORM_PRESETS: Record<BhAppealFormPreset, ComponentType<BhAppealFormProps>> = {
  'form': FormBhAppealForm,
  'compact': CompactBhAppealForm,
};
