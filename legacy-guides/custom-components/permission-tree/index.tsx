import type { PermissionTreeProps } from './core';
import { PERMISSION_TREE_DEFAULTS } from './core';
import { PERMISSION_TREE_PRESETS } from './presets';

export {
  type PermissionTreeProps,
  type PermissionTreePreset,
  type PermissionItem,
  PERMISSION_TREE_DEFAULTS,
} from './core';
export * from './presets';

export function PermissionTree(props: PermissionTreeProps): React.ReactElement {
  const preset = props.preset ?? PERMISSION_TREE_DEFAULTS.preset ?? 'grid';
  const PresetComponent = PERMISSION_TREE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PermissionTree.displayName = 'PermissionTree';
