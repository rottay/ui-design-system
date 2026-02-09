/**
 * NotificationTemplateEditor - All Presets
 */

import type { NotificationTemplateEditorPreset } from '../core';
import { EditorNotificationTemplateEditor } from './editor';
import { PreviewNotificationTemplateEditor } from './preview';
import { ListNotificationTemplateEditor } from './list';

export { EditorNotificationTemplateEditor } from './editor';
export { PreviewNotificationTemplateEditor } from './preview';
export { ListNotificationTemplateEditor } from './list';

export const NOTIFICATION_TEMPLATE_EDITOR_PRESETS: Record<NotificationTemplateEditorPreset, React.ComponentType<any>> = {
  editor: EditorNotificationTemplateEditor,
  preview: PreviewNotificationTemplateEditor,
  list: ListNotificationTemplateEditor,
};
