/**
 * BhMessageTemplateEditor - Main Export
 * Template creation/edit with variable highlighting for BitHire ATS platform
 */

import type { BhMessageTemplateEditorProps } from './core';
import { BH_MESSAGE_TEMPLATE_EDITOR_DEFAULTS } from './core';
import { BH_MESSAGE_TEMPLATE_EDITOR_PRESETS } from './presets';

export {
  type BhMessageTemplateEditorProps,
  type BhMessageTemplateEditorPreset,
  type TemplateVariable,
  BH_MESSAGE_TEMPLATE_EDITOR_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhMessageTemplateEditor component
 * Renders the appropriate preset based on the preset prop
 */
export function BhMessageTemplateEditor(props: BhMessageTemplateEditorProps): React.ReactElement {
  const preset = props.preset ?? BH_MESSAGE_TEMPLATE_EDITOR_DEFAULTS.preset ?? 'editor';
  const PresetComponent = BH_MESSAGE_TEMPLATE_EDITOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhMessageTemplateEditor.displayName = 'BhMessageTemplateEditor';

export { EditorBhMessageTemplateEditor, CompactBhMessageTemplateEditor } from './presets';
