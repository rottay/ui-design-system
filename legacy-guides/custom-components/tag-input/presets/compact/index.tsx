'use client';

import React, { useState, useRef } from 'react';
import { createPreset } from '../../../factory';
import type { TagInputProps, Tag } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
} from '../../../helpers';

export const CompactPreset = createPreset<TagInputProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box } = primitives;
  const {
    tags: rawTags = [],
    onAdd,
    onRemove,
    placeholder = 'Add tags...',
    maxTags,
    className,
    style,
  } = props;

    const tags = Array.isArray(rawTags) ? rawTags : [];

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag: Tag = {
        key: inputValue.toLowerCase().replace(/\s+/g, '-'),
        label: inputValue.trim(),
      };
      onAdd?.(newTag);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onRemove?.(tags[tags.length - 1].key);
    }
  };

  const isMaxReached = maxTags !== undefined && tags.length >= maxTags;

  return (
    <Box className={className} style={style}>
      <Box
        style={{
          boxShadow: tokens.shadows.sm,
          display: 'flex',
          flexWrap: 'wrap',
          gap: tokens.spacing[1],
          padding: tokens.spacing[1],
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
          borderRadius: tokens.borderRadius.sm,
          backgroundColor: tokens.colors.common.white,
          minHeight: '36px',
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
              padding: `2px ${tokens.spacing[1]}`,
              backgroundColor: tag.color || tokens.colors.primaryScale[100],
              color: tag.color ? tokens.colors.common.white : tokens.colors.primaryScale[800],
              borderRadius: tokens.borderRadius.sm,
              fontSize: tokens.typography.fontSize.xs,
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
                fontSize: tokens.typography.fontSize.xs,
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
              minWidth: '80px',
              fontSize: tokens.typography.fontSize.sm,
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
    </Box>
  );
});

CompactPreset.displayName = 'TagInputCompactPreset';
