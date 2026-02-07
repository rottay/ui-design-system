/**
 * BhRubricBuilder - All Presets
 */

import type { BhRubricBuilderPreset } from '../core';
import { EditorBhRubricBuilder } from './editor';
import { PreviewBhRubricBuilder } from './preview';

export { EditorBhRubricBuilder } from './editor';
export { PreviewBhRubricBuilder } from './preview';

export const BH_RUBRIC_BUILDER_PRESETS: Record<BhRubricBuilderPreset, React.ComponentType<any>> = {
  editor: EditorBhRubricBuilder,
  preview: PreviewBhRubricBuilder,
};
