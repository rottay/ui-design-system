'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { ProfileCardProps } from '../../core';
import {
  createAccentBarStyle,
  createCardStyle,
  createHoverStyle,

} from '../../../helpers';

export default createPreset<ProfileCardProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = engine === 'modern' && !!tokens.glass;
  const { Box, Text } = primitives;
  const { name, role, company, avatar, bio, stats, actions, online, className, style } = props;

  return (
    <Box
      className={className}
      style={{ ...createCardStyle(tokens, { glass: isGlass, elevation: 'md' }), ...style, padding: tokens.spacing[6] }}
    >
        <div style={createAccentBarStyle(tokens, { position: 'top' })} />
      {/* Avatar */}
      <Box style={{ position: 'relative', flexShrink: 0 }}>
        {avatar ? (
          <Box
            style={{
              width: '64px',
              height: '64px',
              borderRadius: tokens.borderRadius.full,
              backgroundImage: `url(${avatar})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ) : (
          <Box
            style={{
              width: '64px',
              height: '64px',
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
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
              width: '14px',
              height: '14px',
              borderRadius: tokens.borderRadius.full,
              backgroundColor: online ? tokens.colors.successScale[500] : tokens.colors.neutral[400],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
          }}
        >
          {name}
        </Text>
        {role && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
              marginTop: tokens.spacing[1],
            }}
          >
            {role}
          </Text>
        )}
        {company && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
            }}
          >
            {company}
          </Text>
        )}
        {bio && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[700],
              marginTop: tokens.spacing[2],
              lineHeight: tokens.typography.lineHeight.normal,
            }}
          >
            {bio}
          </Text>
        )}

        {/* Stats */}
        {stats && stats.length > 0 && (
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[6],
              marginTop: tokens.spacing[4],
            }}
          >
            {stats.map((stat, idx) => (
              <Box key={idx}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  {stat.label}
                </Text>
              </Box>
            ))}
          </Box>
        )}

        {/* Actions */}
        {actions && actions.length > 0 && (
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[2],
              marginTop: tokens.spacing[4],
            }}
          >
            {actions.map((action, idx) => (
              <Box
                key={idx}
                as="button"
                onClick={action.onClick}
                style={{
                  padding: `${tokens.spacing[1]} ${tokens.spacing[4]}`,
                  borderRadius: tokens.borderRadius.md,
                  border: action.variant === 'primary' ? 'none' : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  backgroundColor: action.variant === 'primary' ? tokens.colors.primaryScale[600] : tokens.colors.common.white,
                  color: action.variant === 'primary' ? tokens.colors.common.white : tokens.colors.neutral[700],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
                onMouseEnter={(e) => {
                  if (action.variant === 'primary') {
                    e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[700];
                    e.currentTarget.style.transform = tokens.motion.transform;
                  } else {
                    e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
                  }
                }}
                onMouseLeave={(e) => {
                  if (action.variant === 'primary') {
                    e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[600];
                    e.currentTarget.style.transform = 'none';
                  } else {
                    e.currentTarget.style.backgroundColor = tokens.colors.common.white;
                  }
                }}
              >
                {action.label}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
});
