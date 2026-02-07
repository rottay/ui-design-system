import React from 'react';
import { createPreset } from '../../../factory';
import type { StatusBadgeGroupProps } from '../../core';

export const PillsPreset = createPreset<StatusBadgeGroupProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { badges, title, lastUpdated, className, style } = props;

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'healthy':
        return {
          bg: tokens.colors.successScale[100],
          text: tokens.colors.successScale[800],
          border: tokens.colors.successScale[200],
        };
      case 'degraded':
        return {
          bg: tokens.colors.warningScale[100],
          text: tokens.colors.warningScale[800],
          border: tokens.colors.warningScale[200],
        };
      case 'down':
        return {
          bg: tokens.colors.errorScale[100],
          text: tokens.colors.errorScale[800],
          border: tokens.colors.errorScale[200],
        };
      case 'maintenance':
        return {
          bg: tokens.colors.infoScale[100],
          text: tokens.colors.infoScale[800],
          border: tokens.colors.infoScale[200],
        };
      default:
        return {
          bg: tokens.colors.neutral[100],
          text: tokens.colors.neutral[800],
          border: tokens.colors.neutral[200],
        };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'degraded':
        return '⚠';
      case 'down':
        return '✕';
      case 'maintenance':
        return '⚙';
      default:
        return '•';
    }
  };

  return (
    <Box className={className} style={style}>
      {title && (
        <Text

          style={{
            fontWeight: tokens.typography.fontWeight.semibold,
            marginBottom: tokens.spacing[4],
          }}
        >
          {title}
        </Text>
      )}

      <Box
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: tokens.spacing[4],
        }}
      >
        {badges.map((badge) => {
          const colors = getStatusColors(badge.status);
          return (
            <Box
              key={badge.key}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                backgroundColor: colors.bg,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colors.border}`,
                borderRadius: tokens.borderRadius.full,
              }}
              title={badge.description}
            >
              <Box
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: colors.text,
                  lineHeight: 1,
                }}
              >
                {getStatusIcon(badge.status)}
              </Box>
              <Text
                               style={{
                  color: colors.text,
                  fontWeight: tokens.typography.fontWeight.medium,
                  fontSize: tokens.typography.fontSize.sm,
                }}
              >
                {badge.label}
              </Text>
            </Box>
          );
        })}
      </Box>

      {lastUpdated && (
        <Text
                   style={{
            display: 'block',
            marginTop: tokens.spacing[4],
            color: tokens.colors.neutral[600],
          }}
        >
          Last updated: {lastUpdated}
        </Text>
      )}
    </Box>
  );
});

PillsPreset.displayName = 'StatusBadgeGroupPillsPreset';
