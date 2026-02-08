'use client';

import React, { useState, useRef } from 'react';
import { createPreset } from '../../../factory';
import type { MentionInputProps, MentionUser } from '../../core';
import { MENTION_INPUT_DEFAULTS } from '../../core';
import {
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
} from '../../../helpers';

export default createPreset<MentionInputProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const {
    value: controlledValue,
    onChange,
    onSubmit,
    users = MENTION_INPUT_DEFAULTS.users,
    placeholder = MENTION_INPUT_DEFAULTS.placeholder,
    className,
    style,
  } = props;

  const [internalValue, setInternalValue] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);

    // Check for @ mention trigger
    const cursorPos = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const afterAt = textBeforeCursor.slice(lastAtIndex + 1);
      if (!afterAt.includes(' ')) {
        setMentionSearch(afterAt);
        setShowMentions(true);
        setSelectedIndex(0);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const insertMention = (user: MentionUser) => {
    const cursorPos = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    const newValue =
      textBeforeCursor.slice(0, lastAtIndex) + `@${user.name} ` + textAfterCursor;

    handleChange(newValue);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        insertMention(filteredUsers[selectedIndex]);
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit?.(value);
    }
  };

  return (
    <Box
      className={className}
      style={{
        position: 'relative',
        ...style,
      }}
    >
      <input
        type="text"
        ref={inputRef}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: tokens.spacing[4],
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
          fontSize: tokens.typography.fontSize.md,
          fontFamily: 'inherit',
          color: tokens.colors.neutral[900],
          outline: 'none',
          transition: `border-color ${tokens.transitions?.fast || tokens.motion.hover}`,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = tokens.colors.primaryScale[500];
          e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
          e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = tokens.colors.neutral[300];
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = tokens.colors.neutral[300];
        }}
      />

      {/* Mention Dropdown */}
      {showMentions && filteredUsers.length > 0 && (
        <Box
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: tokens.spacing[1],
            backgroundColor: tokens.colors.common.white,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            borderRadius: tokens.borderRadius.md,
            boxShadow: tokens.shadows.lg,
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            minWidth: '250px',
          }}
        >
          {filteredUsers.map((user, idx) => (
            <Box
              key={user.id}
              onClick={() => insertMention(user)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: tokens.spacing[2],
                cursor: 'pointer',
                backgroundColor:
                  idx === selectedIndex ? tokens.colors.primaryScale[50] : 'transparent',
                transition: `all ${tokens.motion.hover}`,
              }}
              onMouseEnter={(e) => {
                setSelectedIndex(idx);
                e.currentTarget.style.transform = tokens.motion.transform;
              }}
            >
              {user.avatar ? (
                <Box
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundImage: `url(${user.avatar})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <Box
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.primaryScale[600],
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </Box>
              )}
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[900],
                }}
              >
                {user.name}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
});
