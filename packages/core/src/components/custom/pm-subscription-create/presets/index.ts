/**
 * PmSubscriptionCreate - All Presets
 */

export { WizardPmSubscriptionCreate } from './wizard';
export { FormPmSubscriptionCreate } from './form';

import type { PmSubscriptionCreatePreset } from '../core';
import type { ComponentType } from 'react';
import type { PmSubscriptionCreateProps } from '../core';
import { WizardPmSubscriptionCreate } from './wizard';
import { FormPmSubscriptionCreate } from './form';

export const PM_SUBSCRIPTION_CREATE_PRESETS: Record<PmSubscriptionCreatePreset, ComponentType<PmSubscriptionCreateProps>> = {
  wizard: WizardPmSubscriptionCreate,
  form: FormPmSubscriptionCreate,
};
