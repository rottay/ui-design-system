/**
 * NotificationTemplateEditor - Main Export
 * Automatically selects preset based on props
 */

import type { NotificationTemplateEditorProps } from './core';
import { NOTIFICATION_TEMPLATE_EDITOR_DEFAULTS } from './core';
import { NOTIFICATION_TEMPLATE_EDITOR_PRESETS } from './presets';

export { type NotificationTemplateEditorProps, type NotificationTemplateEditorPreset, type NotificationTemplate, type NotificationChannel, type TemplateVariable, NOTIFICATION_TEMPLATE_EDITOR_DEFAULTS } from './core';
export * from './presets';

/**
 * NotificationTemplateEditor component
 * Renders the appropriate preset based on the preset prop
 */
export function NotificationTemplateEditor(props: NotificationTemplateEditorProps): React.ReactElement {
  const preset = props.preset ?? NOTIFICATION_TEMPLATE_EDITOR_DEFAULTS.preset ?? 'editor';
  const PresetComponent = NOTIFICATION_TEMPLATE_EDITOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

NotificationTemplateEditor.displayName = 'NotificationTemplateEditor';

export { EditorNotificationTemplateEditor, PreviewNotificationTemplateEditor, ListNotificationTemplateEditor } from './presets';
