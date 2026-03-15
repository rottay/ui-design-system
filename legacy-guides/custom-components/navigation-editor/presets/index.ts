/**
 * NavigationEditor - Presets Export
 */

import type { NavigationEditorPreset, NavigationEditorProps } from '../core';
import { StandardNavigationEditor } from './standard';
import { AdvancedNavigationEditor } from './advanced';

export { StandardNavigationEditor } from './standard';
export { AdvancedNavigationEditor } from './advanced';

export const NAVIGATION_EDITOR_PRESETS: Record<
  NavigationEditorPreset,
  React.ComponentType<NavigationEditorProps>
> = {
  standard: StandardNavigationEditor,
  advanced: AdvancedNavigationEditor,
};
