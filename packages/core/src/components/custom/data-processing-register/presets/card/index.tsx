'use client';

/**
 * DataProcessingRegister - Card Preset
 * Card grid view with activity cards showing status, basis, categories, and DPIA
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { DataProcessingRegisterProps, ProcessingActivity } from '../../core';
import { getLawfulBasisColors, getDataCategoryColors, getDataCategoryIcon } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
  getCardHoverShadow,
} from '../../../helpers';

export const CardDataProcessingRegister = createPreset<DataProcessingRegisterProps>({
  name: 'DataProcessingRegister.Card',
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
    const [hoveredId, setHoveredId] = useState('');
    const selectedActivityId = selectedActivityIdProp ?? internalSelectedId;

    const handleSelect = (id: string) => {
      setInternalSelectedId(id);
    };

    const getStatusStyle = (status: ProcessingActivity['status']) => {
      const statusMap = {
        active: { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700], border: tokens.colors.successScale[200] },
        draft: { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] },
        archived: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[500], border: tokens.colors.neutral[200] },
      };
      return statusMap[status];
    };

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
              {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
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

        {/* Card grid */}
        <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[4] }}>
          {loading ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
          ) : activities.length === 0 ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
              No processing activities found
            </Box>
          ) : (
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: tokens.spacing[4] }}>
              {activities.map((activity) => {
                const isSelected = activity.id === selectedActivityId;
                const isHovered = activity.id === hoveredId;
                const basisColors = lawfulBasisColors[activity.lawfulBasis];
                const statusStyle = getStatusStyle(activity.status);

                return (
                  <Box
                    key={activity.id}
                    onClick={() => handleSelect(activity.id)}
                    onMouseEnter={() => setHoveredId(activity.id)}
                    onMouseLeave={() => setHoveredId('')}
                    style={{
                      ...createCardStyle(tokens, { elevation: 'sm', interactive: true }),
                      ...(isSelected ? {
                        borderColor: tokens.colors.primaryScale[400],
                        boxShadow: tokens.shadows.md,
                        backgroundColor: tokens.colors.primaryScale[50],
                      } : {}),
                      ...(isHovered && !isSelected ? {
                        boxShadow: getCardHoverShadow(tokens, 'sm'),
                      } : {}),
                      display: 'flex',
                      flexDirection: 'column',
                      gap: tokens.spacing[3],
                    }}
                  >
                    {/* Card header: name + status */}
                    <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: tokens.spacing[2] }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        flex: 1,
                      }}>
                        {activity.name}
                      </h3>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusStyle.border}`,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {activity.status}
                      </span>
                    </Box>

                    {/* Purpose */}
                    <p style={{
                      margin: 0,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[600],
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {activity.purpose}
                    </p>

                    {/* Lawful basis badge */}
                    <Box>
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
                      }}>
                        {activity.lawfulBasis}
                      </span>
                    </Box>

                    {/* Data category badges */}
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

                    {/* Footer: retention + DPIA */}
                    <Box style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      paddingTop: tokens.spacing[2],
                      marginTop: 'auto',
                    }}>
                      {/* Retention */}
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Retention:</span>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700], fontWeight: tokens.typography.fontWeight.medium }}>
                          {activity.retentionPeriod}
                        </span>
                      </Box>

                      {/* DPIA indicator */}
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <span style={{
                          width: tokens.spacing[2],
                          height: tokens.spacing[2],
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: !activity.dpia
                            ? tokens.colors.neutral[400]
                            : activity.dpiaCompleted
                              ? tokens.colors.successScale[500]
                              : tokens.colors.warningScale[500],
                          display: 'inline-block',
                        }} />
                        <span style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: !activity.dpia
                            ? tokens.colors.neutral[500]
                            : activity.dpiaCompleted
                              ? tokens.colors.successScale[700]
                              : tokens.colors.warningScale[700],
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}>
                          {!activity.dpia ? 'No DPIA' : activity.dpiaCompleted ? 'DPIA Done' : 'DPIA Pending'}
                        </span>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
