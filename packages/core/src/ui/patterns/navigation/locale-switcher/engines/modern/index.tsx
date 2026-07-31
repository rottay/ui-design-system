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

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { LocaleSwitcherProps } from '../../contracts';
import { DEFAULT_LOCALES } from '../../runtime/default-locales';
import { StatusVerifiedIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-verified';
import { NavigationDownIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-down';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/**
 * NOTE (P88): the menu is a pattern-owned listbox because the Dropdown
 * primitive (P88) is BLOCKED_ARCH in the current wave and the Select
 * primitive's option contract does not carry autoglottonym rows with an
 * active-check anatomy. When P88 lands, this panel composes it (precedent:
 * saved-views). The APG keyboard contract below (roving focusIndex,
 * ArrowUp/Down, Enter/Space, Escape, click-outside, aria-activedescendant)
 * is the same one Dropdown certifies, so the swap is mechanical.
 */

/**
 * Modern (token-driven) implementation of the LocaleSwitcher pattern.
 * Uses inline structure plus the unlayered modern skin for paint and states.
 * Implements a custom dropdown with click-outside dismissal and full
 * keyboard navigation (ArrowUp, ArrowDown, Enter, Escape).
 */
export default function ModernLocaleSwitcher(props: LocaleSwitcherProps) {
  // Optional channel with an English floor: the switcher renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key. Locale
  // NAMES are autoglottonyms from the locales prop -- never translated.
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;

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
      const target = items.item(focusIndex) as HTMLElement | null;
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
  /*  Render — geometry and paint live in the modern skin, keyed on    */
  /*  data-part/data-size; nothing structural stays inline.            */
  /* ---------------------------------------------------------------- */
  return (
    <div
      ref={containerRef}
      className={`ds-pattern-locale-switcher ds-engine-modern ${className ?? ''}`}
      data-part="root"
      data-loading={loading ? 'true' : 'false'}
      style={style}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger button */}
      <button
        type="button"
        data-part="trigger"
        data-size={size}
        onClick={() => {
          setOpen(prev => !prev);
          if (!open) setFocusIndex(-1);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={tOr('locale_switcher.trigger_aria', 'Language: {locale}', {
          locale: activeLocale?.label ?? locale,
        })}
        data-testid="locale-switcher-trigger"
      >
        {showFlag && activeLocale?.flag && (
          <span aria-hidden="true" data-part="flag">
            {activeLocale.flag}
          </span>
        )}
        {showLabel && (
          <span>{activeLocale?.label ?? locale}</span>
        )}
        <NavigationDownIcon size={12} decorative />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          ref={menuRef}
          role="listbox"
          data-part="panel"
          aria-activedescendant={focusIndex >= 0 ? `locale-option-${locales[focusIndex].code}` : undefined}
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
                data-part="option"
                data-active={isActive}
                data-focused={isFocused}
                data-locale-option
                data-testid={`locale-option-${loc.code}`}
                onMouseEnter={() => setFocusIndex(idx)}
                onMouseLeave={() => { if (focusIndex === idx) setFocusIndex(-1); }}
                onClick={() => handleSelect(loc.code)}
              >
                {showFlag && loc.flag && (
                  <span aria-hidden="true" data-part="flag">
                    {loc.flag}
                  </span>
                )}
                <span data-part="option-label">{loc.label}</span>
                {isActive && (
                  <span data-part="check">
                    <StatusVerifiedIcon size={14} decorative />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
