/**
 * SearchBar - Suggestions Preset
 */

import { useState, useRef, useEffect } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SearchBarProps } from '../../core';

export const SuggestionsSearchBar = createPreset<SearchBarProps>({
  name: 'SearchBar.Suggestions',
  render: ({ primitives, props, tokens }: PresetContext<SearchBarProps>) => {
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
    const containerRef = useRef<HTMLDivElement>(null);
    const value = controlledValue ?? internalValue;

    const sizeStyles = {
      sm: { padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`, fontSize: tokens.typography.fontSize.sm },
      md: { padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`, fontSize: tokens.typography.fontSize.md },
      lg: { padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`, fontSize: tokens.typography.fontSize.lg },
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

    return (
      <div ref={containerRef} className={className} style={{ position: 'relative', ...style }}>
        <Box style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            autoFocus={autoFocus}
            style={{
              width: '100%',
              ...sizeStyles[size],
              border: `1px solid ${tokens.colors.neutral[300]}`,
              borderRadius: '0.375rem',
              outline: 'none',
            }}
          />
          {loading && (
            <Box style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
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
              marginTop: '4px',
              zIndex: 1000,
              maxHeight: '300px',
              overflow: 'auto',
            }}
          >
            <Stack direction="vertical" spacing="none">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    padding: tokens.spacing[3],
                    cursor: 'pointer',
                    backgroundColor: index === selectedIndex ? tokens.colors.neutral[100] : undefined,
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                  }}
                >
                  {suggestion.icon}
                  <Box>
                    <Box style={{ fontWeight: 500 }}>{suggestion.label}</Box>
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
