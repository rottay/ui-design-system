'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { ContentCardProps } from '../../core';

export default createPreset<ContentCardProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { title, description, thumbnail, href, onClick, className, style } = props;

  const domain = href ? new URL(href).hostname : '';

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing[4],
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.common.white,
    borderRadius: tokens.borderRadius.lg,
    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
    cursor: href || onClick ? 'pointer' : 'default',
    transition: `all ${tokens.motion.hover}`,
    textDecoration: 'none',
    ...style,
  };
  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (href || onClick) {
      e.currentTarget.style.borderColor = tokens.colors.primaryScale[300];
      e.currentTarget.style.boxShadow = tokens.shadows.sm;
    }
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (href || onClick) {
      e.currentTarget.style.borderColor = tokens.colors.neutral[200];
      e.currentTarget.style.boxShadow = 'none';
    }
  };

  const content = (
    <>
      {/* Thumbnail */}
      {thumbnail && (
        <Box
          style={{
            width: '120px',
            height: '80px',
            flexShrink: 0,
            borderRadius: tokens.borderRadius.md,
            backgroundImage: `url(${thumbnail})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: tokens.colors.neutral[100],
          }}
        />
      )}

      {/* Content */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        {domain && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[1],
            }}
          >
            {domain}
          </Text>
        )}
        <Text
          style={{
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
            marginBottom: tokens.spacing[1],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
        </Text>
        {description && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
              lineHeight: tokens.typography.lineHeight.normal,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {description}
          </Text>
        )}
      </Box>
    </>
  );

  return href ? (
    <a href={href} onClick={onClick} className={className} style={wrapperStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {content}
    </a>
  ) : (
    <div onClick={onClick} className={className} style={wrapperStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {content}
    </div>
  );
});
