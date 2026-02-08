'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPreset } from '../../../factory';
import type { TagInputProps, Tag } from '../../core';
import {
  createHoverStyle,
} from '../../../helpers';

export const StandardPreset = createPreset<TagInputProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const {
    tags = [],
    suggestions = [],
    onAdd,
    onRemove,
    placeholder = 'Add tags...',
    maxTags,
    className,
    style,
  } = props;

  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.label.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.some((t) => t.key === s.key)
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag: Tag = {
        key: inputValue.toLowerCase().replace(/\s+/g, '-'),
        label: inputValue.trim(),
      };
      onAdd?.(newTag);
      setInputValue('');
      setShowSuggestions(false);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onRemove?.(tags[tags.length - 1].key);
    }
  };

  const handleAddSuggestion = (tag: Tag) => {
    onAdd?.(tag);
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (inputValue && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, filteredSuggestions.length]);

  const isMaxReached = maxTags !== undefined && tags.length >= maxTags;

  return (
    <Box className={className} style={{ position: 'relative', ...style }}>
      <Box
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: tokens.spacing[2],
          padding: tokens.spacing[2],
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
          borderRadius: tokens.borderRadius.md,
          backgroundColor: tokens.colors.common.white,
          minHeight: '42px',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <Box
            key={tag.key}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
              backgroundColor: tag.color || tokens.colors.primaryScale[100],
              color: tag.color ? tokens.colors.common.white : tokens.colors.primaryScale[800],
              borderRadius: tokens.borderRadius.sm,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
            }}
          >
            {tag.label}
            <button
              type="button"
              onClick={() => onRemove?.(tag.key)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                color: 'inherit',
                fontSize: tokens.typography.fontSize.sm,
              }}
            >
              ×
            </button>
          </Box>
        ))}

        {!isMaxReached && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
            style={{
              border: 'none',
              outline: 'none',
              flex: 1,
              minWidth: '120px',
              fontSize: tokens.typography.fontSize.md,
              backgroundColor: 'transparent',
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
        )}
      </Box>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <Box
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: tokens.spacing[1],
            backgroundColor: tokens.colors.common.white,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            borderRadius: tokens.borderRadius.md,
            boxShadow: `0 4px 12px ${tokens.colors.neutral[200]}`,
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          {filteredSuggestions.map((suggestion) => (
            <Box
              key={suggestion.key}
              onClick={() => handleAddSuggestion(suggestion)}
              style={{
                padding: tokens.spacing[2],
                cursor: 'pointer',
                transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
                e.currentTarget.style.transform = tokens.motion.transform;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.common.white;
                e.currentTarget.style.transform = 'none';
              }}
            >
              <Text>{suggestion.label}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
});

StandardPreset.displayName = 'TagInputStandardPreset';
