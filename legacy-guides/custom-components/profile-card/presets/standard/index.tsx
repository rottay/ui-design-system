'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { ProfileCardProps } from '../../core';
import {
  createAccentBarStyle,
  createCardStyle,
  createEmptyStateStyle,
  createHoverStyle,

} from '../../../helpers';

export default createPreset<ProfileCardProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = tokens.surface.useGlass && !!tokens.glass;
  const { Box, Text } = primitives;
  const { name, role, company, avatar, coverImage, bio, stats, actions, social, online, className, style } = props;

  return (
    <Box
      className={className}
      style={{ ...createCardStyle(tokens, { glass: isGlass, elevation: 'md' }), overflow: 'hidden' as const, ...style }}
    >
        <div style={createAccentBarStyle(tokens, { position: 'top' })} />
      {/* Cover Image */}
      {coverImage && (
        <Box
          style={{
            width: '100%',
            height: '120px',
            backgroundImage: `url(${coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Avatar */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: tokens.spacing[6],
          marginTop: coverImage ? '-40px' : 0,
        }}
      >
        <Box style={{ position: 'relative' }}>
          {avatar ? (
            <Box
              style={{
                width: '80px',
                height: '80px',
                borderRadius: tokens.borderRadius.full,
                backgroundImage: `url(${avatar})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: `4px solid ${tokens.colors.common.white}`,
              }}
            />
          ) : (
            <Box
              style={{
                width: '80px',
                height: '80px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `4px solid ${tokens.colors.common.white}`,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
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
                bottom: '4px',
                right: '4px',
                width: '16px',
                height: '16px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: online ? tokens.colors.successScale[500] : tokens.colors.neutral[400],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
              }}
            />
          )}
        </Box>

        {/* Name & Title */}
        <Text
          style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            marginTop: tokens.spacing[4],
            textAlign: 'center',
          }}
        >
          {name}
        </Text>
        {role && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.md,
              color: tokens.colors.neutral[600],
              marginTop: tokens.spacing[1],
              textAlign: 'center',
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
              marginTop: tokens.spacing[1],
              textAlign: 'center',
            }}
          >
            {company}
          </Text>
        )}

        {/* Bio */}
        {bio && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[700],
              marginTop: tokens.spacing[4],
              textAlign: 'center',
              lineHeight: tokens.typography.lineHeight.relaxed,
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
              gap: tokens.spacing[8],
              marginTop: tokens.spacing[6],
              padding: `${tokens.spacing[4]} 0`,
              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {stats.map((stat, idx) => (
              <Box key={idx} style={{ textAlign: 'center' }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
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
                    marginTop: tokens.spacing[1],
                  }}
                >
                  {stat.label}
                </Text>
              </Box>
            ))}
          </Box>
        )}

        {/* Social Links */}
        {social && social.length > 0 && (
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[4],
              marginTop: tokens.spacing[4],
            }}
          >
            {social.map((link, idx) => {
              const socialStyle: React.CSSProperties = {
                width: '36px',
                height: '36px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.neutral[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: link.href ? 'pointer' : 'default',
                transition: `all ${tokens.motion.hover}`,
                textDecoration: 'none',
              };
              const handleSocialMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
                if (link.href) {
                  e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[100];
                }
              };
              const handleSocialMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
                if (link.href) {
                  e.currentTarget.style.backgroundColor = tokens.colors.neutral[100];
                }
              };
              return link.href ? (
                <a key={idx} href={link.href} style={socialStyle} onMouseEnter={handleSocialMouseEnter} onMouseLeave={handleSocialMouseLeave}>
                  {link.icon}
                </a>
              ) : (
                <div key={idx} style={socialStyle} onMouseEnter={handleSocialMouseEnter} onMouseLeave={handleSocialMouseLeave}>
                  {link.icon}
                </div>
              );
            })}
          </Box>
        )}

        {/* Actions */}
        {actions && actions.length > 0 && (
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[4],
              marginTop: tokens.spacing[6],
              width: '100%',
            }}
          >
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                style={{
                  flex: 1,
                  padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
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
              </button>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
});
