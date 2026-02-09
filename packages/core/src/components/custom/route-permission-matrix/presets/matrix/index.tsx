'use client';

/**
 * RoutePermissionMatrix - Matrix Preset
 * Full grid view: routes as rows, roles as columns, colored cells with permission icons.
 * Click cells to cycle through permission levels.
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { RoutePermissionMatrixProps, PermissionLevel } from '../../core';
import {
  getPermissionColors,
  getPermissionIcon,
  cyclePermissionLevel,
} from '../../core';
import {
  createCardStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createEmptyStateStyle,
  createBadgeStyle,
} from '../../../helpers';

export const MatrixRoutePermissionMatrix = createPreset<RoutePermissionMatrixProps>({
  name: 'RoutePermissionMatrix.Matrix',
  render: ({ primitives, props, tokens }: PresetContext<RoutePermissionMatrixProps>) => {
    const { Box } = primitives;
    const permColors = getPermissionColors(tokens);

    const {
      routes,
      roles,
      onTogglePermission,
      onBulkUpdate,
      title = 'Route Permissions',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [hoveredCell, setHoveredCell] = useState<string | null>(null);
    const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

    const handleCellClick = (routePath: string, role: string, currentLevel: PermissionLevel) => {
      if (!onTogglePermission) return;
      const nextLevel = cyclePermissionLevel(currentLevel);
      onTogglePermission(routePath, role, nextLevel);
    };

    const handleBulkColumnUpdate = (role: string, level: PermissionLevel) => {
      if (!onBulkUpdate) return;
      const routePaths = routes.map(r => r.routePath);
      onBulkUpdate(role, routePaths, level);
    };

    const cellKey = (routePath: string, role: string) => `${routePath}::${role}`;

    return (
      <Box className={className} style={{
        ...createCardStyle(tokens, { elevation: 'md' }),
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden',
        ...style,
      }}>
        {/* Header */}
        <Box style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}>
          <Box style={{ flex: 1 }}>
            <Box style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: subtitle ? tokens.spacing[1] : 0,
            }}>
              {title}
            </Box>
            {subtitle && (
              <Box style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                lineHeight: tokens.typography.lineHeight.relaxed,
              }}>
                {subtitle}
              </Box>
            )}
          </Box>

          {/* Legend */}
          <Box style={{
            display: 'flex',
            gap: tokens.spacing[3],
            alignItems: 'center',
            flexShrink: 0,
          }}>
            {(['full', 'read', 'conditional', 'none'] as PermissionLevel[]).map((level) => (
              <Box key={level} style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[600],
              }}>
                <Box style={{
                  width: tokens.spacing[4],
                  height: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: permColors[level].bg,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${permColors[level].border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize.xs,
                  color: permColors[level].color,
                  fontWeight: tokens.typography.fontWeight.bold,
                  lineHeight: 1,
                }}>
                  {getPermissionIcon(level)}
                </Box>
                <span style={{ textTransform: 'capitalize' }}>{level}</span>
              </Box>
            ))}
          </Box>
        </Box>

        {loading ? (
          <Box style={{
            ...createEmptyStateStyle(tokens),
            padding: tokens.spacing[10],
          }}>
            Loading permissions...
          </Box>
        ) : routes.length === 0 ? (
          <Box style={{
            ...createEmptyStateStyle(tokens),
            padding: tokens.spacing[10],
          }}>
            No routes configured
          </Box>
        ) : (
          <Box style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'inherit',
            }}>
              <thead>
                <tr>
                  {/* Route column header */}
                  <th style={{
                    ...createPanelHeaderStyle(tokens),
                    textAlign: 'left',
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[600],
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    position: 'sticky',
                    left: 0,
                    zIndex: 2,
                    backgroundColor: tokens.colors.neutral[50],
                    minWidth: 220,
                  }}>
                    Route
                  </th>
                  {/* Module column header */}
                  <th style={{
                    ...createPanelHeaderStyle(tokens),
                    textAlign: 'left',
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[600],
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    minWidth: 100,
                  }}>
                    Module
                  </th>
                  {/* Role column headers */}
                  {roles.map((role) => (
                    <th
                      key={role}
                      onMouseEnter={() => setHoveredColumn(role)}
                      onMouseLeave={() => setHoveredColumn(null)}
                      style={{
                        ...createPanelHeaderStyle(tokens),
                        textAlign: 'center',
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: hoveredColumn === role
                          ? tokens.colors.primaryScale[700]
                          : tokens.colors.neutral[600],
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        minWidth: 90,
                        cursor: onBulkUpdate ? 'pointer' : 'default',
                        transition: `all ${tokens.motion.hover}`,
                        backgroundColor: hoveredColumn === role
                          ? tokens.colors.primaryScale[50]
                          : tokens.colors.neutral[50],
                      }}
                    >
                      <Box style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                      }}>
                        <span>{role}</span>
                        {onBulkUpdate && hoveredColumn === role && (
                          <Box style={{
                            display: 'flex',
                            gap: tokens.spacing[1],
                          }}>
                            {(['full', 'none'] as PermissionLevel[]).map((level) => (
                              <button
                                key={level}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBulkColumnUpdate(role, level);
                                }}
                                style={{
                                  padding: `0 ${tokens.spacing[1]}px`,
                                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${permColors[level].border}`,
                                  borderRadius: tokens.borderRadius.sm,
                                  backgroundColor: permColors[level].bg,
                                  color: permColors[level].color,
                                  fontSize: tokens.typography.fontSize.xs,
                                  cursor: 'pointer',
                                  fontFamily: 'inherit',
                                  lineHeight: '18px',
                                  transition: `all ${tokens.motion.hover}`,
                                }}
                              >
                                {level === 'full' ? 'All' : 'None'}
                              </button>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routes.map((route, rowIdx) => (
                  <tr key={route.routePath} style={{
                    backgroundColor: rowIdx % 2 === 0
                      ? tokens.colors.common.white
                      : tokens.colors.neutral[50],
                  }}>
                    {/* Route name + path */}
                    <td style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      position: 'sticky',
                      left: 0,
                      backgroundColor: rowIdx % 2 === 0
                        ? tokens.colors.common.white
                        : tokens.colors.neutral[50],
                      zIndex: 1,
                    }}>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[900],
                        lineHeight: tokens.typography.lineHeight.tight,
                      }}>
                        {route.routeName}
                      </Box>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                        fontFamily: 'monospace',
                        marginTop: tokens.spacing[0],
                      }}>
                        {route.routePath}
                      </Box>
                    </td>
                    {/* Module */}
                    <td style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    }}>
                      <Box style={{
                        ...createBadgeStyle(tokens, 'secondary'),
                        fontSize: tokens.typography.fontSize.xs,
                      }}>
                        {route.module}
                      </Box>
                    </td>
                    {/* Permission cells */}
                    {roles.map((role) => {
                      const level = route.permissions[role] ?? 'none';
                      const colors = permColors[level];
                      const key = cellKey(route.routePath, role);
                      const isHovered = hoveredCell === key;

                      return (
                        <td
                          key={role}
                          onMouseEnter={() => setHoveredCell(key)}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => handleCellClick(route.routePath, role, level)}
                          style={{
                            padding: tokens.spacing[1],
                            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                            textAlign: 'center',
                            cursor: onTogglePermission ? 'pointer' : 'default',
                            transition: `all ${tokens.motion.hover}`,
                            backgroundColor: hoveredColumn === role
                              ? tokens.colors.primaryScale[50]
                              : 'transparent',
                          }}
                        >
                          <Box style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: tokens.spacing[8],
                            height: tokens.spacing[8],
                            borderRadius: tokens.borderRadius.md,
                            backgroundColor: colors.bg,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isHovered ? colors.color : colors.border}`,
                            color: colors.color,
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.bold,
                            transition: `all ${tokens.motion.hover}`,
                            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                          }}>
                            {getPermissionIcon(level)}
                          </Box>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}

        {/* Footer summary */}
        {!loading && routes.length > 0 && (
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
          }}>
            <span>{routes.length} route{routes.length !== 1 ? 's' : ''} across {roles.length} role{roles.length !== 1 ? 's' : ''}</span>
            <span>Click cells to cycle permissions</span>
          </Box>
        )}
      </Box>
    );
  },
});
