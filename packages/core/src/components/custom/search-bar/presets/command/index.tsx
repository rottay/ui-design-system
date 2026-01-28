'use client';

/**
 * SearchBar - Command Preset (cmd+k style)
 */

import { useState, useEffect } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SearchBarProps } from '../../core';

export const CommandSearchBar = createPreset<SearchBarProps>({
  name: 'SearchBar.Command',
  render: ({ primitives, props, tokens }: PresetContext<SearchBarProps>) => {
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

    if (!isOpen) {
      return (
        <div
          className={className}
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
            border: `1px solid ${tokens.colors.neutral[300]}`,
            borderRadius: '0.375rem',
            cursor: 'pointer',
            color: tokens.colors.neutral[400],
            ...style,
          }}
        >
          <span>{placeholder}</span>
          {showShortcut && (
            <Box style={{
              padding: '2px 6px',
              backgroundColor: tokens.colors.neutral[100],
              borderRadius: '4px',
              fontSize: tokens.typography.fontSize.xs,
              fontFamily: 'monospace',
            }}>
              ⌘{shortcutKey}
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
            backgroundColor: 'rgba(0,0,0,0.5)',
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
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            zIndex: 1000,
            overflow: 'hidden',
            ...style,
          }}
        >
          <Box style={{ padding: tokens.spacing[4], borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>
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
                  <Box style={{ padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: 600, textTransform: 'uppercase' }}>
                    {category}
                  </Box>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => { onSuggestionSelect?.(item); setIsOpen(false); }}
                      style={{
                        padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[3],
                      }}
                    >
                      {item.icon && <Box style={{ color: tokens.colors.neutral[500] }}>{item.icon}</Box>}
                      <Box>
                        <Box style={{ fontWeight: 500 }}>{item.label}</Box>
                        {item.description && <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{item.description}</Box>}
                      </Box>
                    </div>
                  ))}
                </Box>
              ))}
            </Box>
          ) : value && (
            <Box style={{ padding: tokens.spacing[8], textAlign: 'center', color: tokens.colors.neutral[500] }}>
              No results for "{value}"
            </Box>
          )}
        </Box>
      </>
    );
  },
});
