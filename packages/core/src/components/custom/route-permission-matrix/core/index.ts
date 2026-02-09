import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type RoutePermissionMatrixPreset = 'matrix' | 'compact';

export type PermissionLevel = 'full' | 'read' | 'none' | 'conditional';

export interface RoutePermission {
  routePath: string;
  routeName: string;
  module: string;
  permissions: Record<string, PermissionLevel>;
}

export interface RoutePermissionMatrixProps extends EngineAwareProps {
  preset?: RoutePermissionMatrixPreset;
  routes: RoutePermission[];
  roles: string[];
  onTogglePermission?: (routePath: string, role: string, newLevel: PermissionLevel) => void;
  onBulkUpdate?: (role: string, routes: string[], level: PermissionLevel) => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const ROUTE_PERMISSION_MATRIX_DEFAULTS: Partial<RoutePermissionMatrixProps> = {
  preset: 'matrix',
  title: 'Route Permissions',
};

/**
 * Returns color config for each permission level using token scales.
 * full = success, read = info, none = neutral, conditional = warning
 */
export function getPermissionColors(tokens: DesignTokens) {
  return {
    full: {
      bg: tokens.colors.successScale[50],
      color: tokens.colors.successScale[700],
      border: tokens.colors.successScale[200],
      icon: tokens.colors.successScale[500],
    },
    read: {
      bg: tokens.colors.infoScale[50],
      color: tokens.colors.infoScale[700],
      border: tokens.colors.infoScale[200],
      icon: tokens.colors.infoScale[500],
    },
    none: {
      bg: tokens.colors.neutral[50],
      color: tokens.colors.neutral[500],
      border: tokens.colors.neutral[200],
      icon: tokens.colors.neutral[400],
    },
    conditional: {
      bg: tokens.colors.warningScale[50],
      color: tokens.colors.warningScale[700],
      border: tokens.colors.warningScale[200],
      icon: tokens.colors.warningScale[500],
    },
  };
}

/**
 * Returns a unicode icon string for each permission level.
 */
export function getPermissionIcon(level: PermissionLevel): string {
  switch (level) {
    case 'full':
      return '\u2713'; // check mark
    case 'read':
      return '\u25CB'; // eye circle
    case 'none':
      return '\u2715'; // x mark
    case 'conditional':
      return '\u25C6'; // diamond (filter)
    default:
      return '\u2015'; // dash
  }
}

/**
 * Returns the next permission level in the cycle order.
 * full -> read -> conditional -> none -> full
 */
export function cyclePermissionLevel(current: PermissionLevel): PermissionLevel {
  const order: PermissionLevel[] = ['full', 'read', 'conditional', 'none'];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

/**
 * Groups routes by their module field.
 */
export function groupRoutesByModule(routes: RoutePermission[]): Record<string, RoutePermission[]> {
  const groups: Record<string, RoutePermission[]> = {};
  for (const route of routes) {
    const mod = route.module || 'Ungrouped';
    if (!groups[mod]) {
      groups[mod] = [];
    }
    groups[mod].push(route);
  }
  return groups;
}
