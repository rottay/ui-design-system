'use client';

/**
 * @fileoverview LocaleSwitcher -- Rustic engine (Vanilla / CSS variables).
 * Renders a locale dropdown using only inline styles with --ds-* design
 * tokens. No CSS framework dependency. Supports flag + label display,
 * size variants, full keyboard navigation, and click-outside dismissal.
 *
 * @example
 * <RusticLocaleSwitcher
 *   locale="en"
 *   onChange={(code) => setLocale(code)}
 * />
 */

import React, { useState, useRef, useEffect, useCallback, type CSSProperties } from 'react';
import type { LocaleSwitcherProps, LocaleDef } from '../LocaleSwitcher.types';
import { DEFAULT_LOCALES } from '../LocaleSwitcher.types';

/* ------------------------------------------------------------------ */
/*  Inline style constants using DS tokens                             */
/* ------------------------------------------------------------------ */

const triggerBaseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  background: 'transparent',
  color: 'var(--ds-color-text-primary, #1a1a1a)',
  border: '1px solid var(--ds-color-border-subtle, var(--ds-color-border, #d9d9d9))',
  borderRadius: 'var(--ds-radius-md, 6px)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  lineHeight: 1,
  transition: 'border-color 150ms ease-out, background 150ms ease-out',
};

const triggerSmStyle: CSSProperties = {
  ...triggerBaseStyle,
  height: 28,
  padding: '0 8px',
  fontSize: 'var(--ds-font-size-sm, 13px)',
};

const triggerMdStyle: CSSProperties = {
  ...triggerBaseStyle,
  height: 32,
  padding: '0 10px',
  fontSize: 'var(--ds-font-size-md, 14px)',
};

const dropdownStyle: CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  marginTop: 4,
  zIndex: 50,
  minWidth: 180,
  maxHeight: 280,
  overflowY: 'auto',
  background: 'var(--ds-surface-card, #fff)',
  border: '1px solid var(--ds-color-border-subtle, var(--ds-color-border, #d9d9d9))',
  borderRadius: 'var(--ds-radius-lg, 8px)',
  boxShadow: 'var(--ds-elevation-2, 0 4px 12px rgba(0,0,0,0.12))',
  padding: 4,
};

const menuItemBaseStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  borderRadius: 'var(--ds-radius-md, 6px)',
  fontSize: 'var(--ds-font-size-md, 14px)',
  cursor: 'pointer',
  transition: 'background 150ms ease-out',
  color: 'var(--ds-color-text-primary, #1a1a1a)',
  background: 'transparent',
  border: 'none',
  width: '100%',
  textAlign: 'left' as const,
  fontFamily: 'inherit',
  lineHeight: '20px',
};

/**
 * Rustic (vanilla CSS variables) implementation of the LocaleSwitcher pattern.
 * Uses only inline styles with --ds-* design tokens. Implements a custom
 * dropdown with click-outside dismissal and keyboard navigation.
 */
export default function RusticLocaleSwitcher(props: LocaleSwitcherProps) {
  const {
    locale,
    onChange,
    locales = DEFAULT_LOCALES,
    size = 'md',
    showFlag = true,
    showLabel: showLabelProp,
    loading,
    className,
    style,
  } = props;

  const showLabel = showLabelProp ?? (size === 'md');

  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeLocale = locales.find(l => l.code === locale);

  /* ---------------------------------------------------------------- */
  /*  Click-outside handler                                            */
  /* ---------------------------------------------------------------- */
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusIndex(-1);
      }
    },
    [],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClickOutside]);

  /* ---------------------------------------------------------------- */
  /*  Keyboard navigation                                              */
  /* ---------------------------------------------------------------- */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpen(true);
          setFocusIndex(0);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusIndex(prev => (prev + 1) % locales.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusIndex(prev => (prev - 1 + locales.length) % locales.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusIndex >= 0 && focusIndex < locales.length) {
            const selected = locales[focusIndex];
            if (selected.code !== locale) {
              onChange(selected.code);
            }
            setOpen(false);
            setFocusIndex(-1);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          setFocusIndex(-1);
          break;
        case 'Tab':
          setOpen(false);
          setFocusIndex(-1);
          break;
      }
    },
    [open, focusIndex, locales, locale, onChange],
  );

  /* ---------------------------------------------------------------- */
  /*  Scroll focused item into view                                    */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (open && focusIndex >= 0 && menuRef.current) {
      const items = menuRef.current.querySelectorAll('[data-locale-option]');
      const target = items[focusIndex] as HTMLElement | undefined;
      target?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [open, focusIndex]);

  /* ---------------------------------------------------------------- */
  /*  Select handler                                                   */
  /* ---------------------------------------------------------------- */
  const handleSelect = useCallback(
    (localeCode: string) => {
      if (localeCode !== locale) {
        onChange(localeCode);
      }
      setOpen(false);
      setFocusIndex(-1);
    },
    [locale, onChange],
  );

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  const triggerStyle = size === 'sm' ? triggerSmStyle : triggerMdStyle;

  return (
    <div
      ref={containerRef}
      className={`ds-pattern-locale-switcher ds-engine-rustic ${className ?? ''}`}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger button */}
      <button
        type="button"
        style={triggerStyle}
        onClick={() => {
          setOpen(prev => !prev);
          if (!open) setFocusIndex(-1);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${activeLocale?.label ?? locale}`}
        data-testid="locale-switcher-trigger"
      >
        {showFlag && activeLocale?.flag && (
          <span aria-hidden="true" style={{ fontSize: size === 'sm' ? 14 : 16, lineHeight: 1 }}>
            {activeLocale.flag}
          </span>
        )}
        {showLabel && (
          <span>{activeLocale?.label ?? locale}</span>
        )}
        {/* Chevron down */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={12}
          height={12}
          viewBox="0 0 20 20"
          fill="currentColor"
          style={{ opacity: 0.5, flexShrink: 0 }}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          ref={menuRef}
          role="listbox"
          aria-activedescendant={focusIndex >= 0 ? `locale-option-${locales[focusIndex].code}` : undefined}
          style={dropdownStyle}
          data-testid="locale-switcher-menu"
        >
          {locales.map((loc, idx) => {
            const isActive = loc.code === locale;
            const isFocused = idx === focusIndex;

            return (
              <button
                key={loc.code}
                id={`locale-option-${loc.code}`}
                type="button"
                role="option"
                aria-selected={isActive}
                data-locale-option
                data-testid={`locale-option-${loc.code}`}
                style={{
                  ...menuItemBaseStyle,
                  fontWeight: isActive ? 600 : 400,
                  background: isFocused
                    ? 'var(--ds-surface-inset, var(--ds-color-neutral-100, #f5f5f5))'
                    : isActive
                      ? 'var(--ds-surface-inset, var(--ds-color-neutral-100, #f5f5f5))'
                      : 'transparent',
                }}
                onMouseEnter={() => setFocusIndex(idx)}
                onMouseLeave={() => { if (focusIndex === idx) setFocusIndex(-1); }}
                onClick={() => handleSelect(loc.code)}
              >
                {showFlag && loc.flag && (
                  <span aria-hidden="true" style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>
                    {loc.flag}
                  </span>
                )}
                <span style={{ flex: 1 }}>{loc.label}</span>
                {isActive && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={14}
                    height={14}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    style={{ color: 'var(--ds-color-primary, #1677ff)', flexShrink: 0 }}
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
