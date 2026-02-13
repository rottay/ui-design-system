/**
 * BhWorkflowStageEditor - Main Export
 * Drag-drop stage reordering for BitHire ATS platform
 */

import type { BhWorkflowStageEditorProps } from './core';
import { BH_WORKFLOW_STAGE_EDITOR_DEFAULTS } from './core';
import { BH_WORKFLOW_STAGE_EDITOR_PRESETS } from './presets';

export {
  type BhWorkflowStageEditorProps,
  type BhWorkflowStageEditorPreset,
  type WorkflowStage,
  BH_WORKFLOW_STAGE_EDITOR_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhWorkflowStageEditor component
 * Renders the appropriate preset based on the preset prop
 */
export function BhWorkflowStageEditor(props: BhWorkflowStageEditorProps): React.ReactElement {
  const preset = props.preset ?? BH_WORKFLOW_STAGE_EDITOR_DEFAULTS.preset ?? 'editor';
  const PresetComponent = BH_WORKFLOW_STAGE_EDITOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhWorkflowStageEditor.displayName = 'BhWorkflowStageEditor';

export { EditorBhWorkflowStageEditor, CompactBhWorkflowStageEditor } from './presets';
