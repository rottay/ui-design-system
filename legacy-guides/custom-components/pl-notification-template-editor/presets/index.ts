/**
 * PlNotificationTemplateEditor - All Presets
 */

export { EditorPlNotificationTemplateEditor } from './editor';
export { PreviewPlNotificationTemplateEditor } from './preview';

import type { PlNotificationTemplateEditorPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlNotificationTemplateEditorProps } from '../core';
import { EditorPlNotificationTemplateEditor } from './editor';
import { PreviewPlNotificationTemplateEditor } from './preview';

export const PL_NOTIFICATION_TEMPLATE_EDITOR_PRESETS: Record<PlNotificationTemplateEditorPreset, ComponentType<PlNotificationTemplateEditorProps>> = {
  editor: EditorPlNotificationTemplateEditor,
  preview: PreviewPlNotificationTemplateEditor,
};
