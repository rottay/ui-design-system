'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { BottomNavProps } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
} from '../../../helpers';

export default createPreset<BottomNavProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box } = primitives;
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
        height: '64px',
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
          flex: 1,
          height: '100%',
          cursor: 'pointer',
          color:
            activeKey === item.key ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
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
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {item.icon}
              {item.badge !== undefined && item.badge > 0 && (
                <Box
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
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
            {activeKey === item.key && (
              <Box
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40px',
                  height: '3px',
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[600],
                }}
              />
            )}
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
