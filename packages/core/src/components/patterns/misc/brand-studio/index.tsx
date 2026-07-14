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
 * @module Patterns/Misc/BrandStudio
 * @category Patterns/Misc
 * @package @rottay/design-system
 */

'use client';

import React, { useCallback, useId, useMemo, useState } from 'react';

import { Badge, Box, Button, Card, Flex, Heading, Input, Select, Stack, Text } from '../../../primitives';
import { compileBrandTheme } from '../../../../compilers/brand-theme';
import { validateBrandingContrast, type BrandingColors } from '../../../../_internal/a11y/contrast';
import type {
  BrandChrome,
  BrandControlsChrome,
  BrandPalette,
  BrandSurfaces,
  BrandTheme,
} from '../../../../contracts/themes';
import { cloneBrandTheme } from './export';
import type {
  BrandStudioContrastReport,
  BrandStudioSurfaceConfig,
  BrandStudioSurfaceKey,
  PatternBrandStudioProps,
} from './types';

export * from './types';
export {
  cloneBrandTheme,
  serializeBrandTheme,
  deserializeBrandTheme,
  brandThemeToTenantAppearanceAdvanced,
} from './export';

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
 * `compilers/brand-theme`): it always sources `--ds-color-primary`/
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
// ---------------------------------------------------------------------------

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 4,
};

function FieldLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <Text
      className="ds-pattern-brand-studio__field-label"
      data-part="field-label"
      size="xs"
      weight="semibold"
      style={fieldLabelStyle}
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
            width: 28,
            height: 28,
            flexShrink: 0,
            background: isHex(value) ? value : 'transparent',
          }}
        />
        <Input
          className="ds-pattern-brand-studio__field-input"
          data-part="field-input"
          value={value ?? ''}
          placeholder="#000000"
          onChange={(next) => onChange(next)}
          style={{ width: '100%' }}
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
        onChange={(next) => onChange(next)}
        style={{ width: '100%' }}
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
        onChange={(next) => {
          const trimmed = next.trim();
          if (trimmed === '') {
            onChange(undefined);
            return;
          }
          const parsed = Number(trimmed);
          onChange(Number.isNaN(parsed) ? undefined : parsed);
        }}
        style={{ width: '100%' }}
      />
    </Box>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | undefined;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}): React.ReactElement {
  return (
    <Box className="ds-pattern-brand-studio__field" data-part="field">
      <FieldLabel>{label}</FieldLabel>
      <Select
        className="ds-pattern-brand-studio__field-input"
        data-part="field-input"
        value={value}
        options={options}
        placeholder="Inherit"
        onChange={(next) => onChange(next as T)}
        style={{ width: '100%' }}
      />
    </Box>
  );
}

const EDITOR_GRID: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 12,
};

function EditorSection({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement {
  return (
    <Box
      className="ds-pattern-brand-studio__section"
      data-part="section"
      style={{
        padding: 16,
      }}
    >
      <Stack spacing="sm">
        <Text size="sm" weight="semibold" style={{ display: 'block' }}>
          {title}
        </Text>
        <Box style={EDITOR_GRID}>{children}</Box>
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Inline contrast report
// ---------------------------------------------------------------------------

function ContrastReportView({ report }: { report: BrandStudioContrastReport }): React.ReactElement {
  return (
    <Box
      className="ds-pattern-brand-studio__contrast-summary"
      data-part="contrast-summary"
      data-ground={report.surface}
      data-state={report.valid ? 'pass' : 'fail'}
      style={{
        marginTop: 12,
        padding: 12,
      }}
    >
      <Flex
        className="ds-pattern-brand-studio__contrast-row"
        data-part="contrast-row"
        align="center"
        justify="between"
        gap={8}
        style={{ flexWrap: 'wrap' }}
      >
        <Text
          className="ds-pattern-brand-studio__contrast-label"
          data-part="contrast-label"
          size="xs"
          weight="semibold"
          style={{
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {report.surface === 'dark' ? 'Dark ground' : 'Light ground'} contrast
        </Text>
        <Badge
          className="ds-pattern-brand-studio__contrast-state"
          data-state={report.valid ? 'pass' : 'fail'}
          variant={report.valid ? 'success' : 'error'}
        >
          {report.valid ? 'WCAG AA clean' : `${report.violations.length} failing`}
        </Badge>
      </Flex>
      {report.violations.length === 0 ? (
        <Text
          className="ds-pattern-brand-studio__contrast-message"
          data-part="contrast-message"
          size="xs"
          style={{
            display: 'block',
            marginTop: 8,
          }}
        >
          Every checkable color pair meets its required ratio.
        </Text>
      ) : (
        <Stack spacing="xs" style={{ marginTop: 8 }}>
          {report.violations.map((violation) => {
            const suggestion = report.suggestions.find((entry) => entry.pair === violation.pair);
            return (
              <Box
                key={violation.pair}
                className="ds-pattern-brand-studio__violation"
                data-part="violation"
                data-severity="error"
                style={{
                  padding: '8px 10px',
                }}
              >
                <Flex
                  className="ds-pattern-brand-studio__contrast-row"
                  data-part="contrast-row"
                  align="center"
                  justify="between"
                  gap={8}
                  style={{ flexWrap: 'wrap' }}
                >
                  <Text size="xs" weight="semibold" style={{ display: 'block' }}>
                    {violation.pair}
                  </Text>
                  <Text
                    className="ds-pattern-brand-studio__violation-ratio"
                    data-part="violation-ratio"
                    size="xs"
                    style={{ display: 'block' }}
                  >
                    {violation.ratio.toFixed(2)} : 1 &middot; needs {violation.required} : 1 ({violation.level})
                  </Text>
                </Flex>
                <Text
                  className="ds-pattern-brand-studio__violation-detail"
                  data-part="violation-detail"
                  size="xs"
                  style={{
                    display: 'block',
                    marginTop: 4,
                  }}
                >
                  {violation.foreground} on {violation.background}
                  {suggestion ? ` → try ${suggestion.suggestedColor} (${suggestion.newRatio.toFixed(2)} : 1)` : ''}
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
        style={{ marginBottom: 8, flexWrap: 'wrap' }}
      >
        <Text size="sm" weight="semibold" style={{ display: 'block' }}>
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
        style={{
          padding: 20,
          fontFamily: 'var(--ds-font-family-base, inherit)',
        }}
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
            style={{
              display: 'block',
            }}
          >
            Pass a galleries slot to render live component states here.
          </Text>
        )}
      </Box>
      <ContrastReportView report={report} />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

const HEADING_WEIGHT_OPTIONS: Array<{
  value: 'lighter' | 'normal' | 'heavier';
  label: string;
}> = [
  { value: 'lighter', label: 'Lighter' },
  { value: 'normal', label: 'Normal' },
  { value: 'heavier', label: 'Heavier' },
];

const LABEL_STYLE_OPTIONS: Array<{
  value: 'uppercase' | 'sentence' | 'capitalize';
  label: string;
}> = [
  { value: 'uppercase', label: 'Uppercase' },
  { value: 'sentence', label: 'Sentence' },
  { value: 'capitalize', label: 'Capitalize' },
];

const ENTRANCE_OPTIONS: Array<{
  value: 'none' | 'fade' | 'slideUp' | 'spring' | 'bounce';
  label: string;
}> = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'slideUp', label: 'Slide up' },
  { value: 'spring', label: 'Spring' },
  { value: 'bounce', label: 'Bounce' },
];

const PULSE_OPTIONS: Array<{
  value: 'none' | 'slow' | 'normal' | 'fast';
  label: string;
}> = [
  { value: 'none', label: 'None' },
  { value: 'slow', label: 'Slow' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' },
];

const SKELETON_OPTIONS: Array<{
  value: 'pulse' | 'shimmer' | 'wave';
  label: string;
}> = [
  { value: 'pulse', label: 'Pulse' },
  { value: 'shimmer', label: 'Shimmer' },
  { value: 'wave', label: 'Wave' },
];

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
      <EditorSection title="Palette">
        <ColorField
          label="Primary"
          value={palette.primaryColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).primaryColor = v;
            })
          }
        />
        <ColorField
          label="Secondary"
          value={palette.secondaryColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).secondaryColor = v;
            })
          }
        />
        <ColorField
          label="Accent"
          value={palette.accentColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).accentColor = v;
            })
          }
        />
        <ColorField
          label="Success"
          value={palette.successColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).successColor = v;
            })
          }
        />
        <ColorField
          label="Warning"
          value={palette.warningColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).warningColor = v;
            })
          }
        />
        <ColorField
          label="Error"
          value={palette.errorColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).errorColor = v;
            })
          }
        />
        <ColorField
          label="Info"
          value={palette.infoColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).infoColor = v;
            })
          }
        />
        <ColorField
          label="Dark primary (dark ground)"
          value={palette.darkPrimaryColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).darkPrimaryColor = v;
            })
          }
        />
        <ColorField
          label="Dark background (dark ground)"
          value={palette.darkBackgroundColor}
          onChange={(v) =>
            emit((d) => {
              draftPalette(d).darkBackgroundColor = v;
            })
          }
        />
      </EditorSection>

      <EditorSection title="Typography">
        <TextField
          label="Base font"
          value={typography.fontFamilyBase}
          placeholder="Inter, sans-serif"
          onChange={(v) =>
            emit((d) => {
              d.typography = { ...(d.typography ?? {}), fontFamilyBase: v };
            })
          }
        />
        <TextField
          label="Heading font"
          value={typography.fontFamilyHeading}
          placeholder="Inter, sans-serif"
          onChange={(v) =>
            emit((d) => {
              d.typography = { ...(d.typography ?? {}), fontFamilyHeading: v };
            })
          }
        />
        <TextField
          label="Mono font"
          value={typography.fontFamilyMono}
          placeholder="monospace"
          onChange={(v) =>
            emit((d) => {
              d.typography = { ...(d.typography ?? {}), fontFamilyMono: v };
            })
          }
        />
        <TextField
          label="Display font"
          value={typography.fontFamilyDisplay}
          placeholder="Inter, sans-serif"
          onChange={(v) =>
            emit((d) => {
              d.typography = { ...(d.typography ?? {}), fontFamilyDisplay: v };
            })
          }
        />
        <SelectField
          label="Heading weight"
          value={typography.headingWeightBias}
          options={HEADING_WEIGHT_OPTIONS}
          onChange={(v) =>
            emit((d) => {
              d.typography = { ...(d.typography ?? {}), headingWeightBias: v };
            })
          }
        />
        <SelectField
          label="Label style"
          value={typography.labelStyle}
          options={LABEL_STYLE_OPTIONS}
          onChange={(v) =>
            emit((d) => {
              d.typography = { ...(d.typography ?? {}), labelStyle: v };
            })
          }
        />
      </EditorSection>

      <EditorSection title="Surfaces">
        <TextField
          label="Radius sm"
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
          label="Radius md"
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
          label="Radius lg"
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
          label="Radius xl"
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
          label="Effect intensity"
          value={surfaces.effectIntensity}
          placeholder="1"
          onChange={(v) =>
            emit((d) => {
              d.surfaces = { ...(d.surfaces ?? {}), effectIntensity: v };
            })
          }
        />
        <NumberField
          label="Density scale"
          value={surfaces.densityScale}
          placeholder="1"
          onChange={(v) =>
            emit((d) => {
              d.surfaces = { ...(d.surfaces ?? {}), densityScale: v };
            })
          }
        />
      </EditorSection>

      <EditorSection title="Motion">
        <SelectField
          label="Entrance"
          value={motion.entrance}
          options={ENTRANCE_OPTIONS}
          onChange={(v) =>
            emit((d) => {
              d.motion = { ...(d.motion ?? {}), entrance: v };
            })
          }
        />
        <NumberField
          label="Entrance duration (ms)"
          value={motion.entranceDuration}
          placeholder="200"
          onChange={(v) =>
            emit((d) => {
              d.motion = { ...(d.motion ?? {}), entranceDuration: v };
            })
          }
        />
        <NumberField
          label="Hover lift"
          value={motion.hoverLift}
          placeholder="0"
          onChange={(v) =>
            emit((d) => {
              d.motion = { ...(d.motion ?? {}), hoverLift: v };
            })
          }
        />
        <NumberField
          label="Hover scale"
          value={motion.hoverScale}
          placeholder="1"
          onChange={(v) =>
            emit((d) => {
              d.motion = { ...(d.motion ?? {}), hoverScale: v };
            })
          }
        />
        <SelectField
          label="Pulse speed"
          value={motion.pulseSpeed}
          options={PULSE_OPTIONS}
          onChange={(v) =>
            emit((d) => {
              d.motion = { ...(d.motion ?? {}), pulseSpeed: v };
            })
          }
        />
        <SelectField
          label="Skeleton"
          value={motion.skeletonStyle}
          options={SKELETON_OPTIONS}
          onChange={(v) =>
            emit((d) => {
              d.motion = { ...(d.motion ?? {}), skeletonStyle: v };
            })
          }
        />
      </EditorSection>

      <EditorSection title="Chrome">
        <ColorField
          label="Primary button bg"
          value={buttonPrimary.bg}
          onChange={(v) =>
            emit((d) => {
              const ctl = draftControls(d);
              ctl.buttonPrimary = { ...(ctl.buttonPrimary ?? {}), bg: v };
            })
          }
        />
        <ColorField
          label="Primary button text"
          value={buttonPrimary.color}
          onChange={(v) =>
            emit((d) => {
              const ctl = draftControls(d);
              ctl.buttonPrimary = { ...(ctl.buttonPrimary ?? {}), color: v };
            })
          }
        />
        <ColorField
          label="Input bg"
          value={input.bg}
          onChange={(v) =>
            emit((d) => {
              const ctl = draftControls(d);
              ctl.input = { ...(ctl.input ?? {}), bg: v };
            })
          }
        />
        <ColorField
          label="Input border"
          value={input.border}
          onChange={(v) =>
            emit((d) => {
              const ctl = draftControls(d);
              ctl.input = { ...(ctl.input ?? {}), border: v };
            })
          }
        />
        <ColorField
          label="Card bg"
          value={cardComponent.bg}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.cardComponent = { ...(c.cardComponent ?? {}), bg: v };
            })
          }
        />
        <ColorField
          label="Card text"
          value={cardComponent.color}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.cardComponent = { ...(c.cardComponent ?? {}), color: v };
            })
          }
        />
        <ColorField
          label="Card muted text"
          value={cardComponent.colorMuted}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.cardComponent = { ...(c.cardComponent ?? {}), colorMuted: v };
            })
          }
        />
        <ColorField
          label="Card border"
          value={cardComponent.border}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.cardComponent = { ...(c.cardComponent ?? {}), border: v };
            })
          }
        />
        <ColorField
          label="Table header bg"
          value={table.headerBg}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.table = { ...(c.table ?? {}), headerBg: v };
            })
          }
        />
        <ColorField
          label="Table row hover"
          value={table.rowBgHover}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.table = { ...(c.table ?? {}), rowBgHover: v };
            })
          }
        />
        <ColorField
          label="Modal bg"
          value={modal.bg}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.modal = { ...(c.modal ?? {}), bg: v };
            })
          }
        />
        <ColorField
          label="Modal overlay"
          value={modal.overlayBg}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.modal = { ...(c.modal ?? {}), overlayBg: v };
            })
          }
        />
        <ColorField
          label="Active tab color"
          value={tabs.colorActive}
          onChange={(v) =>
            emit((d) => {
              const c = draftChrome(d);
              c.tabs = { ...(c.tabs ?? {}), colorActive: v };
            })
          }
        />
        <ColorField
          label="Tabs border"
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
// PatternBrandStudio
// ---------------------------------------------------------------------------

export function PatternBrandStudio({
  value,
  onChange,
  galleries,
  lightSurface,
  darkSurface,
  title = 'Brand Studio',
  description,
}: PatternBrandStudioProps): React.ReactElement {
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
        <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
          <Heading level="h2" size="xl" weight="bold">
            {title}
          </Heading>
          <Badge variant="secondary">{theme.name}</Badge>
        </Flex>
        {description ? (
          <Text className="ds-pattern-brand-studio__description" data-part="description" size="sm">
            {description}
          </Text>
        ) : null}
      </Stack>

      <Box
        className="brand-studio-layout ds-pattern-brand-studio__preview-grid"
        data-part="preview-grid"
        style={{
          display: 'grid',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <Stack className="ds-pattern-brand-studio__editor" data-part="editor" spacing="md">
          <Text
            className="ds-pattern-brand-studio__editor-heading"
            data-part="editor-heading"
            size="sm"
            weight="semibold"
            style={{
              display: 'block',
            }}
          >
            Bounded BrandTheme fields
          </Text>
          <BrandThemeEditor theme={theme} emit={emit} />
        </Stack>

        <Stack className="ds-pattern-brand-studio__preview-grid" data-part="preview-grid" spacing="lg">
          <Text
            className="ds-pattern-brand-studio__preview-heading"
            data-part="preview-heading"
            size="sm"
            weight="semibold"
            style={{
              display: 'block',
            }}
          >
            Live preview on both grounds
          </Text>
          {surfaces.map((surface, index) => (
            <PreviewPanel
              key={surface.key}
              theme={theme}
              surface={surface}
              scopeSalt={scopeSalt}
              galleries={galleries}
              report={reports[index]}
            />
          ))}

          <Card
            className="ds-pattern-brand-studio__action-panel"
            data-part="action"
            data-state={hostileReports ? 'complete' : 'idle'}
            style={{
              padding: 16,
            }}
          >
            <Stack spacing="sm">
              <Flex align="center" justify="between" gap={8} style={{ flexWrap: 'wrap' }}>
                <Box>
                  <Text size="sm" weight="semibold" style={{ display: 'block' }}>
                    Hostile input check
                  </Text>
                  <Text
                    className="ds-pattern-brand-studio__action-helper"
                    data-part="action-helper"
                    size="xs"
                    style={{
                      display: 'block',
                    }}
                  >
                    Applies deliberately extreme values and reports the failing color pairs per ground.
                  </Text>
                </Box>
                <Button
                  className="ds-pattern-brand-studio__action"
                  data-part="action"
                  data-state={hostileReports ? 'complete' : 'idle'}
                  variant="primary"
                  onClick={runHostileCheck}
                >
                  Run check
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

      {/* The column track lives here rather than inline: a container query
          cannot outrank an inline style without !important, and an escape
          hatch that defeats a specificity the rule should simply own is not a
          fix. Both declarations sit at the same specificity, so the narrow
          rule wins by source order. */}
      <style
        dangerouslySetInnerHTML={{
          __html:
            `.brand-studio-layout { grid-template-columns: minmax(280px, 0.9fr) minmax(320px, 1.1fr); }` +
            `@container (max-width: 900px) { .brand-studio-layout { grid-template-columns: 1fr; } }`,
        }}
      />
    </Stack>
  );
}
