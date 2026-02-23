/**
 * NotificationTemplateEditor - All Presets
 */

import type { NotificationTemplateEditorPreset, NotificationTemplateEditorProps } from '../core';
import type { ComponentType } from 'react';
import { EditorNotificationTemplateEditor } from './editor';
import { PreviewNotificationTemplateEditor } from './preview';
import { ListNotificationTemplateEditor } from './list';

export { EditorNotificationTemplateEditor } from './editor';
export { PreviewNotificationTemplateEditor } from './preview';
export { ListNotificationTemplateEditor } from './list';

export const NOTIFICATION_TEMPLATE_EDITOR_PRESETS: Record<NotificationTemplateEditorPreset, ComponentType<NotificationTemplateEditorProps>> = {
  editor: EditorNotificationTemplateEditor,
  preview: PreviewNotificationTemplateEditor,
  list: ListNotificationTemplateEditor,
};
