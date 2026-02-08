'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { TabNavProps } from '../../core';

export default createPreset<TabNavProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { items, activeKey, onTabChange, onTabClose, className, style } = props;

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.sm,
        display: 'flex',
        gap: tokens.spacing[2],
        padding: tokens.spacing[1],
        backgroundColor: tokens.colors.neutral[50],
        borderRadius: tokens.borderRadius.lg,
        overflowX: 'auto',
        ...style,
      }}
    >
      {items.map((item) => (
        <Box
          key={item.key}
          onClick={() => !item.disabled && onTabChange?.(item.key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
            borderRadius: tokens.borderRadius.md,
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            opacity: item.disabled ? 0.5 : 1,
            backgroundColor:
              activeKey === item.key ? tokens.colors.primaryScale[600] : 'transparent',
            transition: `all ${tokens.motion.hover}`,
          }}
          onMouseEnter={(e) => {
            if (!item.disabled && activeKey !== item.key) {
              e.currentTarget.style.backgroundColor = tokens.colors.neutral[100];
              e.currentTarget.style.transform = tokens.motion.transform;
            }
          }}
          onMouseLeave={(e) => {
            if (activeKey !== item.key) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'none';
            }
          }}
        >
          {item.icon && (
            <Box
              style={{
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeKey === item.key ? tokens.colors.common.white : tokens.colors.neutral[600],
              }}
            >
              {item.icon}
            </Box>
          )}
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: activeKey === item.key ? tokens.colors.common.white : tokens.colors.neutral[700],
            }}
          >
            {item.label}
          </Text>
          {item.badge !== undefined && item.badge > 0 && (
            <Box
              style={{
                minWidth: '18px',
                height: '18px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor:
                  activeKey === item.key ? tokens.overlay?.whiteLight : tokens.colors.errorScale[100],
                color: activeKey === item.key ? tokens.colors.common.white : tokens.colors.errorScale[700],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.bold,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: `0 ${tokens.spacing[1]}`,
              }}
            >
              {item.badge > 99 ? '99+' : item.badge}
            </Box>
          )}
          {item.closeable && (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                onTabClose?.(item.key);
              }}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: tokens.borderRadius.sm,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tokens.typography.fontSize.sm,
                color: activeKey === item.key ? tokens.colors.common.white : tokens.colors.neutral[500],
                transition: `all ${tokens.motion.hover}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = activeKey === item.key
                  ? (tokens.overlay?.whiteLight || 'rgba(255,255,255,0.2)')
                  : tokens.colors.neutral[200];
                e.currentTarget.style.transform = tokens.motion.transform;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'none';
              }}
            >
              ×
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
});
