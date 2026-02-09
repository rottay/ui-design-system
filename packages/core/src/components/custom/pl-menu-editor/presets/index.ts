/**
 * PlMenuEditor - All Presets
 */

export { TreePlMenuEditor } from './tree';
export { VisualPlMenuEditor } from './visual';

import type { PlMenuEditorPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlMenuEditorProps } from '../core';
import { TreePlMenuEditor } from './tree';
import { VisualPlMenuEditor } from './visual';

export const PL_MENU_EDITOR_PRESETS: Record<PlMenuEditorPreset, ComponentType<PlMenuEditorProps>> = {
  tree: TreePlMenuEditor,
  visual: VisualPlMenuEditor,
};
