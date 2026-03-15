/**
 * BhRubricBuilder - All Presets
 */

import type { BhRubricBuilderPreset, BhRubricBuilderProps } from '../core';
import type { ComponentType } from 'react';
import { EditorBhRubricBuilder } from './editor';
import { PreviewBhRubricBuilder } from './preview';

export { EditorBhRubricBuilder } from './editor';
export { PreviewBhRubricBuilder } from './preview';

export const BH_RUBRIC_BUILDER_PRESETS: Record<BhRubricBuilderPreset, ComponentType<BhRubricBuilderProps>> = {
  editor: EditorBhRubricBuilder,
  preview: PreviewBhRubricBuilder,
};
