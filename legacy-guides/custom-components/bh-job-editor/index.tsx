/**
 * BhJobEditor - Main Export
 * Job Creation/Editing wizard for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhJobEditorProps } from './core';
import { BH_JOB_EDITOR_DEFAULTS } from './core';
import { BH_JOB_EDITOR_PRESETS } from './presets';

export {
  type BhJobEditorProps,
  type BhJobEditorPreset,
  type EmploymentType,
  type SeniorityLevel,
  type WorkArrangement,
  type JobFormData,
  type SkillTag,
  type ScreeningQuestion,
  type JobEditorStep,
  type ValidationError,
  type JobTemplate,
  type JobClient,
  BH_JOB_EDITOR_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhJobEditor component
 * Renders the appropriate preset based on the preset prop
 */
export function BhJobEditor(props: BhJobEditorProps): React.ReactElement {
  const preset = props.preset ?? BH_JOB_EDITOR_DEFAULTS.preset ?? 'wizard';
  const PresetComponent = BH_JOB_EDITOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhJobEditor.displayName = 'BhJobEditor';

export { WizardBhJobEditor, SinglePageBhJobEditor } from './presets';
