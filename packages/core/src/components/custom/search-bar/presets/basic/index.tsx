/**
 * SearchBar - Basic Preset
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SearchBarProps } from '../../core';

export const BasicSearchBar = createPreset<SearchBarProps>({
  name: 'SearchBar.Basic',
  render: ({ primitives, props, tokens }: PresetContext<SearchBarProps>) => {
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
          autoFocus={autoFocus}
          style={{
            width: '100%',
            ...sizeStyles[size],
            border: `1px solid ${tokens.colors.neutral[300]}`,
            borderRadius: '0.375rem',
            outline: 'none',
            paddingRight: loading ? '40px' : undefined,
          }}
        />
        {loading && (
          <Box style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            <Spinner size="sm" />
          </Box>
        )}
      </Box>
    );
  },
});
