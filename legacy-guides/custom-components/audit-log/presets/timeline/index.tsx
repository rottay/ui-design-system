import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { AuditLogProps } from '../../core';
import {
  createCardStyle,
} from '../../../helpers';

export const Timeline = createPreset<AuditLogProps>((context: PresetContext<AuditLogProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;

  const { entries, className, style } = props;

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return tokens.colors.errorScale[600];
      case 'high': return tokens.colors.errorScale[500];
      case 'medium': return tokens.colors.warningScale[600];
      case 'low': return tokens.colors.infoScale[600];
      default: return tokens.colors.neutral[600];
    }
  };

  const groupByDate = (entries: typeof props.entries) => {
    const grouped: Record<string, typeof entries> = {};
    entries.forEach(entry => {
      const date = entry.timestamp.split(' ')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(entry);
    });
    return grouped;
  };

  const grouped = groupByDate(entries);

  return (
    <Box className={className} style={style}>
      {Object.entries(grouped).map(([date, dateEntries]) => (
        <Box key={date} style={{ marginBottom: tokens.spacing[8] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], marginBottom: tokens.spacing[4] }}>
            {date}
          </Text>

          <Box style={{ position: 'relative', paddingLeft: tokens.spacing[8] }}>
            <Box
              style={{
                position: 'absolute',
                left: '8px',
                top: 0,
                bottom: 0,
                width: '2px',
                backgroundColor: tokens.colors.neutral[200],
              }}
            />

            {dateEntries.map((entry, idx) => (
              <Box key={entry.id} style={{ position: 'relative', marginBottom: tokens.spacing[6] }}>
                <Box
                  style={{
                    position: 'absolute',
                    left: '-22px',
                    top: '4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: getSeverityColor(entry.severity),
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
                    boxShadow: tokens.shadows.sm,
                  }}
                />

                <Box
                  style={{
                    backgroundColor: tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    borderRadius: tokens.borderRadius.md,
                    padding: tokens.spacing[4],
                    boxShadow: tokens.shadows.sm,
                  }}
                >
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[1] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                      {entry.action}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {entry.timestamp.split(' ')[1]}
                    </Text>
                  </Box>

                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[1] }}>
                    by <Text style={{ fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>{entry.actor}</Text>
                    {entry.target && (
                      <> on <Text style={{ fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>{entry.target}</Text></>
                    )}
                  </Text>

                  {entry.details && (
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], marginTop: tokens.spacing[2] }}>
                      {entry.details}
                    </Text>
                  )}

                  {entry.ip && (
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[2] }}>
                      IP: {entry.ip}
                    </Text>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
});
