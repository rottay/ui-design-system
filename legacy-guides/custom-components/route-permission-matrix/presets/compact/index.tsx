'use client';

/**
 * RoutePermissionMatrix - Compact Preset
 * Grouped by module with expand/collapse. Shows permissions in a condensed format.
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { RoutePermissionMatrixProps, PermissionLevel } from '../../core';
import {
  getPermissionColors,
  getPermissionIcon,
  cyclePermissionLevel,
  groupRoutesByModule,
} from '../../core';
import {
  createCardStyle,
  createHoverStyle,
  createEmptyStateStyle,
  createBadgeStyle,
} from '../../../helpers';

export const CompactRoutePermissionMatrix = createPreset<RoutePermissionMatrixProps>({
  name: 'RoutePermissionMatrix.Compact',
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

    const grouped = groupRoutesByModule(routes);
    const moduleNames = Object.keys(grouped);

    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
      const initial: Record<string, boolean> = {};
      for (const mod of moduleNames) {
        initial[mod] = true;
      }
      return initial;
    });

    const toggleModule = (mod: string) => {
      setExpandedModules(prev => ({ ...prev, [mod]: !prev[mod] }));
    };

    const handleCellClick = (routePath: string, role: string, currentLevel: PermissionLevel) => {
      if (!onTogglePermission) return;
      const nextLevel = cyclePermissionLevel(currentLevel);
      onTogglePermission(routePath, role, nextLevel);
    };

    const handleBulkModuleUpdate = (mod: string, role: string, level: PermissionLevel) => {
      if (!onBulkUpdate) return;
      const modulePaths = grouped[mod].map(r => r.routePath);
      onBulkUpdate(role, modulePaths, level);
    };

    const getModuleSummary = (mod: string) => {
      const moduleRoutes = grouped[mod];
      const totalCells = moduleRoutes.length * roles.length;
      let fullCount = 0;
      let readCount = 0;
      let conditionalCount = 0;
      let noneCount = 0;

      for (const route of moduleRoutes) {
        for (const role of roles) {
          const level = route.permissions[role] ?? 'none';
          if (level === 'full') fullCount++;
          else if (level === 'read') readCount++;
          else if (level === 'conditional') conditionalCount++;
          else noneCount++;
        }
      }

      return { totalCells, fullCount, readCount, conditionalCount, noneCount };
    };

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
          padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}>
          <Box style={{ flex: 1 }}>
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: subtitle ? tokens.spacing[1] : 0,
            }}>
              {title}
            </Box>
            {subtitle && (
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                lineHeight: tokens.typography.lineHeight.relaxed,
              }}>
                {subtitle}
              </Box>
            )}
          </Box>
          {/* Compact legend */}
          <Box style={{
            display: 'flex',
            gap: tokens.spacing[2],
            alignItems: 'center',
            flexShrink: 0,
          }}>
            {(['full', 'read', 'conditional', 'none'] as PermissionLevel[]).map((level) => (
              <Box key={level} style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.xs,
                color: permColors[level].color,
              }}>
                <span style={{ fontWeight: tokens.typography.fontWeight.bold }}>
                  {getPermissionIcon(level)}
                </span>
                <span style={{ color: tokens.colors.neutral[500], textTransform: 'capitalize' }}>
                  {level}
                </span>
              </Box>
            ))}
          </Box>
        </Box>

        {loading ? (
          <Box style={{
            ...createEmptyStateStyle(tokens),
            padding: tokens.spacing[8],
            fontSize: tokens.typography.fontSize.sm,
          }}>
            Loading permissions...
          </Box>
        ) : routes.length === 0 ? (
          <Box style={{
            ...createEmptyStateStyle(tokens),
            padding: tokens.spacing[8],
            fontSize: tokens.typography.fontSize.sm,
          }}>
            No routes configured
          </Box>
        ) : (
          <Box style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            {moduleNames.map((mod) => {
              const isExpanded = expandedModules[mod] ?? false;
              const moduleRoutes = grouped[mod];
              const summary = getModuleSummary(mod);

              return (
                <Box key={mod} style={{
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                }}>
                  {/* Module header - clickable to expand/collapse */}
                  <button
                    onClick={() => toggleModule(mod)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
                      border: 'none',
                      backgroundColor: isExpanded
                        ? tokens.colors.neutral[50]
                        : tokens.colors.common.white,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: `all ${tokens.motion.hover}`,
                      textAlign: 'left',
                    }}
                  >
                    {/* Expand/collapse chevron */}
                    <Box style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                      transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: `transform ${tokens.motion.hover}`,
                      flexShrink: 0,
                    }}>
                      {'\u25BC'}
                    </Box>

                    {/* Module name */}
                    <Box style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[800],
                      flex: 1,
                    }}>
                      {mod}
                      <span style={{
                        fontWeight: tokens.typography.fontWeight.normal,
                        color: tokens.colors.neutral[400],
                        marginLeft: tokens.spacing[2],
                        fontSize: tokens.typography.fontSize.xs,
                      }}>
                        ({moduleRoutes.length} route{moduleRoutes.length !== 1 ? 's' : ''})
                      </span>
                    </Box>

                    {/* Summary badges when collapsed */}
                    {!isExpanded && (
                      <Box style={{
                        display: 'flex',
                        gap: tokens.spacing[2],
                        alignItems: 'center',
                        flexShrink: 0,
                      }}>
                        {summary.fullCount > 0 && (
                          <Box style={{
                            padding: `0 ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: permColors.full.bg,
                            color: permColors.full.color,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${permColors.full.border}`,
                            lineHeight: '20px',
                          }}>
                            {summary.fullCount} full
                          </Box>
                        )}
                        {summary.readCount > 0 && (
                          <Box style={{
                            padding: `0 ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: permColors.read.bg,
                            color: permColors.read.color,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${permColors.read.border}`,
                            lineHeight: '20px',
                          }}>
                            {summary.readCount} read
                          </Box>
                        )}
                        {summary.conditionalCount > 0 && (
                          <Box style={{
                            padding: `0 ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: permColors.conditional.bg,
                            color: permColors.conditional.color,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${permColors.conditional.border}`,
                            lineHeight: '20px',
                          }}>
                            {summary.conditionalCount} cond.
                          </Box>
                        )}
                        {summary.noneCount > 0 && (
                          <Box style={{
                            padding: `0 ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: permColors.none.bg,
                            color: permColors.none.color,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${permColors.none.border}`,
                            lineHeight: '20px',
                          }}>
                            {summary.noneCount} none
                          </Box>
                        )}
                      </Box>
                    )}
                  </button>

                  {/* Expanded route list */}
                  {isExpanded && (
                    <Box style={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}>
                      {/* Role header row */}
                      <Box style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[5]}px`,
                        paddingLeft: `${tokens.spacing[5] + tokens.spacing[5]}px`,
                        backgroundColor: tokens.colors.neutral[50],
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      }}>
                        <Box style={{
                          flex: 1,
                          minWidth: 160,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[500],
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          Route
                        </Box>
                        {roles.map((role) => (
                          <Box key={role} style={{
                            width: 72,
                            textAlign: 'center',
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[500],
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            flexShrink: 0,
                          }}>
                            {role}
                          </Box>
                        ))}
                      </Box>

                      {/* Route rows */}
                      {moduleRoutes.map((route, routeIdx) => (
                        <Box key={route.routePath} style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                          paddingLeft: `${tokens.spacing[5] + tokens.spacing[5]}px`,
                          backgroundColor: routeIdx % 2 === 0
                            ? tokens.colors.common.white
                            : tokens.colors.neutral[50],
                          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                          transition: `background-color ${tokens.motion.hover}`,
                        }}>
                          {/* Route info */}
                          <Box style={{
                            flex: 1,
                            minWidth: 160,
                            overflow: 'hidden',
                          }}>
                            <Box style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[800],
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {route.routeName}
                            </Box>
                            <Box style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[400],
                              fontFamily: 'monospace',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {route.routePath}
                            </Box>
                          </Box>

                          {/* Permission cells */}
                          {roles.map((role) => {
                            const level = route.permissions[role] ?? 'none';
                            const colors = permColors[level];

                            return (
                              <Box
                                key={role}
                                onClick={() => handleCellClick(route.routePath, role, level)}
                                style={{
                                  width: 72,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  cursor: onTogglePermission ? 'pointer' : 'default',
                                }}
                              >
                                <Box style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: tokens.spacing[7],
                                  height: tokens.spacing[7],
                                  borderRadius: tokens.borderRadius.sm,
                                  backgroundColor: colors.bg,
                                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colors.border}`,
                                  color: colors.color,
                                  fontSize: tokens.typography.fontSize.xs,
                                  fontWeight: tokens.typography.fontWeight.bold,
                                  transition: `all ${tokens.motion.hover}`,
                                  ...createHoverStyle(tokens),
                                }}>
                                  {getPermissionIcon(level)}
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      ))}

                      {/* Module bulk actions */}
                      {onBulkUpdate && (
                        <Box style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                          paddingLeft: `${tokens.spacing[5] + tokens.spacing[5]}px`,
                          backgroundColor: tokens.colors.neutral[50],
                          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        }}>
                          <Box style={{
                            flex: 1,
                            minWidth: 160,
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            fontStyle: 'italic',
                          }}>
                            Set all in module:
                          </Box>
                          {roles.map((role) => (
                            <Box key={role} style={{
                              width: 72,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: tokens.spacing[1],
                              flexShrink: 0,
                            }}>
                              <button
                                onClick={() => handleBulkModuleUpdate(mod, role, 'full')}
                                title={`Grant all ${role} permissions in ${mod}`}
                                style={{
                                  width: tokens.spacing[5],
                                  height: tokens.spacing[5],
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${permColors.full.border}`,
                                  borderRadius: tokens.borderRadius.sm,
                                  backgroundColor: permColors.full.bg,
                                  color: permColors.full.color,
                                  fontSize: tokens.typography.fontSize.xs,
                                  cursor: 'pointer',
                                  fontFamily: 'inherit',
                                  padding: 0,
                                  transition: `all ${tokens.motion.hover}`,
                                }}
                              >
                                {getPermissionIcon('full')}
                              </button>
                              <button
                                onClick={() => handleBulkModuleUpdate(mod, role, 'none')}
                                title={`Revoke all ${role} permissions in ${mod}`}
                                style={{
                                  width: tokens.spacing[5],
                                  height: tokens.spacing[5],
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${permColors.none.border}`,
                                  borderRadius: tokens.borderRadius.sm,
                                  backgroundColor: permColors.none.bg,
                                  color: permColors.none.color,
                                  fontSize: tokens.typography.fontSize.xs,
                                  cursor: 'pointer',
                                  fontFamily: 'inherit',
                                  padding: 0,
                                  transition: `all ${tokens.motion.hover}`,
                                }}
                              >
                                {getPermissionIcon('none')}
                              </button>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        {/* Footer summary */}
        {!loading && routes.length > 0 && (
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
          }}>
            <span>
              {routes.length} route{routes.length !== 1 ? 's' : ''} in {moduleNames.length} module{moduleNames.length !== 1 ? 's' : ''}
            </span>
            <span>
              {roles.length} role{roles.length !== 1 ? 's' : ''}
            </span>
          </Box>
        )}
      </Box>
    );
  },
});
