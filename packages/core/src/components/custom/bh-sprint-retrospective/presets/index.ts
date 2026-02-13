/**
 * BhSprintRetrospective - All Presets
 */

export { FormBhSprintRetrospective } from './form';
export { CompactBhSprintRetrospective } from './compact';

import type { BhSprintRetrospectivePreset } from '../core';
import type { ComponentType } from 'react';
import type { BhSprintRetrospectiveProps } from '../core';
import { FormBhSprintRetrospective } from './form';
import { CompactBhSprintRetrospective } from './compact';

export const BH_SPRINT_RETROSPECTIVE_PRESETS: Record<BhSprintRetrospectivePreset, ComponentType<BhSprintRetrospectiveProps>> = {
  form: FormBhSprintRetrospective,
  compact: CompactBhSprintRetrospective,
};
