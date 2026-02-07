import React from 'react';
import { createPreset } from '../../../factory';
import type { StatusBadgeGroupProps } from '../../core';

export const DotsPreset = createPreset<StatusBadgeGroupProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { badges, title, lastUpdated, className, style } = props;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return tokens.colors.successScale[500];
      case 'degraded':
        return tokens.colors.warningScale[500];
      case 'down':
        return tokens.colors.errorScale[500];
      case 'maintenance':
        return tokens.colors.infoScale[500];
      default:
        return tokens.colors.neutral[500];
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
          gap: tokens.spacing[6],
          alignItems: 'center',
        }}
      >
        {badges.map((badge) => (
          <Box
            key={badge.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}
            title={badge.description}
          >
            <Box
              style={{
                width: '12px',
                height: '12px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: getStatusColor(badge.status),
                boxShadow: `0 0 8px ${getStatusColor(badge.status)}`,
              }}
            />
            <Text
                           style={{
                color: tokens.colors.neutral[800],
                fontWeight: tokens.typography.fontWeight.medium,
              }}
            >
              {badge.label}
            </Text>
          </Box>
        ))}
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

DotsPreset.displayName = 'StatusBadgeGroupDotsPreset';
