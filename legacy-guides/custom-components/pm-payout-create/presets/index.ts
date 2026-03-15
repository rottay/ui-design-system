/**
 * PmPayoutCreate - All Presets
 */

export { FormPmPayoutCreate } from './form';
export { WizardPmPayoutCreate } from './wizard';

import type { PmPayoutCreatePreset } from '../core';
import type { ComponentType } from 'react';
import type { PmPayoutCreateProps } from '../core';
import { FormPmPayoutCreate } from './form';
import { WizardPmPayoutCreate } from './wizard';

export const PM_PAYOUT_CREATE_PRESETS: Record<PmPayoutCreatePreset, ComponentType<PmPayoutCreateProps>> = {
  form: FormPmPayoutCreate,
  wizard: WizardPmPayoutCreate,
};
