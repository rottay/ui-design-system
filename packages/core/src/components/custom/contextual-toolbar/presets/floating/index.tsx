'use client';

/**
 * ContextualToolbar - Floating Preset
 * Elevated floating toolbar with animated entrance, caret arrow,
 * glass support, focus rings, and per-button hover transforms.
 */

import React, { useState, useMemo } from 'react';
import { createPreset } from '../../../factory';
import type { ContextualToolbarProps } from '../../core';
import {
  createCardStyle,
  createFocusRingStyle,
  createBadgeStyle,
  createHoverStyle,
  getCardHoverShadow,
} from '../../../helpers';

export const FloatingPreset = createPreset<ContextualToolbarProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const { Box } = primitives;
  const { actions, visible = true, position, className, style } = props;
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const isGlass = tokens.surface.useGlass && !!tokens.glass;

  const containerStyle = useMemo((): React.CSSProperties => ({
    ...createCardStyle(tokens, {
      glass: isGlass,
      elevation: 'lg',
      padding: tokens.spacing[1],
      interactive: false,
    }),
    position: 'absolute',
    top: position?.top,
    left: position?.left,
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing[1],
    zIndex: 1000,
    /* Animated entrance */
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${tokens.spacing[2]}px)`,
    transition: `opacity ${tokens.motion.hover}, transform ${tokens.motion.hover}, box-shadow ${tokens.motion.hover}`,
  }), [tokens, isGlass, visible, position]);

  const focusRing = useMemo(() => createFocusRingStyle(tokens), [tokens]);

  const activeBadgeStyle = useMemo(
    () => createBadgeStyle(tokens, 'primary'),
    [tokens],
  );

  const caretStyle = useMemo((): React.CSSProperties => ({
    position: 'absolute',
    bottom: -6,
    left: '50%',
    transform: 'translateX(-50%) rotate(45deg)',
    width: 12,
    height: 12,
    backgroundColor: isGlass && tokens.glass
      ? tokens.glass.bg
      : tokens.colors.common.white,
    borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
    boxShadow: `2px 2px 4px ${tokens.colors.neutral[100]}`,
    zIndex: -1,
  }), [tokens, isGlass]);

  const dividerStyle = useMemo((): React.CSSProperties => ({
    width: tokens.surface.borderWidth !== '0' ? tokens.surface.borderWidth : 1,
    alignSelf: 'stretch',
    marginTop: tokens.spacing[1],
    marginBottom: tokens.spacing[1],
    background: `linear-gradient(to bottom, transparent, ${tokens.colors.neutral[300]}, transparent)`,
    borderRadius: tokens.borderRadius.full,
    flexShrink: 0,
  }), [tokens]);

  const getButtonStyle = useMemo(() => (action: typeof actions[0]): React.CSSProperties => {
    const isActive = !!action.active;
    const isHovered = hoveredKey === action.key;

    return {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing[1],
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      border: 'none',
      backgroundColor: isActive
        ? tokens.colors.primaryScale[50]
        : isHovered
          ? tokens.colors.neutral[100]
          : 'transparent',
      color: isActive
        ? tokens.colors.primaryScale[700]
        : isHovered
          ? tokens.colors.neutral[900]
          : tokens.colors.neutral[700],
      borderRadius: tokens.borderRadius.md,
      cursor: 'pointer',
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: isActive
        ? tokens.typography.fontWeight.semibold
        : tokens.typography.fontWeight.medium,
      lineHeight: tokens.typography.lineHeight.tight,
      transition: `all ${tokens.motion.hover}`,
      transform: isHovered ? tokens.motion.transform : 'none',
      boxShadow: isHovered ? tokens.shadows.sm : 'none',
      outline: 'none',
      fontFamily: 'inherit',
    };
  }, [tokens, hoveredKey]);

  if (!visible) return null;

  return (
    <div
      className={className}
      style={{
        ...containerStyle,
        ...style,
      }}
    >
      {actions.map((action) => (
        <React.Fragment key={action.key}>
          {action.divider ? (
            <div style={dividerStyle} />
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              title={action.label}
              onMouseEnter={() => setHoveredKey(action.key)}
              onMouseLeave={() => setHoveredKey(null)}
              onFocus={(e) => {
                Object.assign(e.currentTarget.style, focusRing.focus);
              }}
              onBlur={(e) => {
                Object.assign(e.currentTarget.style, focusRing.blur);
              }}
              style={getButtonStyle(action)}
            >
              {/* Icon */}
              {action.icon && (
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: tokens.typography.fontSize.md,
                    flexShrink: 0,
                  }}
                >
                  {action.icon}
                </Box>
              )}

              {/* Label */}
              <span>{action.label}</span>

              {/* Active state badge indicator */}
              {action.active && (
                <Box
                  style={{
                    ...activeBadgeStyle,
                    padding: `0 ${tokens.spacing[1]}px`,
                    fontSize: tokens.typography.fontSize.xs,
                    lineHeight: tokens.typography.lineHeight.tight,
                    marginLeft: tokens.spacing[1],
                  }}
                >
                  On
                </Box>
              )}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* Caret arrow pointing to anchor */}
      <div style={caretStyle} />
    </div>
  );
});

FloatingPreset.displayName = 'ContextualToolbarFloatingPreset';
