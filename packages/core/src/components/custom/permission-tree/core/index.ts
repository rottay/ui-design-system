import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PermissionTreePreset = 'grid' | 'list';

export interface PermissionItem {
  key: string;
  label: string;
  description?: string;
  category?: string;
}

export interface PermissionTreeProps extends EngineAwareProps {
  preset?: PermissionTreePreset;
  items: PermissionItem[];
  checkedKeys?: string[];
  onCheck?: (keys: string[]) => void;
  grantedKeys?: string[];
  showStatus?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  grantedLabel?: string;
  deniedLabel?: string;
  searchPlaceholder?: string;
  className?: string;
  style?: CSSProperties;
}

export const PERMISSION_TREE_DEFAULTS: Partial<PermissionTreeProps> = {
  preset: 'grid',
  showStatus: false,
  disabled: false,
  searchable: false,
  grantedLabel: 'Granted',
  deniedLabel: 'Denied',
  searchPlaceholder: 'Search permissions...',
};
