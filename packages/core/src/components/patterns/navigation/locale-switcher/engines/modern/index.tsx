'use client';

/**
 * @fileoverview LocaleSwitcher -- Modern engine. Composes the canonical Select
 * (`chrome="none"`, the pattern paints the trigger frame) and contributes only
 * the locale content through Select's render channel: the flag and the
 * autoglottonym, or the BCP-47 code on a label-less trigger. Keyboard, focus,
 * selection, type-ahead and the panel are Select's.
 *
 * @example
 * <ModernLocaleSwitcher
 *   locale="en"
 *   onChange={(code) => setLocale(code)}
 * />
 */

import React, { useMemo } from 'react';
import type { LocaleDef, LocaleSwitcherProps } from '../../contracts';
import { DEFAULT_LOCALES } from '../../runtime/default-locales';
import { AnatomySkeleton } from '../../../../../primitives/feedback/skeleton';
import ModernSelect from '../../../../../primitives/inputs/select/engines/modern';
import type { SelectLabelProps, SelectOption } from '../../../../../primitives/inputs/select/contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

function LocaleContent({
  locale,
  showFlag,
  text,
}: {
  locale: LocaleDef | undefined;
  showFlag: boolean;
  text: React.ReactNode;
}) {
  return (
    // The pattern stamp travels with the content into Select's portaled panel.
    <span data-pattern="locale-switcher" data-part="locale-content">
      {showFlag && locale?.flag && (
        <span aria-hidden="true" data-part="flag">
          {locale.flag}
        </span>
      )}
      {text}
    </span>
  );
}

const autoglottonym = (label: React.ReactNode, labelProps: SelectLabelProps) => (
  <span data-part="autoglottonym" {...labelProps}>
    {label}
  </span>
);

/**
 * Modern (token-driven) implementation of the LocaleSwitcher pattern.
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
  const isLoading = Boolean(loading);

  const byCode = useMemo(() => new Map(locales.map((def) => [def.code, def])), [locales]);
  // The autoglottonym is the option's text source and its own language: `dir` resolves to `auto`.
  const options = useMemo<SelectOption<string>[]>(
    () => locales.map((def) => ({ value: def.code, label: def.label, lang: def.code })),
    [locales],
  );
  const activeLocale = byCode.get(locale);

  const select = (
    <ModernSelect
      chrome="none"
      size={size}
      options={options as SelectOption[]}
      value={locale}
      placeholder={locale}
      onChange={(code) => {
        if (code !== locale) onChange(String(code));
      }}
      aria-label={tOr('locale_switcher.trigger_aria', 'Language: {locale}', {
        locale: activeLocale?.label ?? locale,
      })}
      listboxLabel={tOr('locale_switcher.panel_aria', 'Languages')}
      data-testid="locale-switcher-trigger"
      renderOption={(option, _content, state) => (
        <LocaleContent
          locale={byCode.get(String(option.value))}
          showFlag={showFlag}
          text={autoglottonym(option.label, state.labelProps)}
        />
      )}
      renderValue={(option, _content, state) => (
        <LocaleContent
          locale={byCode.get(String(option.value))}
          showFlag={showFlag}
          // A BCP-47 tag is not text in that language, so the compact code carries no lang.
          text={showLabel ? autoglottonym(option.label, state.labelProps) : <span data-part="code">{option.value}</span>}
        />
      )}
    />
  );

  return (
    <div
      className={`ds-pattern-locale-switcher ds-engine-modern ${className ?? ''}`}
      data-part="root"
      data-pattern="locale-switcher"
      data-loading={loading ? 'true' : 'false'}
      aria-busy={isLoading || undefined}
      style={style}
    >
      {isLoading ? <AnatomySkeleton>{select}</AnatomySkeleton> : select}
    </div>
  );
}
