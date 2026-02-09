'use client';

/**
 * KeyboardShortcuts - Inline Preset
 * Rich inline shortcut reference with glass container, 3D key caps,
 * category section headers, hover highlights, search filter, and accent bar.
 */

import React, { useState, useMemo } from 'react';
import { createPreset } from '../../../factory';
import type { KeyboardShortcutsProps } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
  createAccentBarStyle,
  createListItemStyle,
} from '../../../helpers';

export const InlinePreset = createPreset<KeyboardShortcutsProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;
  const { categories, className, style } = props;
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const isGlass = engine === 'modern' && !!tokens.glass;

  const containerStyle = useMemo(() => ({
    ...createCardStyle(tokens, {
      glass: isGlass,
      elevation: 'sm',
      padding: 0,
      interactive: false,
    }),
    position: 'relative' as const,
    overflow: 'hidden' as const,
  }), [tokens, isGlass]);

  const accentBar = useMemo(() => createAccentBarStyle(tokens, { position: 'top' }), [tokens]);
  const panelHeader = useMemo(() => createPanelHeaderStyle(tokens), [tokens]);
  const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

  const keyCapStyle = useMemo((): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
    minWidth: tokens.spacing[7],
    backgroundColor: tokens.colors.common.white,
    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
    borderRadius: tokens.borderRadius.sm,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.semibold,
    fontFamily: 'inherit',
    color: tokens.colors.neutral[800],
    textAlign: 'center',
    /* 3D inset shadow effect */
    boxShadow: `0 2px 0 ${tokens.colors.neutral[300]}, inset 0 -1px 0 ${tokens.colors.neutral[100]}`,
    lineHeight: tokens.typography.lineHeight.tight,
    transition: `all ${tokens.motion.hover}`,
  }), [tokens]);

  const plusStyle = useMemo((): React.CSSProperties => ({
    color: tokens.colors.neutral[400],
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.medium,
    padding: `0 ${tokens.spacing[1]}px`,
    userSelect: 'none',
  }), [tokens]);

  const filteredCategories = useMemo(() => {
    if (!filter) return categories;
    const q = filter.toLowerCase();
    return categories.map((cat) => ({
      ...cat,
      shortcuts: cat.shortcuts.filter((s) =>
        s.description.toLowerCase().includes(q) || s.keys.some((k) => k.toLowerCase().includes(q)),
      ),
    })).filter((cat) => cat.shortcuts.length > 0);
  }, [categories, filter]);

  return (
    <div className={className} style={{ ...containerStyle, ...style }}>
      {/* Accent bar */}
      <div style={accentBar} />

      {/* Panel header with title */}
      <div
        style={{
          ...panelHeader,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
        }}
      >
        <Text
          style={{
            fontWeight: tokens.typography.fontWeight.bold,
            fontSize: tokens.typography.fontSize.md,
            color: tokens.colors.neutral[900],
          }}
        >
          Keyboard Shortcuts
        </Text>

        <Box
          style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[400],
            fontWeight: tokens.typography.fontWeight.medium,
          }}
        >
          {categories.reduce((sum, c) => sum + c.shortcuts.length, 0)} shortcuts
        </Box>
      </div>

      {/* Search / filter area */}
      <div
        style={{
          padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
        }}
      >
        <input
          type="text"
          placeholder="Filter shortcuts..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            width: '100%',
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            borderRadius: tokens.borderRadius.sm,
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[800],
            backgroundColor: tokens.colors.neutral[50],
            outline: 'none',
            fontFamily: 'inherit',
            transition: `border-color ${tokens.motion.hover}`,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = tokens.colors.primaryScale[400]; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = tokens.colors.neutral[200]; }}
        />
      </div>

      {/* Category list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          gap: tokens.spacing[5],
        }}
      >
        {filteredCategories.map((category) => (
          <div key={category.key}>
            <div style={{
              ...sectionHeader, display: 'flex', alignItems: 'center',
              gap: tokens.spacing[2], marginBottom: tokens.spacing[3],
            }}>
              <div
                style={{
                  width: tokens.spacing[1],
                  height: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[400],
                  flexShrink: 0,
                }}
              />
              {category.label}
            </div>

            {/* Shortcuts list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
              {category.shortcuts.map((shortcut) => {
                const isHovered = hoveredKey === shortcut.key;
                const rowStyle = createListItemStyle(tokens, {
                  active: false,
                  interactive: true,
                });

                return (
                  <div
                    key={shortcut.key}
                    onMouseEnter={() => setHoveredKey(shortcut.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    style={{
                      ...rowStyle,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: isHovered
                        ? tokens.colors.primaryScale[50]
                        : tokens.colors.neutral[50],
                      borderBottom: 'none',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Text
                      style={{
                        color: isHovered
                          ? tokens.colors.primaryScale[700]
                          : tokens.colors.neutral[800],
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.normal,
                        transition: `color ${tokens.motion.hover}`,
                      }}
                    >
                      {shortcut.description}
                    </Text>

                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], flexShrink: 0 }}>
                      {shortcut.keys.map((key, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && <span style={plusStyle}>+</span>}
                          <span
                            style={{
                              ...keyCapStyle,
                              transform: isHovered ? `translateY(-1px)` : 'none',
                              boxShadow: isHovered
                                ? `0 3px 0 ${tokens.colors.neutral[300]}, inset 0 -1px 0 ${tokens.colors.neutral[100]}`
                                : keyCapStyle.boxShadow,
                            }}
                          >
                            {key}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filteredCategories.length === 0 && (
          <Box
            style={{
              textAlign: 'center',
              padding: `${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
              color: tokens.colors.neutral[400],
              fontSize: tokens.typography.fontSize.sm,
            }}
          >
            No shortcuts match "{filter}"
          </Box>
        )}
      </div>
    </div>
  );
});

InlinePreset.displayName = 'KeyboardShortcutsInlinePreset';
