/**
 * NavigationEditor - Main Export
 * Visual editor for navigation menus with role-based access control
 *
 * @example
 * ```tsx
 * // Standard preset - basic tree editor
 * <NavigationEditor
 *   preset="standard"
 *   items={menuItems}
 *   onItemsChange={setMenuItems}
 * />
 *
 * // Advanced preset - full editor with tabs
 * <NavigationEditor
 *   preset="advanced"
 *   items={menuItems}
 *   roles={roles}
 *   permissions={permissions}
 *   policies={policies}
 *   onItemsChange={setMenuItems}
 *   onPoliciesChange={setPolicies}
 * />
 * ```
 */

import type { NavigationEditorProps } from './core';
import { NAVIGATION_EDITOR_DEFAULTS } from './core';
import { NAVIGATION_EDITOR_PRESETS } from './presets';

export {
  type NavigationEditorProps,
  type NavigationEditorPreset,
  type MenuItem,
  type MenuGroup,
  type Role,
  type Permission,
  type RoutePolicy,
  type MenuItemFormData,
  type DragItem,
  type EditorTab,
  NAVIGATION_EDITOR_DEFAULTS,
  ICON_OPTIONS,
  BADGE_COLORS,
} from './core';

export * from './presets';

/**
 * NavigationEditor component
 * Renders the appropriate preset based on the preset prop
 *
 * Presets:
 * - `standard`: Basic tree view with item editing
 * - `advanced`: Full-featured with tabs for Structure, Roles, Policies, Preview
 */
export function NavigationEditor(props: NavigationEditorProps): React.ReactElement {
  const preset = props.preset ?? NAVIGATION_EDITOR_DEFAULTS.preset ?? 'standard';
  const PresetComponent = NAVIGATION_EDITOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

NavigationEditor.displayName = 'NavigationEditor';

export default NavigationEditor;
