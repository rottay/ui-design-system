'use client';

/**
 * BottomNav - Standard Preset
 * Fixed bottom navigation with glass surface, active pill indicator,
 * ripple feedback, badge styling, hover transforms, and smooth transitions.
 */

import React, { useState, useMemo } from 'react';
import { createPreset } from '../../../factory';
import type { BottomNavProps } from '../../core';
import {
  createSurfaceStyle,
  createBadgeStyle,
  createHoverStyle,
} from '../../../helpers';

export default createPreset<BottomNavProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;
  const { items, activeKey, onItemClick, className, style } = props;
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const isGlass = tokens.surface.useGlass && !!tokens.glass;

  const navStyle = useMemo((): React.CSSProperties => ({
    ...createSurfaceStyle(tokens, {
      elevation: 'lg',
      glass: isGlass,
    }),
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
    zIndex: 100,
    borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
    borderBottom: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderRadius: 0,
    backgroundColor: isGlass && tokens.glass
      ? tokens.glass.bg
      : tokens.colors.common.white,
  }), [tokens, isGlass]);

  const badgeStyle = useMemo(
    () => createBadgeStyle(tokens, 'error'),
    [tokens],
  );

  return (
    <div className={className} style={{ ...navStyle, ...style }}>
      {items.map((item) => {
        const isActive = activeKey === item.key;
        const isHovered = hoveredKey === item.key;
        const isPressed = pressedKey === item.key;

        const handleClick = () => {
          item.onClick?.();
          onItemClick?.(item.key);
        };

        const itemStyle: React.CSSProperties = {
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: tokens.spacing[1],
          flex: 1,
          paddingTop: tokens.spacing[2],
          paddingBottom: tokens.spacing[2],
          cursor: 'pointer',
          textDecoration: 'none',
          transition: `all ${tokens.motion.hover}`,
          transform: isPressed
            ? 'scale(0.95)'
            : isHovered && !isActive
              ? tokens.motion.transform
              : 'none',
          color: isActive
            ? tokens.colors.primaryScale[600]
            : isHovered
              ? tokens.colors.neutral[700]
              : tokens.colors.neutral[500],
        };

        const itemContent = (
          <>
            {/* Active pill background behind icon */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: tokens.spacing[1],
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: tokens.spacing[12],
                  height: tokens.spacing[8],
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[50],
                  transition: `all ${tokens.motion.hover}`,
                  zIndex: 0,
                }}
              />
            )}

            {/* Icon container */}
            <div
              style={{
                position: 'relative',
                width: tokens.spacing[7],
                height: tokens.spacing[7],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                fontSize: tokens.typography.fontSize.lg,
              }}
            >
              {item.icon}

              {/* Badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  style={{
                    ...badgeStyle,
                    position: 'absolute',
                    top: -tokens.spacing[1],
                    right: -tokens.spacing[1],
                    minWidth: tokens.spacing[4],
                    height: tokens.spacing[4],
                    padding: `0 ${tokens.spacing[1]}px`,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.bold,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    zIndex: 2,
                  }}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>

            {/* Label shown only for active item */}
            {isActive && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.primaryScale[600],
                  lineHeight: tokens.typography.lineHeight.tight,
                  zIndex: 1,
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                {item.label}
              </Text>
            )}

            {/* Active top indicator bar */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: tokens.spacing[10],
                  height: 3,
                  borderRadius: `0 0 ${tokens.borderRadius.full} ${tokens.borderRadius.full}`,
                  backgroundColor: tokens.colors.primaryScale[500],
                  transition: `all ${tokens.motion.hover}`,
                }}
              />
            )}

            {/* Press ripple overlay */}
            {isPressed && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: tokens.spacing[10],
                  height: tokens.spacing[10],
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[100],
                  opacity: 0.5,
                  zIndex: 0,
                }}
              />
            )}
          </>
        );

        const eventHandlers = {
          onClick: handleClick,
          onMouseEnter: () => setHoveredKey(item.key),
          onMouseLeave: () => { setHoveredKey(null); setPressedKey(null); },
          onMouseDown: () => setPressedKey(item.key),
          onMouseUp: () => setPressedKey(null),
        };

        return item.href ? (
          <a key={item.key} href={item.href} style={itemStyle} {...eventHandlers}>
            {itemContent}
          </a>
        ) : (
          <div key={item.key} style={itemStyle} {...eventHandlers}>
            {itemContent}
          </div>
        );
      })}
    </div>
  );
});
