/**
 * PlRoutePolicyEditor - All Presets
 */

export { FormPlRoutePolicyEditor } from './form';
export { MatrixPlRoutePolicyEditor } from './matrix';

import type { PlRoutePolicyEditorPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlRoutePolicyEditorProps } from '../core';
import { FormPlRoutePolicyEditor } from './form';
import { MatrixPlRoutePolicyEditor } from './matrix';

export const PL_ROUTE_POLICY_EDITOR_PRESETS: Record<PlRoutePolicyEditorPreset, ComponentType<PlRoutePolicyEditorProps>> = {
  form: FormPlRoutePolicyEditor,
  matrix: MatrixPlRoutePolicyEditor,
};
