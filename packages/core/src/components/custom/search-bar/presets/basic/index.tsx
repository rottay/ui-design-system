'use client';

/**
 * SearchBar - Basic Preset
 * Clean input with focus ring, loading spinner, and engine-aware transitions
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
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
      size = 'md',
      autoFocus,
      className,
      style
    } = props;

    const [internalValue, setInternalValue] = useState(defaultValue);
    const [isFocused, setIsFocused] = useState(false);
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
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') onSearch?.(value);
    };

    return (
      <Box className={className} style={{ position: 'relative', ...style }}>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            setIsFocused(true);
            e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
            e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
          }}
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
            paddingRight: loading ? '40px' : undefined,
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
    );
  },
});
