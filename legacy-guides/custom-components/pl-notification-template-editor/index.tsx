/**
 * PlNotificationTemplateEditor - Main Export
 * Design notification templates with variables, conditions, and multi-channel preview
 */

import type { PlNotificationTemplateEditorProps } from './core';
import { PL_NOTIFICATION_TEMPLATE_EDITOR_DEFAULTS } from './core';
import { PL_NOTIFICATION_TEMPLATE_EDITOR_PRESETS } from './presets';

export { type PlNotificationTemplateEditorProps, type PlNotificationTemplateEditorPreset, PL_NOTIFICATION_TEMPLATE_EDITOR_DEFAULTS } from './core';
export * from './presets';

export function PlNotificationTemplateEditor(props: PlNotificationTemplateEditorProps): React.ReactElement {
  const preset = props.preset ?? PL_NOTIFICATION_TEMPLATE_EDITOR_DEFAULTS.preset ?? 'editor';
  const PresetComponent = PL_NOTIFICATION_TEMPLATE_EDITOR_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlNotificationTemplateEditor.displayName = 'PlNotificationTemplateEditor';
