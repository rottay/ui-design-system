/**
 * BhJobEditor - All Presets
 */

import type { BhJobEditorPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhJobEditorProps } from '../core';
import { WizardBhJobEditor } from './wizard';
import { SinglePageBhJobEditor } from './single-page';

export { WizardBhJobEditor } from './wizard';
export { SinglePageBhJobEditor } from './single-page';

export const BH_JOB_EDITOR_PRESETS: Record<BhJobEditorPreset, ComponentType<BhJobEditorProps>> = {
  wizard: WizardBhJobEditor,
  'single-page': SinglePageBhJobEditor,
};
