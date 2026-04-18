'use client';

/**
 * @fileoverview LocaleSwitcher -- Modern engine (token-driven).
 * Renders a compact dropdown button showing the current locale with
 * optional flag and label. The dropdown menu lists all available
 * locales with a check mark on the active one. Fully keyboard
 * accessible (ArrowUp/Down, Enter, Escape).
 *
 * @example
 * <ModernLocaleSwitcher
 *   locale="en"
 *   onChange={(code) => setLocale(code)}
 * />
 */

import React, { useState, useRef, useEffect, useCallback, type CSSProperties } from 'react';
import type { LocaleSwitcherProps, LocaleDef } from '../LocaleSwitcher.types';
import { DEFAULT_LOCALES } from '../LocaleSwitcher.types';
import { popupPanelStyle, menuItemStyle } from '../../../_internal/engines/modern/styles';

/* ------------------------------------------------------------------ */
/*  Check-mark SVG path for the active locale indicator                */
/* ------------------------------------------------------------------ */
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={14}
    height={14}
    viewBox="0 0 20 20"
    fill="currentColor"
    style={{ color: 'var(--ds-color-primary)', flexShrink: 0 }}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Chevron-down SVG for the trigger button                            */
/* ------------------------------------------------------------------ */
const ChevronIcon = () => (
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
);

/* ------------------------------------------------------------------ */
/*  Trigger button base styles                                         */
/* ------------------------------------------------------------------ */
const triggerBaseStyle: CSSProperties = {
  background: 'transparent',
  color: 'var(--ds-color-text-primary)',
  border: '1px solid var(--ds-color-border-subtle, var(--ds-color-border))',
  borderRadius: 'var(--ds-radius-md)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  fontFamily: 'inherit',
  lineHeight: 1,
  transition: 'border-color 150ms ease-out, background 150ms ease-out',
};

const triggerSmStyle: CSSProperties = {
  ...triggerBaseStyle,
  height: 28,
  padding: '0 8px',
  fontSize: 13,
};

const triggerMdStyle: CSSProperties = {
  ...triggerBaseStyle,
  height: 32,
  padding: '0 10px',
  fontSize: 14,
};

/* ------------------------------------------------------------------ */
/*  Menu item hover style (applied via onMouseEnter / focusIndex)       */
/* ------------------------------------------------------------------ */
const menuItemHoverBg = 'var(--ds-surface-inset, var(--ds-color-neutral-100))';

/**
 * Modern (token-driven) implementation of the LocaleSwitcher pattern.
 * Uses inline styles with DS CSS variables for all visual properties.
 * Implements a custom dropdown with click-outside dismissal and full
 * keyboard navigation (ArrowUp, ArrowDown, Enter, Escape).
 */
export default function ModernLocaleSwitcher(props: LocaleSwitcherProps) {
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

  /* Default showLabel: true for md, false for sm */
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
      className={`ds-pattern-locale-switcher ds-engine-modern ${className ?? ''}`}
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
        <ChevronIcon />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          ref={menuRef}
          role="listbox"
          aria-activedescendant={focusIndex >= 0 ? `locale-option-${locales[focusIndex].code}` : undefined}
          style={{
            ...popupPanelStyle,
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            zIndex: 50,
            minWidth: 180,
            maxHeight: 280,
            overflowY: 'auto',
          }}
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
                  ...menuItemStyle,
                  fontWeight: isActive ? 600 : 400,
                  background: isFocused
                    ? menuItemHoverBg
                    : isActive
                      ? 'var(--ds-surface-inset)'
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
                {isActive && <CheckIcon />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
