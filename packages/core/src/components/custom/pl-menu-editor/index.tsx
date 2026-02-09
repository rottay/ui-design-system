/**
 * PlMenuEditor - Main Export
 * Build and organize navigation menus with drag-and-drop tree editor
 */

import type { PlMenuEditorProps } from './core';
import { PL_MENU_EDITOR_DEFAULTS } from './core';
import { PL_MENU_EDITOR_PRESETS } from './presets';

export { type PlMenuEditorProps, type PlMenuEditorPreset, PL_MENU_EDITOR_DEFAULTS } from './core';
export * from './presets';

export function PlMenuEditor(props: PlMenuEditorProps): React.ReactElement {
  const preset = props.preset ?? PL_MENU_EDITOR_DEFAULTS.preset ?? 'tree';
  const PresetComponent = PL_MENU_EDITOR_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlMenuEditor.displayName = 'PlMenuEditor';
