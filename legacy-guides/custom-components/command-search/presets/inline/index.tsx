'use client';

/**
 * CommandSearch - Inline Preset
 * Inline search bar with dropdown results panel, quick actions, and recent searches
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { CommandSearchProps } from '../../core';
import { COMMAND_SEARCH_DEFAULTS } from '../../core';
import {
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
} from '../../../helpers';

export const InlineCommandSearch = createPreset<CommandSearchProps>({
  name: 'CommandSearch.Inline',
  render: ({ primitives, props, tokens, engine }: PresetContext<CommandSearchProps>) => {
    const { Box } = primitives;
    const {
      placeholder = COMMAND_SEARCH_DEFAULTS.placeholder,
      results: rawResults = [],
      categories: rawCategories = [],
      quickActions: rawQuickActions = [],
      recentSearches: rawRecentSearches = [],
      onSearch,
      onSelect,
      onRecentSelect,
      onClearRecent,
      loading,
      maxResults = COMMAND_SEARCH_DEFAULTS.maxResults,
      className,
      style,
    } = props;

    const results = Array.isArray(rawResults) ? rawResults : [];
    const categories = Array.isArray(rawCategories) ? rawCategories : [];
    const quickActions = Array.isArray(rawQuickActions) ? rawQuickActions : [];
    const recentSearches = Array.isArray(rawRecentSearches) ? rawRecentSearches : [];

    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const showDropdown = isFocused && (query.length > 0 || quickActions.length > 0 || recentSearches.length > 0);

    // Close on click outside
    useEffect(() => {
      if (!showDropdown) return;
      const handler = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsFocused(false);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [showDropdown]);

    const handleQueryChange = useCallback((value: string) => {
      setQuery(value);
      setHighlightedIndex(-1);
      onSearch?.(value);
    }, [onSearch]);

    const displayResults = results.slice(0, maxResults);

    const getStatusColor = (color?: string) => {
      switch (color) {
        case 'success': return { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700] };
        case 'warning': return { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700] };
        case 'error': return { bg: tokens.colors.errorScale[100], text: tokens.colors.errorScale[700] };
        case 'info': return { bg: tokens.colors.infoScale[100], text: tokens.colors.infoScale[700] };
        default: return { bg: tokens.colors.neutral[100], text: tokens.colors.neutral[600] };
      }
    };

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(prev + 1, displayResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && highlightedIndex >= 0 && displayResults[highlightedIndex]) {
        onSelect?.(displayResults[highlightedIndex]);
        setIsFocused(false);
      } else if (e.key === 'Escape') {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    }, [displayResults, highlightedIndex, onSelect]);

    return (
      <div ref={containerRef} className={className} style={{ position: 'relative', ...style }}>
        {/* Search input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isFocused ? tokens.colors.primaryScale[400] : tokens.colors.neutral[300]}`,
          borderRadius: tokens.borderRadius.lg,
          backgroundColor: tokens.colors.common.white,
          transition: `border-color ${tokens.transitions?.fast || tokens.motion.hover}`,
          boxShadow: isFocused ? `0 0 0 3px ${tokens.colors.primaryScale[100]}` : 'none',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: tokens.colors.neutral[400] }}>
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={(e) => {
              setIsFocused(true);
              e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
              e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[900],
              backgroundColor: 'transparent',
              fontFamily: 'inherit',
            }}
          
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = tokens.colors.neutral[300];
            }}
          />
          {loading && (
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], flexShrink: 0 }}>...</span>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: tokens.spacing[1],
            backgroundColor: tokens.colors.common.white,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            borderRadius: tokens.borderRadius.lg,
            boxShadow: tokens.shadows.lg,
            zIndex: 50,
            overflow: 'hidden',
            ...(tokens.surface.useGlass && tokens.glass ? {
              backdropFilter: tokens.glass.blur,
              WebkitBackdropFilter: tokens.glass.blur,
              backgroundColor: tokens.glass.bg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
            } : {}),
          }}>
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {/* Results */}
              {query && displayResults.length > 0 && (
                <div style={{ padding: `${tokens.spacing[1]}px 0` }}>
                  {displayResults.map((result, i) => {
                    const isHighlighted = i === highlightedIndex;
                    const statusC = getStatusColor(result.statusColor);
                    return (
                      <button
                        key={result.id}
                        onClick={() => { onSelect?.(result); setIsFocused(false); }}
                        onMouseEnter={() => setHighlightedIndex(i)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[3],
                          width: '100%',
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
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
                          {result.description && (
                            <span style={{ color: tokens.colors.neutral[400], marginLeft: tokens.spacing[2], fontSize: tokens.typography.fontSize.xs }}>
                              {result.description}
                            </span>
                          )}
                        </span>
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
              )}

              {/* No results */}
              {query && displayResults.length === 0 && !loading && (
                <div style={{
                  padding: `${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
                  textAlign: 'center',
                  color: tokens.colors.neutral[400],
                  fontSize: tokens.typography.fontSize.sm,
                }}>
                  No results found
                </div>
              )}

              {/* Quick actions (when no query) */}
              {!query && quickActions.length > 0 && (
                <div style={{ padding: `${tokens.spacing[1]}px 0` }}>
                  {quickActions.map((action) => (
                    <button
                      key={action.key}
                      onClick={() => { action.onClick?.(); setIsFocused(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[3],
                        width: '100%',
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
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

              {/* Recent searches */}
              {!query && recentSearches.length > 0 && (
                <div style={{ borderTop: quickActions.length > 0 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none', padding: `${tokens.spacing[1]}px 0` }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  }}>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[400], textTransform: 'uppercase' as const }}>Recent</span>
                    {onClearRecent && (
                      <button onClick={onClearRecent} style={{ border: 'none', background: 'none', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Clear</button>
                    )}
                  </div>
                  {recentSearches.map((search, i) => (
                    <button
                      key={i}
                      onClick={() => { onRecentSelect?.(search); handleQueryChange(search); setIsFocused(true); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        width: '100%',
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
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
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: tokens.colors.neutral[400] }}>
                        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 4.5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      {search}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
});
