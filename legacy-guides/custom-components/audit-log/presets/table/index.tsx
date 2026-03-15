'use client';

import React, {useState, useMemo} from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { AuditLogProps } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

export const Table = createPreset<AuditLogProps>((context: PresetContext<AuditLogProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;

  const { entries, className, style } = props;

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const cardStyle = useMemo(() => createCardStyle(tokens), [tokens]);

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return tokens.colors.errorScale[600];
      case 'high': return tokens.colors.errorScale[500];
      case 'medium': return tokens.colors.warningScale[600];
      case 'low': return tokens.colors.infoScale[600];
      default: return tokens.colors.neutral[600];
    }
  };

  return (
    <Box style={cardStyle} className={className}>
      <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
        Audit Log
      </Text>

      <Box style={{ overflowX: 'auto' }}>
        <Box style={{ minWidth: '900px' }}>
          <Box style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 2fr 1fr', gap: tokens.spacing[4], padding: tokens.spacing[2], backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.sm, marginBottom: tokens.spacing[1] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Timestamp</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Actor</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Action</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Target</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Severity</Text>
          </Box>

          {entries.map((entry) => (
            <Box key={entry.id}>
              <Box
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1fr 2fr 1fr',
                  gap: tokens.spacing[4],
                  padding: tokens.spacing[2],
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  cursor: entry.details ? 'pointer' : 'default',
                  backgroundColor: expandedId === entry.id ? tokens.colors.neutral[50] : 'transparent',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                  {entry.timestamp}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                  {entry.actor}
                  {entry.ip && (
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>
                      {entry.ip}
                    </Text>
                  )}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], fontWeight: tokens.typography.fontWeight.medium }}>
                  {entry.action}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                  {entry.target || '-'}
                </Text>
                {entry.severity && (
                  <Box
                    style={{
                      padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                      backgroundColor: `${getSeverityColor(entry.severity)}20`,
                      color: getSeverityColor(entry.severity),
                      borderRadius: tokens.borderRadius.sm,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      display: 'inline-block',
                      width: 'fit-content',
                    }}
                  >
                    {entry.severity}
                  </Box>
                )}
              </Box>
              {expandedId === entry.id && entry.details && (
                <Box style={{ padding: tokens.spacing[4], backgroundColor: tokens.colors.neutral[50], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                    {entry.details}
                  </Text>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
});
