'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { ProfileCardProps } from '../../core';
import { createAccentBarStyle } from '../../../helpers';

export default createPreset<ProfileCardProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { name, role, avatar, online, className, style } = props;

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.md,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[2],
        ...style,
      }}
    >
        <div style={createAccentBarStyle(tokens, { position: 'top' })} />
      {/* Avatar */}
      <Box style={{ position: 'relative', flexShrink: 0 }}>
        {avatar ? (
          <Box
            style={{
              width: '32px',
              height: '32px',
              borderRadius: tokens.borderRadius.full,
              backgroundImage: `url(${avatar})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ) : (
          <Box
            style={{
              width: '32px',
              height: '32px',
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.primaryScale[600],
              }}
            >
              {name.charAt(0).toUpperCase()}
            </Text>
          </Box>
        )}
        {online !== undefined && (
          <Box
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '10px',
              height: '10px',
              borderRadius: tokens.borderRadius.full,
              backgroundColor: online ? tokens.colors.successScale[500] : tokens.colors.neutral[400],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
            }}
          />
        )}
      </Box>

      {/* Name & Role */}
      <Box style={{ minWidth: 0, flex: 1 }}>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </Text>
        {role && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[600],
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {role}
          </Text>
        )}
      </Box>
    </Box>
  );
});
