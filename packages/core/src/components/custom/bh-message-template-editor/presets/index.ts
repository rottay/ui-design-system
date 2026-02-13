/**
 * BhMessageTemplateEditor - All Presets
 */

export { EditorBhMessageTemplateEditor } from './editor';
export { CompactBhMessageTemplateEditor } from './compact';

import type { BhMessageTemplateEditorPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhMessageTemplateEditorProps } from '../core';
import { EditorBhMessageTemplateEditor } from './editor';
import { CompactBhMessageTemplateEditor } from './compact';

export const BH_MESSAGE_TEMPLATE_EDITOR_PRESETS: Record<BhMessageTemplateEditorPreset, ComponentType<BhMessageTemplateEditorProps>> = {
  editor: EditorBhMessageTemplateEditor,
  compact: CompactBhMessageTemplateEditor,
};
