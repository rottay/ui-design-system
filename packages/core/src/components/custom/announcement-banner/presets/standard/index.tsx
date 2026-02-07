'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import type { AnnouncementBannerProps } from '../../core';

export const StandardPreset = createPreset<AnnouncementBannerProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { message, link, dismissible = true, onDismiss, icon, className, style } = props;

  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.sm,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: tokens.spacing[4],
        padding: `${tokens.spacing[2]} ${tokens.spacing[6]}`,
        backgroundColor: tokens.colors.primaryScale[600],
        color: tokens.colors.common.white,
        ...style,
      }}
    >
      {icon && <Box style={{ display: 'flex', fontSize: tokens.typography.fontSize.lg }}>{icon}</Box>}

      <Text
               style={{
          color: tokens.colors.common.white,
          fontWeight: tokens.typography.fontWeight.medium,
        }}
      >
        {message}
      </Text>

      {link && (
        link.href ? (
          <a
            href={link.href}
            onClick={link.onClick}
            style={{
              color: tokens.colors.common.white,
              textDecoration: 'underline',
              fontWeight: tokens.typography.fontWeight.semibold,
              fontSize: tokens.typography.fontSize.sm,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {link.label}
          </a>
        ) : (
          <button
            onClick={link.onClick}
            style={{
              color: tokens.colors.common.white,
              textDecoration: 'underline',
              fontWeight: tokens.typography.fontWeight.semibold,
              fontSize: tokens.typography.fontSize.sm,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {link.label}
          </button>
        )
      )}

      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: tokens.colors.common.white,
            cursor: 'pointer',
            fontSize: tokens.typography.fontSize.lg,
            padding: tokens.spacing[1],
            display: 'flex',
            alignItems: 'center',
          }}
        >
          ×
        </button>
      )}
    </Box>
  );
});

StandardPreset.displayName = 'AnnouncementBannerStandardPreset';
