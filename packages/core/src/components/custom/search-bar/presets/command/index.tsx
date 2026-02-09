'use client';

/**
 * SearchBar - Command Preset (cmd+k style)
 * Command palette overlay with backdrop, grouped suggestions, keyboard navigation,
 * hover states, glass effect for modern engine, and fully tokenized styles
 */

import { useState, useEffect } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { SearchBarProps } from '../../core';

export const CommandSearchBar = createPreset<SearchBarProps>({
  name: 'SearchBar.Command',
  render: ({ primitives, props, tokens, engine }: PresetContext<SearchBarProps>) => {
    const { Box, Spinner } = primitives;
    const {
      placeholder = 'Type a command or search...',
      value: controlledValue,
      defaultValue = '',
      onChange,
      suggestions = [],
      onSuggestionSelect,
      loading,
      showShortcut = true,
      shortcutKey = 'K',
      className,
      style
    } = props;

    const [internalValue, setInternalValue] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
    const value = controlledValue ?? internalValue;

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcutKey.toLowerCase()) {
          e.preventDefault();
          setIsOpen(true);
        }
        if (e.key === 'Escape') setIsOpen(false);
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [shortcutKey]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (controlledValue === undefined) setInternalValue(newValue);
      onChange?.(newValue);
    };

    // Group suggestions by category
    const grouped = suggestions.reduce((acc, s) => {
      const cat = s.category || 'Results';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(s);
      return acc;
    }, {} as Record<string, typeof suggestions>);

    // Glass effect styles for modern engine
    const glassStyles = tokens.surface.useGlass && tokens.glass
      ? {
          backdropFilter: tokens.glass.blur,
          WebkitBackdropFilter: tokens.glass.blur,
          backgroundColor: tokens.glass.bg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
        }
      : {};

    if (!isOpen) {
      return (
        <div
          className={className}
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
            borderRadius: tokens.borderRadius.md,
            cursor: 'pointer',
            color: tokens.colors.neutral[400],
            backgroundColor: tokens.colors.common.white,
            transition: `all ${tokens.motion.hover}`,
            fontFamily: 'inherit',
            ...style,
          }}
        >
          <span>{placeholder}</span>
          {showShortcut && (
            <Box style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              backgroundColor: tokens.colors.neutral[100],
              borderRadius: tokens.borderRadius.sm,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[600],
              fontFamily: 'monospace',
            }}>
              {shortcutKey}
            </Box>
          )}
        </div>
      );
    }

    return (
      <>
        {/* Backdrop */}
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: tokens.overlay?.light,
            zIndex: 999,
          }}
        />
        {/* Modal */}
        <Box
          className={className}
          style={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '600px',
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.lg,
            boxShadow: tokens.shadows.xl,
            zIndex: 1000,
            overflow: 'hidden',
            ...glassStyles,
            ...style,
          }}
        >
          {/* Search input */}
          <Box style={{
            padding: tokens.spacing[4],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              autoFocus
              style={{
                width: '100%',
                padding: tokens.spacing[2],
                border: 'none',
                fontSize: tokens.typography.fontSize.lg,
                outline: 'none',
                color: tokens.colors.neutral[900],
                backgroundColor: 'transparent',
                fontFamily: 'inherit',
              }}
            
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = tokens.colors.neutral[300];
              }}
            />
          </Box>

          {loading ? (
            <Box style={{ padding: tokens.spacing[8], textAlign: 'center' }}>
              <Spinner size="md" />
            </Box>
          ) : suggestions.length > 0 ? (
            <Box style={{ maxHeight: '400px', overflow: 'auto' }}>
              {Object.entries(grouped).map(([category, items]) => (
                <Box key={category}>
                  <Box style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    fontWeight: tokens.typography.fontWeight.semibold,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {category}
                  </Box>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => { onSuggestionSelect?.(item); setIsOpen(false); }}
                      onMouseEnter={() => setHoveredItemId(item.id)}
                      onMouseLeave={() => setHoveredItemId(null)}
                      style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[3],
                        backgroundColor: hoveredItemId === item.id ? tokens.colors.primaryScale[50] : undefined,
                        transform: hoveredItemId === item.id ? tokens.motion.transform : 'none',
                        transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                      }}
                    >
                      {item.icon && (
                        <Box style={{ flexShrink: 0, color: tokens.colors.neutral[500] }}>
                          {item.icon}
                        </Box>
                      )}
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Box style={{
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[900],
                        }}>
                          {item.label}
                        </Box>
                        {item.description && (
                          <Box style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[500],
                          }}>
                            {item.description}
                          </Box>
                        )}
                      </Box>
                    </div>
                  ))}
                </Box>
              ))}
            </Box>
          ) : value && (
            <Box style={{
              padding: tokens.spacing[8],
              textAlign: 'center',
              color: tokens.colors.neutral[500],
              fontSize: tokens.typography.fontSize.sm,
            }}>
              No results for &ldquo;{value}&rdquo;
            </Box>
          )}
        </Box>
      </>
    );
  },
});
