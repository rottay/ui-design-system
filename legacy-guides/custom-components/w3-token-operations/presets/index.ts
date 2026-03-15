/**
 * W3TokenOperations - All Presets
 */

export { PanelW3TokenOperations } from './panel';
export { FormW3TokenOperations } from './form';

import type { W3TokenOperationsPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3TokenOperationsProps } from '../core';
import { PanelW3TokenOperations } from './panel';
import { FormW3TokenOperations } from './form';

export const W3_TOKEN_OPERATIONS_PRESETS: Record<W3TokenOperationsPreset, ComponentType<W3TokenOperationsProps>> = {
  panel: PanelW3TokenOperations,
  form: FormW3TokenOperations,
};
