/**
 * BhWorkflowStageEditor - All Presets
 */

export { EditorBhWorkflowStageEditor } from './editor';
export { CompactBhWorkflowStageEditor } from './compact';

import type { BhWorkflowStageEditorPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhWorkflowStageEditorProps } from '../core';
import { EditorBhWorkflowStageEditor } from './editor';
import { CompactBhWorkflowStageEditor } from './compact';

export const BH_WORKFLOW_STAGE_EDITOR_PRESETS: Record<BhWorkflowStageEditorPreset, ComponentType<BhWorkflowStageEditorProps>> = {
  editor: EditorBhWorkflowStageEditor,
  compact: CompactBhWorkflowStageEditor,
};
