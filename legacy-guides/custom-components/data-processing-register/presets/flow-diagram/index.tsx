'use client';

/**
 * DataProcessingRegister - Flow Diagram Preset
 * Data flow visualization: Data Subjects -> Controller -> Processor -> Recipients
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { DataProcessingRegisterProps, ProcessingActivity } from '../../core';
import { getLawfulBasisColors, getDataCategoryColors, getDataCategoryIcon } from '../../core';
import {
  createCardStyle,
  createSurfaceStyle,
  createHoverStyle,
} from '../../../helpers';

export const FlowDiagramDataProcessingRegister = createPreset<DataProcessingRegisterProps>({
  name: 'DataProcessingRegister.FlowDiagram',
  render: ({ primitives, props, tokens, engine }: PresetContext<DataProcessingRegisterProps>) => {
    const { Box, Stack } = primitives;
    const lawfulBasisColors = getLawfulBasisColors(tokens);
    const dataCategoryColors = getDataCategoryColors(tokens);

    const {
      activities,
      selectedActivityId: selectedActivityIdProp,
      title = 'Data Processing Register',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [internalSelectedId, setInternalSelectedId] = useState(selectedActivityIdProp ?? (activities.length > 0 ? activities[0].id : ''));
    const selectedActivityId = selectedActivityIdProp ?? internalSelectedId;

    const handleSelect = (id: string) => {
      setInternalSelectedId(id);
    };

    const selectedActivity = activities.find((a) => a.id === selectedActivityId);

    const arrowStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: tokens.colors.neutral[400],
      fontSize: tokens.typography.fontSize.xl,
      padding: `0 ${tokens.spacing[2]}px`,
      flexShrink: 0,
    };

    const stageCardStyle = {
      ...createCardStyle(tokens, { elevation: 'sm' }),
      flex: 1,
      minWidth: 160,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: tokens.spacing[2],
    };

    const stageLabelStyle = {
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[500],
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    };

    const stageContentStyle = {
      fontSize: tokens.typography.fontSize.sm,
      color: tokens.colors.neutral[900],
      fontWeight: tokens.typography.fontWeight.medium,
    };

    const chipStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
      borderRadius: tokens.borderRadius.full,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.medium,
      backgroundColor: tokens.colors.neutral[100],
      color: tokens.colors.neutral[700],
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
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
        </Box>

        {loading ? (
          <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Activity list sidebar */}
            <Box style={{ width: 240, borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, overflow: 'auto', flexShrink: 0 }}>
              {activities.map((activity) => {
                const isSelected = activity.id === selectedActivityId;
                return (
                  <Box
                    key={activity.id}
                    onClick={() => handleSelect(activity.id)}
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                      borderLeft: isSelected ? `3px solid ${tokens.colors.primaryScale[600]}` : '3px solid transparent',
                      transition: `all ${tokens.transitions?.fast || tokens.motion.hover}`,
                    }}
                  >
                    <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[900] }}>
                      {activity.name}
                    </Box>
                    <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                      {activity.status}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Flow diagram area */}
            <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[4] }}>
              {selectedActivity ? (
                <Stack direction="vertical" spacing="md">
                  {/* Flow stages */}
                  <Box style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
                    {/* Data Subjects */}
                    <Box style={stageCardStyle}>
                      <span style={stageLabelStyle}>Data Subjects</span>
                      <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                        {selectedActivity.dataSubjects.map((subject, idx) => (
                          <span key={idx} style={chipStyle}>{subject}</span>
                        ))}
                      </Box>
                    </Box>

                    <Box style={arrowStyle}>→</Box>

                    {/* Controller */}
                    <Box style={stageCardStyle}>
                      <span style={stageLabelStyle}>Controller</span>
                      <span style={stageContentStyle}>{selectedActivity.controller}</span>
                      <Box style={{ marginTop: tokens.spacing[1] }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          backgroundColor: lawfulBasisColors[selectedActivity.lawfulBasis].bg,
                          color: lawfulBasisColors[selectedActivity.lawfulBasis].color,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${lawfulBasisColors[selectedActivity.lawfulBasis].border}`,
                        }}>
                          {selectedActivity.lawfulBasis}
                        </span>
                      </Box>
                    </Box>

                    <Box style={arrowStyle}>→</Box>

                    {/* Processor */}
                    <Box style={stageCardStyle}>
                      <span style={stageLabelStyle}>Processor</span>
                      <span style={stageContentStyle}>{selectedActivity.processor || selectedActivity.controller}</span>
                      <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1], marginTop: tokens.spacing[1] }}>
                        {selectedActivity.dataCategories.map((cat) => {
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
                              <span>{getDataCategoryIcon(cat)}</span>
                              {cat}
                            </span>
                          );
                        })}
                      </Box>
                    </Box>

                    <Box style={arrowStyle}>→</Box>

                    {/* Recipients */}
                    <Box style={{
                      ...stageCardStyle,
                      ...(selectedActivity.transfersOutsideEEA ? {
                        borderColor: tokens.colors.warningScale[300],
                      } : {}),
                    }}>
                      <span style={stageLabelStyle}>Recipients</span>
                      <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                        {selectedActivity.recipients.map((recipient, idx) => (
                          <span key={idx} style={chipStyle}>{recipient}</span>
                        ))}
                      </Box>
                      {selectedActivity.transfersOutsideEEA && (
                        <Box style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          backgroundColor: tokens.colors.warningScale[50],
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                          marginTop: tokens.spacing[1],
                        }}>
                          <span style={{ color: tokens.colors.warningScale[600] }}>⚠</span>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[700], fontWeight: tokens.typography.fontWeight.medium }}>
                            EEA Transfer
                          </span>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Details section */}
                  <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: tokens.spacing[3] }}>
                    {/* Purpose */}
                    <Box style={{ ...createSurfaceStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[3], backgroundColor: tokens.colors.common.white }}>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>Purpose</span>
                      <p style={{ margin: `${tokens.spacing[1]}px 0 0`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                        {selectedActivity.purpose}
                      </p>
                    </Box>

                    {/* Retention Period */}
                    <Box style={{ ...createSurfaceStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[3], backgroundColor: tokens.colors.common.white }}>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>Retention Period</span>
                      <p style={{ margin: `${tokens.spacing[1]}px 0 0`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], fontWeight: tokens.typography.fontWeight.medium }}>
                        {selectedActivity.retentionPeriod}
                      </p>
                    </Box>

                    {/* DPIA Status */}
                    <Box style={{ ...createSurfaceStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[3], backgroundColor: tokens.colors.common.white }}>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>DPIA Status</span>
                      <Box style={{ marginTop: tokens.spacing[1], display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span style={{
                          width: tokens.spacing[2],
                          height: tokens.spacing[2],
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: !selectedActivity.dpia
                            ? tokens.colors.neutral[400]
                            : selectedActivity.dpiaCompleted
                              ? tokens.colors.successScale[500]
                              : tokens.colors.warningScale[500],
                          display: 'inline-block',
                        }} />
                        <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], fontWeight: tokens.typography.fontWeight.medium }}>
                          {!selectedActivity.dpia ? 'Not Required' : selectedActivity.dpiaCompleted ? 'Completed' : 'Pending'}
                        </span>
                      </Box>
                    </Box>

                    {/* Safeguards (shown if EEA transfer) */}
                    {selectedActivity.transfersOutsideEEA && selectedActivity.safeguards && (
                      <Box style={{ ...createSurfaceStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[3], backgroundColor: tokens.colors.common.white }}>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>Safeguards</span>
                        <p style={{ margin: `${tokens.spacing[1]}px 0 0`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                          {selectedActivity.safeguards}
                        </p>
                      </Box>
                    )}
                  </Box>
                </Stack>
              ) : (
                <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
                  Select an activity to view its data flow
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
