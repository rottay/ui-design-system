/**
 * @fileoverview PatternBrandStudio — bounded BrandTheme editor with a live,
 * dual-ground preview and inline WCAG contrast validation.
 *
 * The editor exposes only the bounded BrandTheme fields (palette, typography,
 * surfaces, motion, chrome). The preview compiles the in-flight theme with
 * `compileBrandTheme` and injects the FULL resulting `cssVariables` map into two
 * scoped containers — one dark ground, one light ground — via a `<style>` block
 * keyed to a per-panel class, declared directly on that class (not on `<html>`,
 * where the host page's own tenant/theme/dir attributes are anchored).
 *
 * A value declared directly on the scoped class always wins over an inherited
 * one, regardless of the host page's selector specificity — but a component
 * whose chrome var (e.g. `--ds-button-primary-bg`) is not declared in the
 * compiled map at all still inherits the host page's own tenant CSS for that
 * var, bypassing the component's own `var(--x, var(--ds-color-primary))`
 * fallback. `buildSurfaceVariables` closes that gap for the small set of chrome
 * vars whose fallback chain already names `--ds-color-primary`: see
 * `PRIMARY_CHROME_FALLBACK`.
 *
 * @module Patterns/Customization/BrandStudio
 * @category Patterns/Customization
 * @package @rottay/design-system
 */

'use client';

import React, { useCallback, useId, useMemo, useState } from 'react';

import { arrayValueAt } from '@/foundation/kernel/collections';
import { Badge, Box, Button, Card, Flex, Heading, Input, Select, Stack, Text } from '../../../primitives';
import { compileBrandTheme } from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import { validateBrandingContrast, type BrandingColors } from '@/foundation/kernel/accessibility/branding-contrast';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import type {
  BrandChrome,
  BrandControlsChrome,
  BrandPalette,
  BrandSurfaces,
  BrandTheme,
} from '../../../../foundation/contracts/composition/tenants/themes';
import { cloneBrandTheme } from './runtime/file-export';
import { useTenantThemePreview } from './runtime/tenant-theme-preview';
import { TenantThemePreviewReport } from './runtime/tenant-theme-preview/report';
import type {
  BrandStudioContrastReport,
  BrandStudioSurfaceConfig,
  BrandStudioSurfaceKey,
  BrandStudioTenantThemePreviewConfig,
  PatternBrandStudioProps,
} from './contracts';

export * from './contracts';
export {
  cloneBrandTheme,
  serializeBrandTheme,
  deserializeBrandTheme,
  brandThemeToTenantAppearance,
  brandThemeToTenantAppearanceAdvanced,
} from './runtime/file-export';
export {
  useTenantThemePreview,
  compileTenantThemePreview,
  buildTenantThemePreviewScope,
  probeTenantThemePackWarnings,
  selectTenantThemeAdjustments,
  PREVIEW_SCOPE_ATTRIBUTE,
  DEFAULT_TENANT_THEME_PREVIEW_DEBOUNCE_MS,
} from './runtime/tenant-theme-preview';
export type {
  UseTenantThemePreviewInput,
  UseTenantThemePreviewResult,
  TenantThemePreviewScope,
  TenantThemeContrastAdjustment,
  TenantThemePackWarning,
  ProbeTenantThemePackWarningsOptions,
} from './runtime/tenant-theme-preview';
export { TenantThemePreviewReport } from './runtime/tenant-theme-preview/report';
export type { TenantThemePreviewReportProps } from './runtime/tenant-theme-preview/report';

// ---------------------------------------------------------------------------
// Base ground token scaffolds
//
// The brand compiler emits only the overrides a theme sets, so a preview panel
// must supply the neutral background/text/border/surface tokens the real
// components read. These grounds are generic slate neutrals with no product
// vocabulary; a consumer may override them per surface.
// ---------------------------------------------------------------------------

const SEMANTIC_GROUND: Record<string, string> = {
  '--ds-color-success': '#16a34a',
  '--ds-color-success-bg': 'rgba(22, 163, 74, 0.12)',
  '--ds-color-warning': '#d97706',
  '--ds-color-warning-bg': 'rgba(217, 119, 6, 0.12)',
  '--ds-color-error': '#dc2626',
  '--ds-color-error-bg': 'rgba(220, 38, 38, 0.12)',
  '--ds-color-info': '#2563eb',
  '--ds-color-info-bg': 'rgba(37, 99, 235, 0.12)',
};

/**
 * Chrome vars whose OWN component fallback chain already names
 * `--ds-color-primary` as the neutral default: Button's primary fill/border
 * (`engines/modern.tsx` VARIANT_STYLES.primary), the active tab indicator
 * (`Tabs/engines/modern.tsx`), and the input focus border (`Input/engines/
 * modern.tsx`). The first-party bundled tenants set these concretely in their
 * generated CSS artifacts (e.g. rottay's monochrome chrome does not derive
 * from a hue at all), and a showroom page that hosts this preview loads one of
 * those artifacts ambiently on `<html>`. Since the scoped preview class only
 * declares the vars the compiled theme actually emits, an unset one is
 * inherited from that ambient tenant instead of reaching the component's own
 * fallback. Declaring these here as `var(--ds-color-primary)` aliases reopens
 * each component's own designed fallback within the preview's scope. A theme
 * that sets the matching `chrome.controls.*`/`chrome.tabs.*` field explicitly
 * still wins, because compiled vars are spread after these ground vars.
 */
const PRIMARY_CHROME_FALLBACK: Record<string, string> = {
  '--ds-button-primary-bg': 'var(--ds-color-primary)',
  '--ds-button-primary-bg-hover': 'var(--ds-color-primary)',
  '--ds-button-primary-border': 'var(--ds-color-primary)',
  '--ds-tab-border-active': 'var(--ds-color-primary)',
  '--ds-input-border-focus': 'var(--ds-color-primary)',
};

export const DEFAULT_DARK_GROUND: Record<string, string> = {
  '--ds-color-bg-primary': '#0b0f1a',
  '--ds-color-bg-secondary': '#111726',
  '--ds-color-bg-surface': '#131a2b',
  '--ds-color-bg-elevated': '#151d30',
  '--ds-color-bg-overlay': '#0e1422',
  '--ds-color-text': '#f8fafc',
  '--ds-color-text-primary': '#f8fafc',
  '--ds-color-text-secondary': '#cbd5e1',
  '--ds-color-text-muted': '#94a3b8',
  '--ds-color-text-disabled': '#64748b',
  '--ds-color-border': '#243049',
  '--ds-color-border-secondary': '#1b2438',
  '--ds-color-surface': '#131a2b',
  ...SEMANTIC_GROUND,
  ...PRIMARY_CHROME_FALLBACK,
};

export const DEFAULT_LIGHT_GROUND: Record<string, string> = {
  '--ds-color-bg-primary': '#ffffff',
  '--ds-color-bg-secondary': '#f8fafc',
  '--ds-color-bg-surface': '#f1f5f9',
  '--ds-color-bg-elevated': '#ffffff',
  '--ds-color-bg-overlay': '#ffffff',
  '--ds-color-text': '#0f172a',
  '--ds-color-text-primary': '#0f172a',
  '--ds-color-text-secondary': '#334155',
  '--ds-color-text-muted': '#64748b',
  '--ds-color-text-disabled': '#94a3b8',
  '--ds-color-border': '#e2e8f0',
  '--ds-color-border-secondary': '#eef2f6',
  '--ds-color-surface': '#f8fafc',
  ...SEMANTIC_GROUND,
  ...PRIMARY_CHROME_FALLBACK,
};

const DEFAULT_DARK_SURFACE: BrandStudioSurfaceConfig = {
  key: 'dark',
  baseTheme: 'dark',
  tenantSlug: 'brand-studio-dark',
  label: 'Dark surface',
  groundVars: DEFAULT_DARK_GROUND,
};

const DEFAULT_LIGHT_SURFACE: BrandStudioSurfaceConfig = {
  key: 'light',
  baseTheme: 'light',
  tenantSlug: 'brand-studio-light',
  label: 'Light surface',
  groundVars: DEFAULT_LIGHT_GROUND,
};

function resolveSurface(
  base: BrandStudioSurfaceConfig,
  override: Partial<BrandStudioSurfaceConfig> | undefined
): BrandStudioSurfaceConfig {
  if (!override) return base;
  return {
    ...base,
    ...override,
    key: base.key,
    groundVars: override.groundVars ?? base.groundVars,
  };
}

// ---------------------------------------------------------------------------
// Contrast derivation (pure, exported for tests)
// ---------------------------------------------------------------------------

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function isHex(value: string | undefined): value is string {
  return typeof value === 'string' && HEX_RE.test(value.trim());
}

/** First hex value among the candidate keys, or undefined. */
function pickHex(vars: Record<string, string>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = vars[key];
    if (isHex(value)) return value.trim();
  }
  return undefined;
}

/**
 * Map a compiled + grounded `--ds-*` variable set to WCAG {@link BrandingColors}.
 *
 * `primary`/`background` read the merged `vars` unconditionally: `primary` is a
 * required BrandTheme field (always compiled) and `background` intentionally
 * falls through to the neutral ground when the theme does not target a
 * specific dark background.
 *
 * `text`/`textMuted`/`surfaceCard` are different: their first candidate in each
 * list is a theme-authored chrome var (`--ds-card-color` etc.) and the rest are
 * ground-scaffold fallbacks. When `declaredKeys` is supplied, a ground-only
 * fallback is not honored for these three slots — the pair is reported as not
 * declared (`undefined`, which `validateBrandingContrast` skips) instead of
 * silently grading the studio's own neutral scaffold as if it were the theme's
 * pairing. `declaredKeys` is optional so the original two-argument call shape
 * (used directly in tests below) keeps its original fallthrough behavior.
 *
 * Only hex values are kept either way — `color-mix()`, `rgb()`, and `var()`
 * values are skipped exactly as the validator skips them, so no pair is scored
 * against an unresolvable value.
 */
export function deriveBrandingColors(
  vars: Record<string, string>,
  surface: BrandStudioSurfaceKey,
  declaredKeys?: ReadonlySet<string>
): BrandingColors {
  const backgroundKeys =
    surface === 'dark' ? ['--ds-color-dark-bg', '--ds-color-bg-primary'] : ['--ds-color-bg-primary'];

  const pickDeclared = (keys: string[]): string | undefined => {
    for (const key of keys) {
      if (declaredKeys && !declaredKeys.has(key)) continue;
      const value = vars[key];
      if (isHex(value)) return value.trim();
    }
    return undefined;
  };

  return {
    primary: pickHex(vars, ['--ds-color-primary']) ?? '',
    background: pickHex(vars, backgroundKeys) ?? '',
    text: pickDeclared(['--ds-card-color', '--ds-color-text', '--ds-color-text-primary']),
    textMuted: pickDeclared(['--ds-card-color-muted', '--ds-color-text-muted']),
    surfaceCard: pickDeclared(['--ds-card-bg', '--ds-color-surface', '--ds-color-bg-elevated']),
  };
}

/**
 * Dark-mode palette overrides for the dark preview ground.
 *
 * `compileBrandTheme` does not branch on `baseTheme` (see
 * `infrastructure/compilers/kernel/runtime/brand-theme`): it always sources `--ds-color-primary`/
 * `--ds-color-bg-primary` from the theme's single `primaryColor`/background
 * fields, so `palette.darkPrimaryColor`/`palette.darkBackgroundColor` have no
 * effect on the compiled map. Those two fields exist specifically to override
 * the primary/background role on a dark ground, so the dark preview applies
 * them after compilation, scoped to the dark surface only. A theme that leaves
 * them unset falls through to the already-compiled value unchanged, and the
 * light surface is never touched.
 */
function applyDarkPaletteOverrides(
  vars: Record<string, string>,
  theme: BrandTheme,
  surfaceKey: BrandStudioSurfaceKey
): Record<string, string> {
  if (surfaceKey !== 'dark') return vars;
  const darkPrimary = theme.palette?.darkPrimaryColor;
  const darkBackground = theme.palette?.darkBackgroundColor;
  if (!darkPrimary && !darkBackground) return vars;
  return {
    ...vars,
    ...(darkPrimary ? { '--ds-color-primary': darkPrimary } : {}),
    ...(darkBackground ? { '--ds-color-bg-primary': darkBackground } : {}),
  };
}

/** `buildSurfaceVariables` result: the merged map plus which keys the compiled theme itself declared. */
export interface SurfaceVariables {
  /** Ground scaffold, then the compiled theme, then dark-only palette overrides — merged in that order. */
  vars: Record<string, string>;
  /** Keys `compileBrandTheme` itself emitted for this theme (excludes ground-scaffold-only keys). */
  declaredKeys: ReadonlySet<string>;
}

/**
 * Compile `theme` against one preview ground and merge the result. Shared by
 * the live preview panel and the contrast evaluator so both render/grade the
 * exact same variable set — this is also the single place that answers "what
 * does the preview inject," and is exported so a test can assert on it
 * directly instead of only through rendered DOM output.
 */
export function buildSurfaceVariables(theme: BrandTheme, surface: BrandStudioSurfaceConfig): SurfaceVariables {
  const compiled = compileBrandTheme({
    brandTheme: theme,
    tenantSlug: surface.tenantSlug,
    baseTheme: surface.baseTheme,
  });
  const declaredKeys = new Set(Object.keys(compiled.cssVariables));
  const merged = { ...(surface.groundVars ?? {}), ...compiled.cssVariables };
  const vars = applyDarkPaletteOverrides(merged, theme, surface.key);
  return { vars, declaredKeys };
}

/**
 * Compile a BrandTheme against one preview ground and validate the derived
 * colors. This is the exact evaluation the component runs on every edit.
 */
export function evaluateBrandThemeContrast(
  theme: BrandTheme,
  surface: BrandStudioSurfaceConfig
): BrandStudioContrastReport {
  const { vars, declaredKeys } = buildSurfaceVariables(theme, surface);
  const colors = deriveBrandingColors(vars, surface.key, declaredKeys);
  const { valid, violations, suggestions } = validateBrandingContrast(colors);
  return { surface: surface.key, colors, valid, violations, suggestions };
}

/**
 * Overlay deliberately extreme values on a theme for the hostile-input check.
 * The color values guarantee failing color pairs on both grounds; the radius/
 * motion values are extreme for the visual preview only and are never contrast
 * scored (the validator has no font or radius notion).
 */
export function applyHostileBrandTheme(theme: BrandTheme): BrandTheme {
  const draft = cloneBrandTheme(theme);
  draft.palette = {
    ...(draft.palette ?? {}),
    primaryColor: '#f4f4f4',
    darkBackgroundColor: '#f7f7f7',
  };
  draft.chrome = { ...(draft.chrome ?? {}) };
  draft.chrome.cardComponent = {
    ...(draft.chrome.cardComponent ?? {}),
    bg: '#ffffff',
    color: '#fbfbfb',
    colorMuted: '#fcfcfc',
  };
  draft.surfaces = {
    ...(draft.surfaces ?? {}),
    borderRadius: { sm: '40px', md: '48px', lg: '64px', xl: '80px' },
    effectIntensity: 3,
  };
  draft.motion = {
    ...(draft.motion ?? {}),
    entranceDuration: 4000,
    hoverScale: 3,
  };
  return draft;
}

/** Ensure required id/name so a partial value satisfies the BrandTheme contract. */
export function normalizeBrandTheme(value: BrandTheme | Partial<BrandTheme>): BrandTheme {
  return {
    ...value,
    id: value.id ?? 'brand-studio-draft',
    name: value.name ?? 'Brand Studio Draft',
  } as BrandTheme;
}

// ---------------------------------------------------------------------------
// Editor field controls
//
// Chrome copy resolves through the optional `components` i18n channel with an
// English floor (the studio renders standalone without a provider and never
// echoes a raw key). ALL geometry is skin-owned
// (`presentation/components/skin/brand-studio.css`); inline `style` survives
// only for genuine runtime data (the live swatch background).
// ---------------------------------------------------------------------------

/** Floor-resolving translator for the studio's own chrome copy. */
type BrandStudioTranslator = (key: string, floor: string, params?: Record<string, string | number>) => string;

function useBrandStudioCopy(): BrandStudioTranslator {
  const i18n = useOptionalTranslation('components');
  return (key, floor, params) => i18n?.tOr(key, floor, params) ?? floor;
}

function FieldLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <Text
      className="ds-pattern-brand-studio__field-label"
      data-part="field-label"
      size="xs"
      weight="semibold"
    >
      {children}
    </Text>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
}): React.ReactElement {
  return (
    <Box className="ds-pattern-brand-studio__field" data-part="field">
      <FieldLabel>{label}</FieldLabel>
      <Flex gap={8} align="center">
        <Box
          aria-hidden
          className="ds-pattern-brand-studio__color-swatch"
          data-part="color-swatch"
          style={{
            // Runtime data: the live value preview (the whole point of the
            // swatch). Geometry/frame are skin-owned.
            background: isHex(value) ? value : 'transparent',
          }}
        />
        <Input
          className="ds-pattern-brand-studio__field-input"
          data-part="field-input"
          value={value ?? ''}
          placeholder="#000000"
          /* the visible FieldLabel is not programmatically associated; the
             control still needs an accessible name */
          aria-label={label}
          onChange={(next) => onChange(next)}
        />
      </Flex>
    </Box>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string | undefined;
  placeholder?: string;
  onChange: (value: string) => void;
}): React.ReactElement {
  return (
    <Box className="ds-pattern-brand-studio__field" data-part="field">
      <FieldLabel>{label}</FieldLabel>
      <Input
        className="ds-pattern-brand-studio__field-input"
        data-part="field-input"
        value={value ?? ''}
        placeholder={placeholder}
        aria-label={label}
        onChange={(next) => onChange(next)}
      />
    </Box>
  );
}

function NumberField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: number | undefined;
  placeholder?: string;
  onChange: (value: number | undefined) => void;
}): React.ReactElement {
  return (
    <Box className="ds-pattern-brand-studio__field" data-part="field">
      <FieldLabel>{label}</FieldLabel>
      <Input
        className="ds-pattern-brand-studio__field-input"
        data-part="field-input"
        value={value == null ? '' : String(value)}
        placeholder={placeholder}
        aria-label={label}
        onChange={(next) => {
          const trimmed = next.trim();
          if (trimmed === '') {
            onChange(undefined);
            return;
          }
          const parsed = Number(trimmed);
          onChange(Number.isNaN(parsed) ? undefined : parsed);
        }}
      />
    </Box>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  inheritPlaceholder,
}: {
  label: string;
  value: T | undefined;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  inheritPlaceholder: string;
}): React.ReactElement {
  return (
    <Box className="ds-pattern-brand-studio__field" data-part="field">
      <FieldLabel>{label}</FieldLabel>
      <Select
        className="ds-pattern-brand-studio__field-input"
        data-part="field-input"
        value={value}
        options={options}
        placeholder={inheritPlaceholder}
        aria-label={label}
        onChange={(next) => onChange(next as T)}
      />
    </Box>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement {
  return (
    <Box
      className="ds-pattern-brand-studio__section"
      data-part="section"
    >
      <Stack spacing="sm">
        <Text className="ds-pattern-brand-studio__section-title" data-part="section-title" size="sm" weight="semibold">
          {title}
        </Text>
        <Box className="ds-pattern-brand-studio__editor-grid" data-part="editor-grid">{children}</Box>
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Inline contrast report
// ---------------------------------------------------------------------------

function ContrastReportView({ report }: { report: BrandStudioContrastReport }): React.ReactElement {
  const t = useBrandStudioCopy();
  return (
    <Box
      className="ds-pattern-brand-studio__contrast-summary"
      data-part="contrast-summary"
      data-ground={report.surface}
      data-state={report.valid ? 'pass' : 'fail'}
    >
      <Flex
        className="ds-pattern-brand-studio__contrast-row"
        data-part="contrast-row"
        align="center"
        justify="between"
        gap={8}
        wrap="wrap"
      >
        <Text
          className="ds-pattern-brand-studio__contrast-label"
          data-part="contrast-label"
          size="xs"
          weight="semibold"
        >
          {report.surface === 'dark'
            ? t('brandStudio.contrast.titleDark', 'Dark ground contrast')
            : t('brandStudio.contrast.titleLight', 'Light ground contrast')}
        </Text>
        <Badge
          className="ds-pattern-brand-studio__contrast-state"
          data-state={report.valid ? 'pass' : 'fail'}
          variant={report.valid ? 'success' : 'error'}
        >
          {report.valid
            ? t('brandStudio.contrast.pass', 'WCAG AA clean')
            : t('brandStudio.contrast.failing', '{count} failing', { count: report.violations.length })}
        </Badge>
      </Flex>
      {report.violations.length === 0 ? (
        <Text
          className="ds-pattern-brand-studio__contrast-message"
          data-part="contrast-message"
          size="xs"
        >
          {t('brandStudio.contrast.allPass', 'Every checkable color pair meets its required ratio.')}
        </Text>
      ) : (
        <Stack className="ds-pattern-brand-studio__violations" data-part="violations" spacing="xs">
          {report.violations.map((violation) => {
            const suggestion = report.suggestions.find((entry) => entry.pair === violation.pair);
            return (
              <Box
                key={violation.pair}
                className="ds-pattern-brand-studio__violation"
                data-part="violation"
                data-severity="error"
              >
                <Flex
                  className="ds-pattern-brand-studio__contrast-row"
                  data-part="contrast-row"
                  align="center"
                  justify="between"
                  gap={8}
                  wrap="wrap"
                >
                  <Text size="xs" weight="semibold" className="ds-pattern-brand-studio__violation-pair" data-part="violation-pair">
                    {violation.pair}
                  </Text>
                  <Text
                    className="ds-pattern-brand-studio__violation-ratio"
                    data-part="violation-ratio"
                    size="xs"
                  >
                    {t('brandStudio.violation.ratio', '{ratio} : 1 · needs {required} : 1 ({level})', {
                      ratio: violation.ratio.toFixed(2),
                      required: violation.required,
                      level: violation.level,
                    })}
                  </Text>
                </Flex>
                <Text
                  className="ds-pattern-brand-studio__violation-detail"
                  data-part="violation-detail"
                  size="xs"
                >
                  {suggestion
                    ? t('brandStudio.violation.detailSuggestion', '{foreground} on {ground} — try {suggestion} ({ratio} : 1)', {
                        foreground: violation.foreground,
                        ground: violation.background,
                        suggestion: suggestion.suggestedColor,
                        ratio: suggestion.newRatio.toFixed(2),
                      })
                    : t('brandStudio.violation.detail', '{foreground} on {ground}', {
                        foreground: violation.foreground,
                        ground: violation.background,
                      })}
                </Text>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Live preview panel
// ---------------------------------------------------------------------------

function PreviewPanel({
  theme,
  surface,
  scopeSalt,
  galleries,
  report,
}: {
  theme: BrandTheme;
  surface: BrandStudioSurfaceConfig;
  scopeSalt: string;
  galleries: PatternBrandStudioProps['galleries'];
  report: BrandStudioContrastReport;
}): React.ReactElement {
  const t = useBrandStudioCopy();
  const scopeClass = `brand-studio-${surface.key}-${scopeSalt}`;

  const mergedVars = useMemo(() => buildSurfaceVariables(theme, surface).vars, [theme, surface]);

  const scopedCss = useMemo(() => {
    const declarations = Object.entries(mergedVars)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');
    return `.${scopeClass} {\n${declarations}\n}`;
  }, [mergedVars, scopeClass]);

  return (
    <Box
      className="ds-pattern-brand-studio__preview-panel"
      data-part="preview-panel"
      data-surface={surface.key}
      data-ground={surface.baseTheme}
    >
      <Flex
        className="ds-pattern-brand-studio__preview-header"
        data-part="preview-header"
        align="center"
        justify="between"
        gap={8}
        wrap="wrap"
      >
        <Text className="ds-pattern-brand-studio__preview-panel-title" data-part="preview-panel-title" size="sm" weight="semibold">
          {surface.label ?? surface.key}
        </Text>
        <Badge variant="secondary">{surface.baseTheme}</Badge>
      </Flex>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <Box
        className={`${scopeClass} ds-pattern-brand-studio__preview-content`}
        data-part="preview-content"
        data-surface={surface.key}
        data-ground={surface.baseTheme}
      >
        {galleries ? (
          galleries({
            surface: surface.key,
            baseTheme: surface.baseTheme,
            tenantSlug: surface.tenantSlug,
          })
        ) : (
          <Text
            className="ds-pattern-brand-studio__preview-fallback"
            data-part="preview-fallback"
            size="sm"
          >
            {t('brandStudio.preview.fallback', 'Pass a galleries slot to render live component states here.')}
          </Text>
        )}
      </Box>
      <ContrastReportView report={report} />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Editor
//
// Select option labels are visible chrome copy: they build through the copy
// channel (English floors) instead of shipping as hardcoded module constants.
// ---------------------------------------------------------------------------

function buildHeadingWeightOptions(t: BrandStudioTranslator): Array<{
  value: 'lighter' | 'normal' | 'heavier';
  label: string;
}> {
  return [
    { value: 'lighter', label: t('brandStudio.option.lighter', 'Lighter') },
    { value: 'normal', label: t('brandStudio.option.normal', 'Normal') },
    { value: 'heavier', label: t('brandStudio.option.heavier', 'Heavier') },
  ];
}

function buildLabelStyleOptions(t: BrandStudioTranslator): Array<{
  value: 'uppercase' | 'sentence' | 'capitalize';
  label: string;
}> {
  return [
    { value: 'uppercase', label: t('brandStudio.option.uppercase', 'Uppercase') },
    { value: 'sentence', label: t('brandStudio.option.sentence', 'Sentence') },
    { value: 'capitalize', label: t('brandStudio.option.capitalize', 'Capitalize') },
  ];
}

function buildEntranceOptions(t: BrandStudioTranslator): Array<{
  value: 'none' | 'fade' | 'slideUp' | 'spring' | 'bounce';
  label: string;
}> {
  return [
    { value: 'none', label: t('brandStudio.option.none', 'None') },
    { value: 'fade', label: t('brandStudio.option.fade', 'Fade') },
    { value: 'slideUp', label: t('brandStudio.option.slideUp', 'Slide up') },
    { value: 'spring', label: t('brandStudio.option.spring', 'Spring') },
    { value: 'bounce', label: t('brandStudio.option.bounce', 'Bounce') },
  ];
}

function buildPulseOptions(t: BrandStudioTranslator): Array<{
  value: 'none' | 'slow' | 'normal' | 'fast';
  label: string;
}> {
  return [
    { value: 'none', label: t('brandStudio.option.none', 'None') },
    { value: 'slow', label: t('brandStudio.option.slow', 'Slow') },
    { value: 'normal', label: t('brandStudio.option.normal', 'Normal') },
    { value: 'fast', label: t('brandStudio.option.fast', 'Fast') },
  ];
}

function buildSkeletonOptions(t: BrandStudioTranslator): Array<{
  value: 'pulse' | 'shimmer' | 'wave';
  label: string;
}> {
  return [
    { value: 'pulse', label: t('brandStudio.option.pulse', 'Pulse') },
    { value: 'shimmer', label: t('brandStudio.option.shimmer', 'Shimmer') },
    { value: 'wave', label: t('brandStudio.option.wave', 'Wave') },
  ];
}

/** Ensure `draft.palette` exists and return it (typed, mutable). primaryColor is required by the contract. */
function draftPalette(draft: BrandTheme): BrandPalette {
  const palette = draft.palette ?? { primaryColor: '' };
  draft.palette = palette;
  return palette;
}

/** Ensure `draft.surfaces` exists and return it (typed, mutable). */
function draftSurfaces(draft: BrandTheme): BrandSurfaces {
  const surfaces = draft.surfaces ?? {};
  draft.surfaces = surfaces;
  return surfaces;
}

/** Ensure `draft.chrome` exists and return it (typed, mutable). */
function draftChrome(draft: BrandTheme): BrandChrome {
  const chrome = draft.chrome ?? {};
  draft.chrome = chrome;
  return chrome;
}

/** Ensure `draft.chrome.controls` exists and return it (typed, mutable). */
function draftControls(draft: BrandTheme): BrandControlsChrome {
  const chrome = draftChrome(draft);
  const controls = chrome.controls ?? {};
  chrome.controls = controls;
  return controls;
}

function BrandThemeEditor({
  theme,
  emit,
}: {
  theme: BrandTheme;
  emit: (mutate: (draft: BrandTheme) => void) => void;
}): React.ReactElement {
  const t = useBrandStudioCopy();
  const inheritPlaceholder = t('brandStudio.inherit', 'Inherit');
  const palette: Partial<BrandPalette> = theme.palette ?? {};
  const typography = theme.typography ?? {};
  const surfaces = theme.surfaces ?? {};
  const radius = surfaces.borderRadius ?? {};
  const motion = theme.motion ?? {};
  const controls = theme.chrome?.controls ?? {};
  const buttonPrimary = controls.buttonPrimary ?? {};
  const input = controls.input ?? {};
  const cardComponent = theme.chrome?.cardComponent ?? {};
  const table = theme.chrome?.table ?? {};
  const modal = theme.chrome?.modal ?? {};
  const tabs = theme.chrome?.tabs ?? {};

  return (
    <Stack className="ds-pattern-brand-studio__editor" data-part="editor" spacing="md">
      <EditorSection title={t('brandStudio.section.palette', 'Palette')}>
        <ColorField
          label={t('brandStudio.field.primary', 'Primary')}
          value={palette.primaryColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).primaryColor = v;
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.secondary', 'Secondary')}
          value={palette.secondaryColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).secondaryColor = v;
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.accent', 'Accent')}
          value={palette.accentColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).accentColor = v;
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.success', 'Success')}
          value={palette.successColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).successColor = v;
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.warning', 'Warning')}
          value={palette.warningColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).warningColor = v;
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.error', 'Error')}
          value={palette.errorColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).errorColor = v;
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.info', 'Info')}
          value={palette.infoColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).infoColor = v;
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.darkPrimary', 'Dark primary (dark ground)')}
          value={palette.darkPrimaryColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).darkPrimaryColor = v;
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.darkBackground', 'Dark background (dark ground)')}
          value={palette.darkBackgroundColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).darkBackgroundColor = v;
            })
          }
        />
      </EditorSection>

      <EditorSection title={t('brandStudio.section.typography', 'Typography')}>
        <TextField
          label={t('brandStudio.field.baseFont', 'Base font')}
          value={typography.fontFamilyBase}
          placeholder="Inter, sans-serif"
          onChange={(v) =>
            emit((d) => {
              d.typography = { ...(d.typography ?? {}), fontFamilyBase: v };
            })
          }
        />
        <TextField
          label={t('brandStudio.field.headingFont', 'Heading font')}
          value={typography.fontFamilyHeading}
          placeholder="Inter, sans-serif"
          onChange={(v) =>
            emit((d) => {
              d.typography = { ...(d.typography ?? {}), fontFamilyHeading: v };
            })
          }
        />
        <TextField
          label={t('brandStudio.field.monoFont', 'Mono font')}
          value={typography.fontFamilyMono}
          placeholder="monospace"
          onChange={(v) =>
            emit((d) => {
              d.typography = { ...(d.typography ?? {}), fontFamilyMono: v };
            })
          }
        />
        <TextField
          label={t('brandStudio.field.displayFont', 'Display font')}
          value={typography.fontFamilyDisplay}
          placeholder="Inter, sans-serif"
          onChange={(v) =>
            emit((d) => {
              d.typography = { ...(d.typography ?? {}), fontFamilyDisplay: v };
            })
          }
        />
        <SelectField
          label={t('brandStudio.field.headingWeight', 'Heading weight')}
          value={typography.headingWeightBias}
          options={buildHeadingWeightOptions(t)}
          inheritPlaceholder={inheritPlaceholder}
          onChange={(v) =>
            emit((d) => {
              d.typography = { ...(d.typography ?? {}), headingWeightBias: v };
            })
          }
        />
        <SelectField
          label={t('brandStudio.field.labelStyle', 'Label style')}
          value={typography.labelStyle}
          options={buildLabelStyleOptions(t)}
          inheritPlaceholder={inheritPlaceholder}
          onChange={(v) =>
            emit((d) => {
              d.typography = { ...(d.typography ?? {}), labelStyle: v };
            })
          }
        />
      </EditorSection>

      <EditorSection title={t('brandStudio.section.surfaces', 'Surfaces')}>
        <TextField
          label={t('brandStudio.field.radiusSm', 'Radius sm')}
          value={radius.sm}
          placeholder="4px"
          onChange={(v) =>
            emit((d) => {
              const s = draftSurfaces(d);
              s.borderRadius = { ...(s.borderRadius ?? {}), sm: v };
            })
          }
        />
        <TextField
          label={t('brandStudio.field.radiusMd', 'Radius md')}
          value={radius.md}
          placeholder="8px"
          onChange={(v) =>
            emit((d) => {
              const s = draftSurfaces(d);
              s.borderRadius = { ...(s.borderRadius ?? {}), md: v };
            })
          }
        />
        <TextField
          label={t('brandStudio.field.radiusLg', 'Radius lg')}
          value={radius.lg}
          placeholder="12px"
          onChange={(v) =>
            emit((d) => {
              const s = draftSurfaces(d);
              s.borderRadius = { ...(s.borderRadius ?? {}), lg: v };
            })
          }
        />
        <TextField
          label={t('brandStudio.field.radiusXl', 'Radius xl')}
          value={radius.xl}
          placeholder="16px"
          onChange={(v) =>
            emit((d) => {
              const s = draftSurfaces(d);
              s.borderRadius = { ...(s.borderRadius ?? {}), xl: v };
            })
          }
        />
        <NumberField
          label={t('brandStudio.field.effectIntensity', 'Effect intensity')}
          value={surfaces.effectIntensity}
          placeholder="1"
          onChange={(v) =>
            emit((d) => {
              d.surfaces = { ...(d.surfaces ?? {}), effectIntensity: v };
            })
          }
        />
        <NumberField
          label={t('brandStudio.field.densityScale', 'Density scale')}
          value={surfaces.densityScale}
          placeholder="1"
          onChange={(v) =>
            emit((d) => {
              d.surfaces = { ...(d.surfaces ?? {}), densityScale: v };
            })
          }
        />
      </EditorSection>

      <EditorSection title={t('brandStudio.section.motion', 'Motion')}>
        <SelectField
          label={t('brandStudio.field.entrance', 'Entrance')}
          value={motion.entrance}
          options={buildEntranceOptions(t)}
          inheritPlaceholder={inheritPlaceholder}
          onChange={(v) =>
            emit((d) => {
              d.motion = { ...(d.motion ?? {}), entrance: v };
            })
          }
        />
        <NumberField
          label={t('brandStudio.field.entranceDuration', 'Entrance duration (ms)')}
          value={motion.entranceDuration}
          placeholder="200"
          onChange={(v) =>
            emit((d) => {
              d.motion = { ...(d.motion ?? {}), entranceDuration: v };
            })
          }
        />
        <NumberField
          label={t('brandStudio.field.hoverLift', 'Hover lift')}
          value={motion.hoverLift}
          placeholder="0"
          onChange={(v) =>
            emit((d) => {
              d.motion = { ...(d.motion ?? {}), hoverLift: v };
            })
          }
        />
        <NumberField
          label={t('brandStudio.field.hoverScale', 'Hover scale')}
          value={motion.hoverScale}
          placeholder="1"
          onChange={(v) =>
            emit((d) => {
              d.motion = { ...(d.motion ?? {}), hoverScale: v };
            })
          }
        />
        <SelectField
          label={t('brandStudio.field.pulseSpeed', 'Pulse speed')}
          value={motion.pulseSpeed}
          options={buildPulseOptions(t)}
          inheritPlaceholder={inheritPlaceholder}
          onChange={(v) =>
            emit((d) => {
              d.motion = { ...(d.motion ?? {}), pulseSpeed: v };
            })
          }
        />
        <SelectField
          label={t('brandStudio.field.skeleton', 'Skeleton')}
          value={motion.skeletonStyle}
          options={buildSkeletonOptions(t)}
          inheritPlaceholder={inheritPlaceholder}
          onChange={(v) =>
            emit((d) => {
              d.motion = { ...(d.motion ?? {}), skeletonStyle: v };
            })
          }
        />
      </EditorSection>

      <EditorSection title={t('brandStudio.section.chrome', 'Chrome')}>
        <ColorField
          label={t('brandStudio.field.primaryButtonBg', 'Primary button bg')}
          value={buttonPrimary.bg}
          onChange={(v) =>
            emit((d) => {
              const ctl = draftControls(d);
              ctl.buttonPrimary = { ...(ctl.buttonPrimary ?? {}), bg: v };
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.primaryButtonText', 'Primary button text')}
          value={buttonPrimary.color}
          onChange={(v) =>
            emit((d) => {
              const ctl = draftControls(d);
              ctl.buttonPrimary = { ...(ctl.buttonPrimary ?? {}), color: v };
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.inputBg', 'Input bg')}
          value={input.bg}
          onChange={(v) =>
            emit((d) => {
              const ctl = draftControls(d);
              ctl.input = { ...(ctl.input ?? {}), bg: v };
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.inputBorder', 'Input border')}
          value={input.border}
          onChange={(v) =>
            emit((d) => {
              const ctl = draftControls(d);
              ctl.input = { ...(ctl.input ?? {}), border: v };
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.cardBg', 'Card bg')}
          value={cardComponent.bg}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.cardComponent = { ...(c.cardComponent ?? {}), bg: v };
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.cardText', 'Card text')}
          value={cardComponent.color}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.cardComponent = { ...(c.cardComponent ?? {}), color: v };
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.cardMutedText', 'Card muted text')}
          value={cardComponent.colorMuted}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.cardComponent = { ...(c.cardComponent ?? {}), colorMuted: v };
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.cardBorder', 'Card border')}
          value={cardComponent.border}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.cardComponent = { ...(c.cardComponent ?? {}), border: v };
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.tableHeaderBg', 'Table header bg')}
          value={table.headerBg}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.table = { ...(c.table ?? {}), headerBg: v };
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.tableRowHover', 'Table row hover')}
          value={table.rowBgHover}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.table = { ...(c.table ?? {}), rowBgHover: v };
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.modalBg', 'Modal bg')}
          value={modal.bg}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.modal = { ...(c.modal ?? {}), bg: v };
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.modalOverlay', 'Modal overlay')}
          value={modal.overlayBg}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.modal = { ...(c.modal ?? {}), overlayBg: v };
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.activeTabColor', 'Active tab color')}
          value={tabs.colorActive}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.tabs = { ...(c.tabs ?? {}), colorActive: v };
            })
          }
        />
        <ColorField
          label={t('brandStudio.field.tabsBorder', 'Tabs border')}
          value={tabs.border}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.tabs = { ...(c.tabs ?? {}), border: v };
            })
          }
        />
      </EditorSection>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Tenant-theme live preview section
//
// An optional second preview driven by the DB-tenant compiler
// (`compileTenantThemeConfig`) rather than `compileBrandTheme`. It compiles the
// edited document (debounced), renders inline issues for an invalid document,
// and on success re-skins the consumer's galleries inside the CMP-02 preview
// scope with the anatomy attributes stamped on the same root, then reports the
// APCA autocorrections and font-pack warnings beneath it.
// ---------------------------------------------------------------------------

function TenantThemePreviewSection({
  config,
}: {
  config: BrandStudioTenantThemePreviewConfig;
}): React.ReactElement {
  const t = useBrandStudioCopy();
  const { document, identity, envelope, debounceMs, galleries, label } = config;
  const preview = useTenantThemePreview({ document, identity, envelope, debounceMs });
  const { artifact, issues, adjustments, packWarnings, previewRootAttributes } = preview;

  return (
    <Stack
      className="ds-pattern-brand-studio__tenant-preview"
      data-part="tenant-preview"
      data-state={artifact ? 'valid' : 'invalid'}
      spacing="sm"
    >
      <Flex align="center" gap={8} wrap="wrap">
        <Text
          className="ds-pattern-brand-studio__tenant-preview-heading"
          data-part="tenant-preview-heading"
          size="sm"
          weight="semibold"
        >
          {label ?? t('brandStudio.tenantPreview.heading', 'Tenant theme live preview')}
        </Text>
        <Badge variant={artifact ? 'secondary' : 'error'} data-state={artifact ? 'valid' : 'invalid'}>
          {artifact ? identity.verticalKey : t('brandStudio.tenantPreview.invalidDocument', 'invalid document')}
        </Badge>
      </Flex>

      {artifact ? (
        <Box
          className="ds-pattern-brand-studio__tenant-preview-stage"
          data-part="tenant-preview-stage"
        >
          <style dangerouslySetInnerHTML={{ __html: preview.css }} />
          <Box
            className="ds-pattern-brand-studio__tenant-preview-scope"
            data-part="tenant-preview-scope"
            {...previewRootAttributes}
          >
            {galleries ? (
              galleries({ artifact })
            ) : (
              <Text
                className="ds-pattern-brand-studio__tenant-preview-fallback"
                data-part="tenant-preview-fallback"
                size="sm"
              >
                {t('brandStudio.tenantPreview.fallback', 'Pass a galleries slot to render live surfaces under this theme.')}
              </Text>
            )}
          </Box>
        </Box>
      ) : null}

      <TenantThemePreviewReport
        issues={issues}
        adjustments={adjustments}
        packWarnings={packWarnings}
      />
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// PatternBrandStudio
// ---------------------------------------------------------------------------

export function PatternBrandStudio({
  value,
  onChange,
  galleries,
  lightSurface,
  darkSurface,
  title,
  description,
  tenantThemePreview,
}: PatternBrandStudioProps): React.ReactElement {
  const t = useBrandStudioCopy();
  const resolvedTitle = title ?? t('brandStudio.title', 'Brand Studio');
  const scopeSalt = useId().replace(/:/g, '');
  const theme = useMemo(() => normalizeBrandTheme(value), [value]);

  const emit = useCallback(
    (mutate: (draft: BrandTheme) => void) => {
      const draft = cloneBrandTheme(theme);
      mutate(draft);
      onChange?.(draft);
    },
    [theme, onChange]
  );

  const surfaces = useMemo<BrandStudioSurfaceConfig[]>(
    () => [resolveSurface(DEFAULT_DARK_SURFACE, darkSurface), resolveSurface(DEFAULT_LIGHT_SURFACE, lightSurface)],
    [darkSurface, lightSurface]
  );

  const reports = useMemo(
    () => surfaces.map((surface) => evaluateBrandThemeContrast(theme, surface)),
    [theme, surfaces]
  );

  const [hostileReports, setHostileReports] = useState<BrandStudioContrastReport[] | null>(null);

  const runHostileCheck = useCallback(() => {
    const extreme = applyHostileBrandTheme(theme);
    setHostileReports(surfaces.map((surface) => evaluateBrandThemeContrast(extreme, surface)));
  }, [theme, surfaces]);

  return (
    <Stack
      className="ds-pattern-brand-studio"
      data-part="root"
      data-state={hostileReports ? 'checked' : 'idle'}
      spacing="lg"
    >
      <Stack className="ds-pattern-brand-studio__preview-header" data-part="preview-header" spacing="xs">
        <Flex align="center" gap={8} wrap="wrap">
          <Heading level="h2" size="xl" weight="bold">
            {resolvedTitle}
          </Heading>
          <Badge variant="secondary">{theme.name}</Badge>
        </Flex>
        {description ? (
          <Text className="ds-pattern-brand-studio__description" data-part="description" size="sm">
            {description}
          </Text>
        ) : null}
      </Stack>

      {/* The two-column track + its narrow cut live in the SKIN
          (`.brand-studio-layout` rule): a per-mount injected <style> with a
          physical max-width container query was retired -- the skin owns the
          layout with logical container units and no runtime injection. */}
      <Box
        className="brand-studio-layout ds-pattern-brand-studio__preview-grid"
        data-part="preview-grid"
      >
        <Stack className="ds-pattern-brand-studio__editor" data-part="editor" spacing="md">
          <Text
            className="ds-pattern-brand-studio__editor-heading"
            data-part="editor-heading"
            size="sm"
            weight="semibold"
          >
            {t('brandStudio.editorHeading', 'Bounded BrandTheme fields')}
          </Text>
          <BrandThemeEditor theme={theme} emit={emit} />
        </Stack>

        <Stack className="ds-pattern-brand-studio__preview-grid" data-part="preview-grid" spacing="lg">
          <Text
            className="ds-pattern-brand-studio__preview-heading"
            data-part="preview-heading"
            size="sm"
            weight="semibold"
          >
            {t('brandStudio.previewHeading', 'Live preview on both grounds')}
          </Text>
          {surfaces.map((surface, index) => {
            const report = arrayValueAt(reports, index);
            if (!report) return null;
            return (
              <PreviewPanel
                key={surface.key}
                theme={theme}
                surface={surface}
                scopeSalt={scopeSalt}
                galleries={galleries}
                report={report}
              />
            );
          })}

          <Card
            className="ds-pattern-brand-studio__action-panel"
            data-part="action"
            data-state={hostileReports ? 'complete' : 'idle'}
          >
            <Stack spacing="sm">
              <Flex align="center" justify="between" gap={8} wrap="wrap">
                <Box>
                  <Text className="ds-pattern-brand-studio__action-title" data-part="action-title" size="sm" weight="semibold">
                    {t('brandStudio.hostile.title', 'Hostile input check')}
                  </Text>
                  <Text
                    className="ds-pattern-brand-studio__action-helper"
                    data-part="action-helper"
                    size="xs"
                  >
                    {t('brandStudio.hostile.helper', 'Applies deliberately extreme values and reports the failing color pairs per ground.')}
                  </Text>
                </Box>
                <Button
                  className="ds-pattern-brand-studio__action"
                  data-part="action"
                  data-state={hostileReports ? 'complete' : 'idle'}
                  variant="primary"
                  onClick={runHostileCheck}
                >
                  {t('brandStudio.hostile.run', 'Run check')}
                </Button>
              </Flex>
              {hostileReports ? (
                <Stack spacing="sm">
                  {hostileReports.map((report) => (
                    <ContrastReportView key={report.surface} report={report} />
                  ))}
                </Stack>
              ) : null}
            </Stack>
          </Card>
        </Stack>
      </Box>

      {tenantThemePreview ? (
        <TenantThemePreviewSection config={tenantThemePreview} />
      ) : null}
    </Stack>
  );
}
