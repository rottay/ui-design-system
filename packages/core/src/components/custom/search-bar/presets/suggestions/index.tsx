'use client';

/**
 * SearchBar - Suggestions Preset
 * Input with dropdown suggestion list, keyboard navigation, hover states, and focus ring
 */

import { useState, useRef, useEffect } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createHoverStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { SearchBarProps } from '../../core';

export const SuggestionsSearchBar = createPreset<SearchBarProps>({
  name: 'SearchBar.Suggestions',
  render: ({ primitives, props, tokens, engine }: PresetContext<SearchBarProps>) => {
    const { Box, Card, Stack, Spinner } = primitives;
    const {
      placeholder = 'Search...',
      value: controlledValue,
      defaultValue = '',
      onChange,
      onSearch,
      suggestions = [],
      onSuggestionSelect,
      loading,
      size = 'md',
      autoFocus,
      className,
      style
    } = props;

    const [internalValue, setInternalValue] = useState(defaultValue);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [hoveredIndex, setHoveredIndex] = useState(-1);
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const value = controlledValue ?? internalValue;

    const sizeStyles = {
      sm: { padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, fontSize: tokens.typography.fontSize.sm },
      md: { padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.md },
      lg: { padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, fontSize: tokens.typography.fontSize.lg },
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (controlledValue === undefined) setInternalValue(newValue);
      onChange?.(newValue);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, -1));
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          onSuggestionSelect?.(suggestions[selectedIndex]);
          setShowSuggestions(false);
        } else {
          onSearch?.(value);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };

    const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
      onSuggestionSelect?.(suggestion);
      setShowSuggestions(false);
    };

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setShowSuggestions(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getItemBackground = (index: number): string | undefined => {
      if (index === selectedIndex) return tokens.colors.primaryScale[50];
      if (index === hoveredIndex) return tokens.colors.neutral[50];
      return undefined;
    };

    return (
      <div ref={containerRef} className={className} style={{ position: 'relative', ...style }}>
        <Box style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={(e) => { setShowSuggestions(true); setIsFocused(true);
              e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
              e.currentTarget.style.borderColor = tokens.colors.primaryScale[400]; }}
            onBlur={(e) => {
              setIsFocused(false);
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = tokens.colors.neutral[300];
            }}
            autoFocus={autoFocus}
            style={{
              width: '100%',
              ...sizeStyles[size],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isFocused ? tokens.colors.primaryScale[400] : tokens.colors.neutral[300]}`,
              borderRadius: tokens.borderRadius.md,
              outline: 'none',
              color: tokens.colors.neutral[900],
              backgroundColor: tokens.colors.common.white,
              fontFamily: 'inherit',
              transition: `all ${tokens.motion.hover}`,
              ...(isFocused ? {
                boxShadow: `0 0 0 2px ${tokens.colors.primaryScale[100]}`,
              } : {}),
            }}
          />
          {loading && (
            <Box style={{ position: 'absolute', right: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)' }}>
              <Spinner size="sm" />
            </Box>
          )}
        </Box>

        {showSuggestions && suggestions.length > 0 && (
          <Card
            variant="elevated"
            padding="none"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: tokens.spacing[1],
              zIndex: 1000,
              maxHeight: '300px',
              overflow: 'auto',
              borderRadius: tokens.borderRadius.md,
            }}
          >
            <Stack direction="vertical" spacing="none">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(-1)}
                  style={{
                    padding: tokens.spacing[3],
                    cursor: 'pointer',
                    backgroundColor: getItemBackground(index),
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                    transform: index === hoveredIndex ? tokens.motion.transform : 'none',
                  }}
                >
                  {suggestion.icon && (
                    <Box style={{ flexShrink: 0, color: tokens.colors.neutral[500] }}>
                      {suggestion.icon}
                    </Box>
                  )}
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{ fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>
                      {suggestion.label}
                    </Box>
                    {suggestion.description && (
                      <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                        {suggestion.description}
                      </Box>
                    )}
                  </Box>
                </div>
              ))}
            </Stack>
          </Card>
        )}
      </div>
    );
  },
});
