'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPreset } from '../../../factory';
import type { MentionInputProps, MentionUser } from '../../core';
import { MENTION_INPUT_DEFAULTS } from '../../core';

export default createPreset<MentionInputProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const {
    value: controlledValue,
    onChange,
    onSubmit,
    users = MENTION_INPUT_DEFAULTS.users,
    placeholder = MENTION_INPUT_DEFAULTS.placeholder,
    submitLabel = MENTION_INPUT_DEFAULTS.submitLabel,
    className,
    style,
  } = props;

  const [internalValue, setInternalValue] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);

    // Check for @ mention trigger
    const cursorPos = textareaRef.current?.selectionStart || 0;
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
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    const newValue =
      textBeforeCursor.slice(0, lastAtIndex) + `@${user.name} ` + textAfterCursor;

    handleChange(newValue);
    setShowMentions(false);
    textareaRef.current?.focus();
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
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit?.(value);
    }
  };

  const handleSubmit = () => {
    onSubmit?.(value);
  };

  return (
    <Box
      className={className}
      style={{
        position: 'relative',
        ...style,
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: '100%',
          minHeight: '100px',
          padding: tokens.spacing[4],
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
          fontSize: tokens.typography.fontSize.md,
          fontFamily: 'inherit',
          color: tokens.colors.neutral[900],
          resize: 'vertical',
          outline: 'none',
          transition: `border-color ${tokens.motion.hover}`,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = tokens.colors.primaryScale[500];
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = tokens.colors.neutral[300];
        }}
      />

      {/* Mention Dropdown */}
      {showMentions && filteredUsers.length > 0 && (
        <Box
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: tokens.spacing[1],
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
              }}
            >
              {user.avatar ? (
                <Box
                  style={{
                    width: '32px',
                    height: '32px',
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
                    width: '32px',
                    height: '32px',
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
                      fontSize: tokens.typography.fontSize.sm,
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

      {/* Submit Button */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: tokens.spacing[2],
        }}
      >
        <button
          onClick={handleSubmit}
          style={{
            padding: `${tokens.spacing[2]} ${tokens.spacing[6]}`,
            borderRadius: tokens.borderRadius.md,
            border: 'none',
            backgroundColor: tokens.colors.primaryScale[600],
            color: tokens.colors.common.white,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[700];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[600];
          }}
        >
          {submitLabel}
        </button>
      </Box>
    </Box>
  );
});
