/**
 * PmRefundCreate - All Presets
 */

export { FormPmRefundCreate } from './form';
export { WizardPmRefundCreate } from './wizard';

import type { PmRefundCreatePreset } from '../core';
import type { ComponentType } from 'react';
import type { PmRefundCreateProps } from '../core';
import { FormPmRefundCreate } from './form';
import { WizardPmRefundCreate } from './wizard';

export const PM_REFUND_CREATE_PRESETS: Record<PmRefundCreatePreset, ComponentType<PmRefundCreateProps>> = {
  form: FormPmRefundCreate,
  wizard: WizardPmRefundCreate,
};
