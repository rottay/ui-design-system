/**
 * PlUserProfileEditor - All Presets
 */

export { FormPlUserProfileEditor } from './form';
export { SidebarPlUserProfileEditor } from './sidebar';

import type { PlUserProfileEditorPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlUserProfileEditorProps } from '../core';
import { FormPlUserProfileEditor } from './form';
import { SidebarPlUserProfileEditor } from './sidebar';

export const PL_USER_PROFILE_EDITOR_PRESETS: Record<PlUserProfileEditorPreset, ComponentType<PlUserProfileEditorProps>> = {
  form: FormPlUserProfileEditor,
  sidebar: SidebarPlUserProfileEditor,
};
