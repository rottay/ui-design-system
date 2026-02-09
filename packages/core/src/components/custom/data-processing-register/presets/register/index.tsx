'use client';

/**
 * DataProcessingRegister - Register Preset
 * ROPA table view with filter pills, row actions, and status indicators
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { DataProcessingRegisterProps, ProcessingActivity } from '../../core';
import { getLawfulBasisColors, getDataCategoryColors, getDataCategoryIcon } from '../../core';
import {
  createFilterPillStyle,
  createHoverStyle,
} from '../../../helpers';

type StatusFilter = 'all' | 'active' | 'draft' | 'archived';

export const RegisterDataProcessingRegister = createPreset<DataProcessingRegisterProps>({
  name: 'DataProcessingRegister.Register',
  render: ({ primitives, props, tokens, engine }: PresetContext<DataProcessingRegisterProps>) => {
    const { Box, Stack } = primitives;
    const lawfulBasisColors = getLawfulBasisColors(tokens);
    const dataCategoryColors = getDataCategoryColors(tokens);

    const {
      activities,
      onCreateActivity,
      onEditActivity,
      onDeleteActivity,
      onExport,
      selectedActivityId: selectedActivityIdProp,
      title = 'Data Processing Register',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [internalSelectedId, setInternalSelectedId] = useState(selectedActivityIdProp ?? '');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const selectedActivityId = selectedActivityIdProp ?? internalSelectedId;

    const handleSelect = (id: string) => {
      setInternalSelectedId(id);
    };

    const filteredActivities = activities.filter((a) => {
      if (statusFilter === 'all') return true;
      return a.status === statusFilter;
    });

    const statusFilters: Array<{ key: StatusFilter; label: string }> = [
      { key: 'all', label: 'All' },
      { key: 'active', label: 'Active' },
      { key: 'draft', label: 'Draft' },
      { key: 'archived', label: 'Archived' },
    ];

    const statusCounts: Record<StatusFilter, number> = {
      all: activities.length,
      active: activities.filter((a) => a.status === 'active').length,
      draft: activities.filter((a) => a.status === 'draft').length,
      archived: activities.filter((a) => a.status === 'archived').length,
    };

    const truncate = (text: string, maxLen: number) =>
      text.length > maxLen ? text.slice(0, maxLen) + '...' : text;

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Header */}
        <Box style={{ padding: `${tokens.spacing[4]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{title}</h2>
            {subtitle && (
              <p style={{ margin: `${tokens.spacing[1]}px 0 0`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{subtitle}</p>
            )}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
            </span>
            {onExport && (
              <button onClick={onExport} style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[700],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
              }}>
                Export
              </button>
            )}
            {onCreateActivity && (
              <button onClick={onCreateActivity} style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
              }}>
                + New Activity
              </button>
            )}
          </Box>
        </Box>

        {/* Filter pills */}
        <Box style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', gap: tokens.spacing[2] }}>
          {statusFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              style={{
                ...createFilterPillStyle(tokens, { active: statusFilter === filter.key }),
                border: 'none',
                fontFamily: 'inherit',
              }}
            >
              {filter.label}
              <span style={{
                marginLeft: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.xs,
                opacity: 0.7,
              }}>
                {statusCounts[filter.key]}
              </span>
            </button>
          ))}
        </Box>

        {/* Table */}
        <Box style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
          ) : filteredActivities.length === 0 ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
              No processing activities found
            </Box>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Name', 'Purpose', 'Lawful Basis', 'Data Categories', 'DPIA', 'EEA', 'Actions'].map((col) => (
                    <th key={col} style={{
                      textAlign: 'left',
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.neutral[50],
                      userSelect: 'none',
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activity) => {
                  const basisColors = lawfulBasisColors[activity.lawfulBasis];
                  const isSelected = activity.id === selectedActivityId;

                  return (
                    <tr
                      key={activity.id}
                      onClick={() => handleSelect(activity.id)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                        transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                      }}
                    >
                      {/* Name */}
                      <td style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[900],
                        fontWeight: tokens.typography.fontWeight.medium,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <span style={{
                            display: 'inline-block',
                            width: tokens.spacing[2],
                            height: tokens.spacing[2],
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: activity.status === 'active'
                              ? tokens.colors.successScale[500]
                              : activity.status === 'draft'
                                ? tokens.colors.warningScale[500]
                                : tokens.colors.neutral[400],
                            flexShrink: 0,
                          }} />
                          {activity.name}
                        </Box>
                      </td>

                      {/* Purpose */}
                      <td style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[600],
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        maxWidth: 200,
                      }}>
                        {truncate(activity.purpose, 50)}
                      </td>

                      {/* Lawful Basis */}
                      <td style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          backgroundColor: basisColors.bg,
                          color: basisColors.color,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${basisColors.border}`,
                          whiteSpace: 'nowrap',
                        }}>
                          {activity.lawfulBasis}
                        </span>
                      </td>

                      {/* Data Categories */}
                      <td style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      }}>
                        <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
                          {activity.dataCategories.map((cat) => {
                            const catColors = dataCategoryColors[cat];
                            return (
                              <span key={cat} style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: tokens.spacing[1],
                                padding: `0 ${tokens.spacing[1]}px`,
                                borderRadius: tokens.borderRadius.sm,
                                fontSize: tokens.typography.fontSize.xs,
                                backgroundColor: catColors.bg,
                                color: catColors.color,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${catColors.border}`,
                              }}>
                                <span style={{ fontSize: tokens.typography.fontSize.xs }}>{getDataCategoryIcon(cat)}</span>
                                {cat}
                              </span>
                            );
                          })}
                        </Box>
                      </td>

                      {/* DPIA */}
                      <td style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        textAlign: 'center',
                      }}>
                        {activity.dpia ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: tokens.spacing[1],
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: activity.dpiaCompleted ? tokens.colors.successScale[700] : tokens.colors.warningScale[700],
                          }}>
                            <span style={{
                              width: tokens.spacing[2],
                              height: tokens.spacing[2],
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: activity.dpiaCompleted ? tokens.colors.successScale[500] : tokens.colors.warningScale[500],
                              display: 'inline-block',
                            }} />
                            {activity.dpiaCompleted ? 'Done' : 'Pending'}
                          </span>
                        ) : (
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>N/A</span>
                        )}
                      </td>

                      {/* EEA Transfer */}
                      <td style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        textAlign: 'center',
                      }}>
                        {activity.transfersOutsideEEA ? (
                          <span style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.warningScale[600],
                          }} title="Transfers outside EEA">
                            ⚠
                          </span>
                        ) : (
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      }}>
                        <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                          {onEditActivity && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onEditActivity(activity.id); }}
                              style={{
                                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                borderRadius: tokens.borderRadius.sm,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                backgroundColor: 'transparent',
                                color: tokens.colors.neutral[600],
                                fontSize: tokens.typography.fontSize.xs,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                transition: `all ${tokens.motion.hover}`,
                              }}
                            >
                              Edit
                            </button>
                          )}
                          {onDeleteActivity && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onDeleteActivity(activity.id); }}
                              style={{
                                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                borderRadius: tokens.borderRadius.sm,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                                backgroundColor: 'transparent',
                                color: tokens.colors.errorScale[600],
                                fontSize: tokens.typography.fontSize.xs,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                transition: `all ${tokens.motion.hover}`,
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </Box>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Box>
      </Box>
    );
  },
});
