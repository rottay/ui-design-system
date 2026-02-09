'use client';

/**
 * SearchBar - Basic Preset
 * Polished search input with icon, clear button, keyboard shortcut badge,
 * animated focus expansion, accent underline, and engine-aware glass.
 */

import React, { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createSurfaceStyle,
  createBadgeStyle,
  createAccentBarStyle,
  createFocusRingStyle,
} from '../../../helpers';
import type { SearchBarProps } from '../../core';

export const BasicSearchBar = createPreset<SearchBarProps>({
  name: 'SearchBar.Basic',
  render: ({ primitives, props, tokens, engine }: PresetContext<SearchBarProps>) => {
    const { Box, Spinner } = primitives;
    const {
      placeholder = 'Search...',
      value: controlledValue,
      defaultValue = '',
      onChange,
      onSearch,
      loading,
      showShortcut,
      shortcutKey = 'K',
      size = 'md',
      autoFocus,
      className,
      style,
    } = props;

    const [internalValue, setInternalValue] = useState(defaultValue);
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const value = controlledValue ?? internalValue;
    const isGlass = engine === 'modern' && !!tokens.glass;

    const sizeConfig = useMemo(() => ({
      sm: {
        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
        fontSize: tokens.typography.fontSize.sm,
        iconSize: tokens.typography.fontSize.sm,
        height: tokens.spacing[8],
      },
      md: {
        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
        fontSize: tokens.typography.fontSize.md,
        iconSize: tokens.typography.fontSize.md,
        height: tokens.spacing[10],
      },
      lg: {
        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
        fontSize: tokens.typography.fontSize.lg,
        iconSize: tokens.typography.fontSize.lg,
        height: tokens.spacing[12],
      },
    }), [tokens]);

    const currentSize = sizeConfig[size];

    const wrapperStyle = useMemo((): React.CSSProperties => ({
      ...createSurfaceStyle(tokens, {
        elevation: isFocused ? 'md' : 'sm',
        glass: isGlass,
      }),
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      transition: `all ${tokens.motion.hover}`,
      transform: isFocused
        ? `scale(1.01)`
        : isHovered
          ? tokens.motion.transform
          : 'none',
      backgroundColor: isGlass && tokens.glass
        ? tokens.glass.bg
        : tokens.colors.common.white,
    }), [tokens, isFocused, isHovered, isGlass]);

    const shortcutBadge = useMemo(() => createBadgeStyle(tokens, 'secondary'), [tokens]);
    const accentBar = useMemo(() => createAccentBarStyle(tokens, { position: 'top' }), [tokens]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (controlledValue === undefined) setInternalValue(newValue);
      onChange?.(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') onSearch?.(value);
    };

    const handleClear = () => {
      if (controlledValue === undefined) setInternalValue('');
      onChange?.('');
    };

    return (
      <div
        className={className}
        style={{ position: 'relative', ...style }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={wrapperStyle}>
          {/* Focus accent bar at bottom */}
          {isFocused && (
            <div
              style={{
                ...accentBar,
                position: 'absolute',
                bottom: 0,
                left: 0,
                borderRadius: `0 0 ${tokens.borderRadius.lg} ${tokens.borderRadius.lg}`,
              }}
            />
          )}

          {/* Search icon */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: tokens.spacing[3],
              color: isFocused
                ? tokens.colors.primaryScale[500]
                : tokens.colors.neutral[400],
              fontSize: currentSize.iconSize,
              transition: `color ${tokens.motion.hover}`,
              flexShrink: 0,
            }}
          >
            <svg
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Box>

          {/* Input */}
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus={autoFocus}
            style={{
              flex: 1,
              height: currentSize.height,
              padding: currentSize.padding,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              color: tokens.colors.neutral[900],
              fontSize: currentSize.fontSize,
              fontFamily: 'inherit',
              fontWeight: tokens.typography.fontWeight.normal,
              lineHeight: tokens.typography.lineHeight.normal,
            }}
          />

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: tokens.spacing[1],
                marginRight: tokens.spacing[1],
                border: 'none',
                backgroundColor: tokens.colors.neutral[100],
                color: tokens.colors.neutral[500],
                borderRadius: tokens.borderRadius.full,
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.xs,
                transition: `all ${tokens.motion.hover}`,
                width: tokens.spacing[5],
                height: tokens.spacing[5],
                flexShrink: 0,
                fontFamily: 'inherit',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.neutral[200];
                e.currentTarget.style.color = tokens.colors.neutral[700];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.neutral[100];
                e.currentTarget.style.color = tokens.colors.neutral[500];
              }}
            >
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          {/* Loading spinner */}
          {loading && (
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                paddingRight: tokens.spacing[3],
                flexShrink: 0,
              }}
            >
              <Spinner size="sm" />
            </Box>
          )}

          {/* Keyboard shortcut badge */}
          {showShortcut && !value && (
            <span
              style={{
                ...shortcutBadge,
                marginRight: tokens.spacing[3],
                flexShrink: 0,
                opacity: isFocused ? 0 : 0.7,
                transition: `opacity ${tokens.motion.hover}`,
              }}
            >
              {'\u2318'}{shortcutKey}
            </span>
          )}
        </div>
      </div>
    );
  },
});
