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

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import type { LocaleSwitcherProps } from '../../contracts';
// Measure before paint so the panel never shows in the overflowing placement.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

/** Reading-direction probe (house idiom): nearest explicit `dir` wins,
    otherwise the document direction applies. */
function isRtlContext(el: HTMLElement): boolean {
  const scoped = el.closest('[dir]');
  if (scoped) return scoped.getAttribute('dir') === 'rtl';
  return document.documentElement.dir === 'rtl';
}
import { DEFAULT_LOCALES } from '../../runtime/default-locales';
import { StatusVerifiedIcon } from '@/graphics/icons/semantic/generated/roles/status-verified';
import { SkeletonButton } from '../../../../../primitives/feedback/skeleton';
import { NavigationDownIcon } from '@/graphics/icons/semantic/generated/roles/navigation-down';
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
  /* 'start' = panel's inline-start edge on the trigger's (the default);
     'end' = flipped so its inline-end edge lands on the trigger's. */
  const [placement, setPlacement] = useState<'start' | 'end'>('start');
  const isLoading = Boolean(loading);
  const isOpen = open && !isLoading;
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Instance-scoped ids: two switchers on one page must not collide, or the
  // trigger's aria-activedescendant resolves to the wrong panel's option.
  const instanceId = useId();
  const listboxId = `${instanceId}-listbox`;
  const optionId = (code: string) => `${instanceId}-option-${code}`;
  const activeDescendantId =
    focusIndex >= 0 && focusIndex < locales.length ? optionId(locales[focusIndex].code) : undefined;

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

  useEffect(() => {
    if (!isLoading) return;
    setOpen(false);
    setFocusIndex(-1);
  }, [isLoading]);

  /* ---------------------------------------------------------------- */
  /*  Keyboard navigation                                              */
  /* ---------------------------------------------------------------- */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isLoading) return;
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
    [open, focusIndex, locales, locale, onChange, isLoading],
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
  /*  Inline-end flip                                                  */
  /*  The panel is anchored on the trigger's inline-start edge and     */
  /*  grows toward the inline-end, so a trigger sitting near that      */
  /*  viewport edge pushes it off-screen. Measure the real panel and   */
  /*  flip only when the opposite anchor genuinely has more room.      */
  /* ---------------------------------------------------------------- */
  useIsomorphicLayoutEffect(() => {
    if (!isOpen) {
      setPlacement('start');
      return;
    }
    const container = containerRef.current;
    const panel = menuRef.current;
    if (!container || !panel) return;

    const resolve = () => {
      const viewport = window.innerWidth || document.documentElement.clientWidth;
      const anchor = container.getBoundingClientRect();
      const panelWidth = panel.getBoundingClientRect().width;
      if (!viewport || panelWidth <= 0) return;
      const rtl = isRtlContext(container);
      const roomFromStartAnchor = rtl ? anchor.right : viewport - anchor.left;
      const roomFromEndAnchor = rtl ? viewport - anchor.left : anchor.right;
      setPlacement(
        panelWidth > roomFromStartAnchor && roomFromEndAnchor > roomFromStartAnchor
          ? 'end'
          : 'start',
      );
    };

    resolve();
    window.addEventListener('resize', resolve);
    return () => window.removeEventListener('resize', resolve);
  }, [isOpen, locales.length]);

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
      aria-busy={isLoading || undefined}
      style={style}
      onKeyDown={handleKeyDown}
    >
      {isLoading ? (
        <SkeletonButton size={size} />
      ) : (
      <button
        type="button"
        data-part="trigger"
        data-size={size}
        onClick={() => {
          setOpen(prev => !prev);
          if (!open) setFocusIndex(-1);
        }}
        // APG select-only combobox: DOM focus never leaves this trigger, so the
        // active option must be pointed at from here — on the panel it is inert.
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={isOpen ? activeDescendantId : undefined}
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
        {showLabel ? (
          /* Autoglottonym: never translated; dir=auto keeps a RTL locale name
             (e.g. العربية) honest inside a LTR chrome, and lang lets screen
             readers pronounce it in its own language. */
          <span data-part="trigger-label" lang={activeLocale?.code ?? locale} dir="auto">
            {activeLocale?.label ?? locale}
          </span>
        ) : (
          /* The compact trigger still carries text: `flag` is optional on
             LocaleDef and is aria-hidden, so the label-less variant would
             otherwise render as a bare chevron. */
          <span data-part="trigger-code">{activeLocale?.code ?? locale}</span>
        )}
        <NavigationDownIcon size={12} decorative />
      </button>
      )}

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={menuRef}
          id={listboxId}
          role="listbox"
          data-part="panel"
          data-placement={placement}
          aria-label={tOr('locale_switcher.panel_aria', 'Languages')}
          data-testid="locale-switcher-menu"
          /* Pointer selection must not blur the trigger: it owns DOM focus for
             the whole widget, and a mousedown default would drop it to body. */
          onMouseDown={(e) => e.preventDefault()}
        >
          {locales.map((loc, idx) => {
            const isActive = loc.code === locale;
            const isFocused = idx === focusIndex;

            return (
              /* A native control, but never a tab stop: the trigger owns DOM
                 focus and activedescendant marks the active row. */
              <button
                key={loc.code}
                id={optionId(loc.code)}
                type="button"
                tabIndex={-1}
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
                <span data-part="option-label" lang={loc.code} dir="auto">{loc.label}</span>
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
