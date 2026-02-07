import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type CrmTablePreset = 'standard' | 'enriched';

export type CrmColumnType = 'text' | 'badge' | 'company' | 'size' | 'link' | 'icon';

export type CompanySizeCategory = 'tiny' | 'small' | 'medium' | 'large' | 'enterprise';

export interface CrmColumn {
  key: string;
  label: string;
  type: CrmColumnType;
  width?: number | string;
  sortable?: boolean;
  visible?: boolean;
  editable?: boolean;
}

export interface ContextMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  divider?: boolean;
  onClick?: () => void;
}

export interface BreadcrumbItem {
  key: string;
  label: string;
  onClick?: () => void;
}

export interface CrmTableProps extends EngineAwareProps {
  preset?: CrmTablePreset;
  columns: CrmColumn[];
  data: Array<Record<string, unknown>>;
  breadcrumbs?: BreadcrumbItem[];
  onRowClick?: (row: Record<string, unknown>) => void;
  onEnrich?: () => void;
  onFindPeople?: () => void;
  contextMenuItems?: ContextMenuItem[];
  onContextMenuAction?: (key: string, rowIndex: number) => void;
  selectedRows?: number[];
  onRowSelect?: (indices: number[]) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  onColumnVisibilityChange?: (column: string, visible: boolean) => void;
  viewMode?: 'table' | 'graph';
  onViewModeChange?: (mode: 'table' | 'graph') => void;
  title?: string;
  totalCount?: number;
  loading?: boolean;
  /** Enable inline cell editing (double-click to edit) */
  editable?: boolean;
  /** Cell edit handler */
  onCellEdit?: (rowIndex: number, columnKey: string, value: unknown) => void;
  className?: string;
  style?: CSSProperties;
}

export const CRM_TABLE_DEFAULTS: Partial<CrmTableProps> = {
  preset: 'standard',
  viewMode: 'table',
  title: 'Companies',
};

export function getSizeBadgeColors(tokens: DesignTokens): Record<CompanySizeCategory, { color: string; bgColor: string }> {
  return {
    tiny: { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[100] },
    small: { color: tokens.colors.successScale[800], bgColor: tokens.colors.successScale[50] },
    medium: { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50] },
    large: { color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50] },
    enterprise: { color: tokens.colors.primaryScale[700], bgColor: tokens.colors.primaryScale[50] },
  };
}

export function getCrmBadgeColors(tokens: DesignTokens) {
  return {
    default: { color: tokens.colors.neutral[700], bgColor: tokens.colors.neutral[100] },
    primary: { color: tokens.colors.primaryScale[700], bgColor: tokens.colors.primaryScale[50] },
    success: { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50] },
    warning: { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50] },
    error: { color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50] },
  };
}

export function getValue(row: Record<string, unknown>, key: string): unknown {
  return row[key];
}

export function compareValues(a: unknown, b: unknown, direction: 'asc' | 'desc'): number {
  const strA = String(a ?? '');
  const strB = String(b ?? '');
  const result = strA.localeCompare(strB, undefined, { numeric: true });
  return direction === 'asc' ? result : -result;
}

export function categorizeSizeRange(count: number): CompanySizeCategory {
  if (count < 10) return 'tiny';
  if (count < 50) return 'small';
  if (count < 200) return 'medium';
  if (count < 1000) return 'large';
  return 'enterprise';
}
