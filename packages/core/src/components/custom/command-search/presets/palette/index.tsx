'use client';

/**
 * CommandSearch - Palette Preset
 * Cmd+K command palette overlay with search, results, quick actions, and recent searches
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { CommandSearchProps } from '../../core';
import { COMMAND_SEARCH_DEFAULTS } from '../../core';
import {
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
} from '../../../helpers';

export const PaletteCommandSearch = createPreset<CommandSearchProps>({
  name: 'CommandSearch.Palette',
  render: ({ primitives, props, tokens, engine }: PresetContext<CommandSearchProps>) => {
    const { Box } = primitives;
    const {
      placeholder = COMMAND_SEARCH_DEFAULTS.placeholder,
      results = [],
      categories = [],
      quickActions = [],
      recentSearches = [],
      onSearch,
      onSelect,
      onRecentSelect,
      onClearRecent,
      loading,
      shortcutLabel = COMMAND_SEARCH_DEFAULTS.shortcutLabel,
      open: controlledOpen,
      onOpenChange,
      maxResults = COMMAND_SEARCH_DEFAULTS.maxResults,
      className,
      style,
    } = props;

    const [internalOpen, setInternalOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const isOpen = controlledOpen ?? internalOpen;
    const setOpen = useCallback((v: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(v);
      onOpenChange?.(v);
    }, [controlledOpen, onOpenChange]);

    // Keyboard shortcut to open
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          setOpen(!isOpen);
        }
        if (e.key === 'Escape' && isOpen) {
          setOpen(false);
        }
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }, [isOpen, setOpen]);

    // Focus input when opened
    useEffect(() => {
      if (isOpen) {
        setTimeout(() => inputRef.current?.focus(), 50);
        setQuery('');
        setHighlightedIndex(0);
      }
    }, [isOpen]);

    const handleQueryChange = useCallback((value: string) => {
      setQuery(value);
      setHighlightedIndex(0);
      onSearch?.(value);
    }, [onSearch]);

    const displayResults = results.slice(0, maxResults);

    // Group results by category
    const groupedResults = categories.length > 0
      ? categories.map(cat => ({
          category: cat,
          items: displayResults.filter(r => r.category === cat.key),
        })).filter(g => g.items.length > 0)
      : displayResults.length > 0
        ? [{ category: null, items: displayResults }]
        : [];

    const allItems = groupedResults.flatMap(g => g.items);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(prev + 1, allItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && allItems[highlightedIndex]) {
        onSelect?.(allItems[highlightedIndex]);
        setOpen(false);
      }
    }, [allItems, highlightedIndex, onSelect, setOpen]);

    const getStatusColor = (color?: string) => {
      switch (color) {
        case 'success': return { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700] };
        case 'warning': return { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700] };
        case 'error': return { bg: tokens.colors.errorScale[100], text: tokens.colors.errorScale[700] };
        case 'info': return { bg: tokens.colors.infoScale[100], text: tokens.colors.infoScale[700] };
        default: return { bg: tokens.colors.neutral[100], text: tokens.colors.neutral[600] };
      }
    };

    if (!isOpen) {
      // Trigger button
      return (
        <Box className={className} style={style}>
          <button
            onClick={() => setOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              width: '100%',
              maxWidth: 580,
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
              borderRadius: tokens.borderRadius.lg,
              backgroundColor: tokens.colors.neutral[50],
              color: tokens.colors.neutral[500],
              fontSize: tokens.typography.fontSize.sm,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ flex: 1, textAlign: 'left' }}>{placeholder}</span>
            <span style={{
              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.sm,
              backgroundColor: tokens.colors.neutral[200],
              color: tokens.colors.neutral[600],
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              fontFamily: 'inherit',
            }}>
              {shortcutLabel}
            </span>
          </button>
        </Box>
      );
    }

    // Palette overlay
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: tokens.overlay?.light,
            zIndex: 999,
          }}
        />

        {/* Palette */}
        <div
          ref={containerRef}
          className={className}
          style={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 640,
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.xl,
            boxShadow: tokens.shadows.xl,
            zIndex: 1000,
            overflow: 'hidden',
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            ...style,
            ...(tokens.surface.useGlass && tokens.glass ? {
              backdropFilter: tokens.glass.blur,
              WebkitBackdropFilter: tokens.glass.blur,
              backgroundColor: tokens.glass.bg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
            } : {}),
          }}
        >
          {/* Search input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: tokens.colors.neutral[400] }}>
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: tokens.typography.fontSize.md,
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
            {loading && (
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Searching...</span>
            )}
          </div>

          {/* Results area */}
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {/* Search results */}
            {query && groupedResults.length > 0 && (
              <div style={{ padding: `${tokens.spacing[2]}px 0` }}>
                {groupedResults.map((group, gi) => (
                  <div key={group.category?.key ?? 'all'}>
                    {group.category && (
                      <div style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[500],
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                      }}>
                        {group.category.label}
                      </div>
                    )}
                    {group.items.map((result) => {
                      const globalIndex = allItems.indexOf(result);
                      const isHighlighted = globalIndex === highlightedIndex;
                      const statusC = getStatusColor(result.statusColor);
                      return (
                        <button
                          key={result.id}
                          onClick={() => { onSelect?.(result); setOpen(false); }}
                          onMouseEnter={() => setHighlightedIndex(globalIndex)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[3],
                            width: '100%',
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                            border: 'none',
                            backgroundColor: isHighlighted ? tokens.colors.primaryScale[50] : 'transparent',
                            color: tokens.colors.neutral[900],
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontFamily: 'inherit',
                            fontSize: tokens.typography.fontSize.sm,
                            transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                          }}
                        >
                          {result.icon && <span style={{ flexShrink: 0, color: tokens.colors.neutral[500] }}>{result.icon}</span>}
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {result.label}
                          </span>
                          {result.description && (
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], flexShrink: 0 }}>
                              {result.description}
                            </span>
                          )}
                          {result.status && (
                            <span style={{
                              padding: `0 ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.full,
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              backgroundColor: statusC.bg,
                              color: statusC.text,
                              lineHeight: '20px',
                              flexShrink: 0,
                            }}>
                              {result.status}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {query && groupedResults.length === 0 && !loading && (
              <div style={{
                padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
                textAlign: 'center',
                color: tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
              }}>
                No results found for &ldquo;{query}&rdquo;
              </div>
            )}

            {/* Quick actions (when no query) */}
            {!query && quickActions.length > 0 && (
              <div style={{ padding: `${tokens.spacing[2]}px 0` }}>
                <div style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}>
                  Quick Actions
                </div>
                {quickActions.map((action) => (
                  <button
                    key={action.key}
                    onClick={() => { action.onClick?.(); setOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                      width: '100%',
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: tokens.colors.neutral[700],
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      fontSize: tokens.typography.fontSize.sm,
                      transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                    }}
                  >
                    {action.icon && <span style={{ color: tokens.colors.neutral[500] }}>{action.icon}</span>}
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Recent searches (when no query) */}
            {!query && recentSearches.length > 0 && (
              <div style={{ padding: `${tokens.spacing[2]}px 0`, borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                }}>
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                  }}>
                    Recent
                  </span>
                  {onClearRecent && (
                    <button
                      onClick={onClearRecent}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: tokens.colors.neutral[400],
                        fontSize: tokens.typography.fontSize.xs,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        fontFamily: 'inherit',
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {recentSearches.map((search, i) => (
                  <button
                    key={i}
                    onClick={() => { onRecentSelect?.(search); handleQueryChange(search); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                      width: '100%',
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: tokens.colors.neutral[600],
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      fontSize: tokens.typography.fontSize.sm,
                      transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: tokens.colors.neutral[400] }}>
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 4.5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {search}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.neutral[50],
          }}>
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
              {allItems.length > 0 ? `${allItems.length} result${allItems.length !== 1 ? 's' : ''}` : ''}
            </span>
            <div style={{ display: 'flex', gap: tokens.spacing[3], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
              <span>
                <kbd style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs }}>Enter</kbd>
                {' '}to select
              </span>
              <span>
                <kbd style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs }}>Esc</kbd>
                {' '}to close
              </span>
            </div>
          </div>
        </div>
      </>
    );
  },
});
