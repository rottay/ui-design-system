'use client';

/**
 * ContextualToolbar - Anchored Preset
 * Rich inline toolbar with accent bar, focus rings, active indicators,
 * keyboard shortcut hints, and animated group dividers.
 */

import React, { useState, useMemo } from 'react';
import { createPreset } from '../../../factory';
import type { ContextualToolbarProps } from '../../core';
import {
  createCardStyle,
  createAccentBarStyle,
  createFocusRingStyle,
  createBadgeStyle,
  createHoverStyle,
} from '../../../helpers';

export const AnchoredPreset = createPreset<ContextualToolbarProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const { Box } = primitives;
  const { actions, visible = true, className, style } = props;
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const isGlass = tokens.surface.useGlass && !!tokens.glass;

  const containerStyle = useMemo(() => ({
    ...createCardStyle(tokens, {
      glass: isGlass,
      elevation: 'sm',
      padding: tokens.spacing[2],
      interactive: false,
    }),
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[1],
    position: 'relative' as const,
    overflow: 'hidden' as const,
  }), [tokens, isGlass]);

  const accentBarStyle = useMemo(
    () => createAccentBarStyle(tokens, { position: 'top' }),
    [tokens],
  );

  const focusRing = useMemo(() => createFocusRingStyle(tokens), [tokens]);

  const shortcutBadgeStyle = useMemo(
    () => createBadgeStyle(tokens, 'secondary'),
    [tokens],
  );

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
      borderLeft: isActive
        ? `3px solid ${tokens.colors.primaryScale[500]}`
        : '3px solid transparent',
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
      transform: isHovered && !isActive ? tokens.motion.transform : 'none',
      boxShadow: isHovered && !isActive ? tokens.shadows.sm : 'none',
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
      {/* Accent bar at top */}
      <div
        style={{
          ...accentBarStyle,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

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

              {/* Active indicator dot */}
              {action.active && (
                <Box
                  style={{
                    position: 'absolute',
                    bottom: tokens.spacing[1],
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 4,
                    height: 4,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[500],
                  }}
                />
              )}

              {/* Keyboard shortcut hint badge */}
              {action.key.length === 1 && (
                <span
                  style={{
                    ...shortcutBadgeStyle,
                    marginLeft: tokens.spacing[1],
                    padding: `0 ${tokens.spacing[1]}px`,
                    fontSize: tokens.typography.fontSize.xs,
                    lineHeight: tokens.typography.lineHeight.tight,
                    opacity: hoveredKey === action.key ? 1 : 0.6,
                    transition: `opacity ${tokens.motion.hover}`,
                  }}
                >
                  {action.key.toUpperCase()}
                </span>
              )}
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

AnchoredPreset.displayName = 'ContextualToolbarAnchoredPreset';
