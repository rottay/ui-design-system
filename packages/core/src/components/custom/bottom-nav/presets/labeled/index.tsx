'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { BottomNavProps } from '../../core';

export default createPreset<BottomNavProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { items, activeKey, onItemClick, className, style } = props;

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.sm,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '72px',
        backgroundColor: tokens.colors.common.white,
        borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: `0 ${tokens.spacing[4]}`,
        zIndex: 100,
        ...style,
      }}
    >
      {items.map((item) => {
        const itemStyle: React.CSSProperties = {
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: tokens.spacing[1],
          flex: 1,
          height: '100%',
          cursor: 'pointer',
          transition: `all ${tokens.motion.hover}`,
          textDecoration: 'none',
        };
        const handleClick = () => {
          item.onClick?.();
          onItemClick?.(item.key);
        };
        const itemContent = (
          <>
            <Box
              style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                color:
                  activeKey === item.key ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
              }}
            >
              {item.icon}
              {item.badge !== undefined && item.badge > 0 && (
                <Box
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.errorScale[600],
                    color: tokens.colors.common.white,
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
            </Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: activeKey === item.key ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                color:
                  activeKey === item.key ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
              }}
            >
              {item.label}
            </Text>
          </>
        );
        return item.href ? (
          <a key={item.key} href={item.href} onClick={handleClick} style={itemStyle}>
            {itemContent}
          </a>
        ) : (
          <div key={item.key} onClick={handleClick} style={itemStyle}>
            {itemContent}
          </div>
        );
      })}
    </Box>
  );
});
