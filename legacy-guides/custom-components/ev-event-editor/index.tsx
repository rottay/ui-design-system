/**
 * EvEventEditor - Main Export
 * Event creation/editing wizard
 * Automatically selects preset based on props
 */

import type { EvEventEditorProps } from './core';
import { EV_EVENT_EDITOR_DEFAULTS } from './core';
import { EV_EVENT_EDITOR_PRESETS } from './presets';

export {
  type EvEventEditorProps,
  type EvEventEditorPreset,
  type EditorStep as EvEventEditorEditorStep,
  type EventFormData as EvEventEditorEventFormData,
  EV_EVENT_EDITOR_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvEventEditor component
 * Renders the appropriate preset based on the preset prop
 */
export function EvEventEditor(props: EvEventEditorProps): React.ReactElement {
  const preset = props.preset ?? EV_EVENT_EDITOR_DEFAULTS.preset ?? 'wizard';
  const PresetComponent = EV_EVENT_EDITOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvEventEditor.displayName = 'EvEventEditor';

export { WizardEvEventEditor, SinglePageEvEventEditor } from './presets';
