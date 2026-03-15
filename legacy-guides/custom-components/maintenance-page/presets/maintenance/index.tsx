import React from 'react';
import { createPreset } from '../../../factory';
import type { MaintenancePageProps } from '../../core';
import { createEmptyStateStyle } from '../../../helpers';

export const MaintenancePreset = createPreset<MaintenancePageProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const {
    title = "Under Maintenance",
    description = "We're currently performing scheduled maintenance. We'll be back soon!",
    estimatedTime,
    contactEmail,
    illustration,
    logo,
    className,
    style,
  } = props;

  return (
    <Box
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        padding: tokens.spacing[8],
        backgroundColor: tokens.colors.neutral[50],
        textAlign: 'center',
        ...style,
      }}
    >
      {logo && (
        <Box style={{ marginBottom: tokens.spacing[8] }}>
          {logo}
        </Box>
      )}

      {illustration || (
        <Box
          style={{
            fontSize: '64px',
            marginBottom: tokens.spacing[8],
            color: tokens.colors.primaryScale[500],
          }}
        >
          🔧
        </Box>
      )}

      <Text

        style={{
          fontWeight: tokens.typography.fontWeight.bold,
          marginBottom: tokens.spacing[4],
          color: tokens.colors.neutral[900],
        }}
      >
        {title}
      </Text>

      <Text
               style={{
          maxWidth: '600px',
          marginBottom: tokens.spacing[6],
          color: tokens.colors.neutral[700],
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}
      >
        {description}
      </Text>

      {estimatedTime && (
        <Box
          style={{
            padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
            backgroundColor: tokens.colors.infoScale[100],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
            borderRadius: tokens.borderRadius.lg,
            marginBottom: tokens.spacing[6],
          }}
        >
          <Text
                       style={{
              color: tokens.colors.infoScale[800],
              fontWeight: tokens.typography.fontWeight.medium,
            }}
          >
            Estimated time: {estimatedTime}
          </Text>
        </Box>
      )}

      {contactEmail && (
        <Text
                   style={{
            color: tokens.colors.neutral[600],
          }}
        >
          Need help? Contact us at{' '}
          <a
            href={`mailto:${contactEmail}`}
            style={{
              color: tokens.colors.primaryScale[600],
              textDecoration: 'none',
              fontWeight: tokens.typography.fontWeight.medium,
            }}
          >
            {contactEmail}
          </a>
        </Text>
      )}
    </Box>
  );
});

MaintenancePreset.displayName = 'MaintenancePageMaintenancePreset';
