'use client';

/**
 * @fileoverview TenantPreview -- Modern engine (DS tokens only).
 * Renders a live preview of tenant branding inside a token-styled card.
 * Injects scoped CSS variables via a `<style>` tag so the preview
 * accurately reflects the tenant's color scheme. Shows palette swatches,
 * sample components COMPOSED from the public DS primitives (Button, Input,
 * Badge, Card) — so the preview demonstrates the real components under the
 * injected tenant tokens — and personality token metadata in a responsive grid.
 *
 * The pattern never recreates a control with its own HTML/CSS. Geometry and
 * the pattern's own paint live in the unlayered modern tenant-preview skin.
 * Own chrome copy resolves through the optional `components` i18n channel
 * with an English floor. Tenant-derived values (palette swatches, preview
 * tokens) are consumer config data and ride the scoped injection — never a
 * DS-authored brand literal.
 *
 * @example
 * <ModernTenantPreview
 *   config={{ name: 'Acme', slug: 'acme', primaryColor: '#3b82f6', engine: 'modern' }}
 *   components={['button', 'badge']}
 *   showColorPalette
 * />
 */

import React, { useMemo, useEffect, useRef } from 'react';
import type { TenantPreviewProps, PreviewComponent } from '../../contracts';
import { createTenantConfig } from '../../../../../../infrastructure/runtime/tenant/runtime/authoring/configuration';
import { resolvePersonalityPreset } from '../../../../../../infrastructure/runtime/tenant/foundation/personality/presets';
import { buildPreviewCss } from '../../runtime/preview-css';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import ModernButton from '../../../../../primitives/inputs/Button/engines/modern';
import ModernInput from '../../../../../primitives/inputs/Input/engines/modern';
import ModernBadge from '../../../../../primitives/display/Badge/engines/modern';
import ModernCard from '../../../../../primitives/display/Card/engines/modern';

/** Default component samples shown when none specified */
const ALL_COMPONENTS: PreviewComponent[] = ['button', 'card', 'input', 'badge', 'table'];

/* ------------------------------------------------------------------ */
/*  Color helpers (palette-fixture computation from consumer config)  */
/* ------------------------------------------------------------------ */

/** Parses hex color to RGB; handles shorthand (#abc) and full (#aabbcc) */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  const match = /^#([0-9a-fA-F]{6})$/.exec(normalized);
  if (!match) return null;
  const parsed = Number.parseInt(match[1], 16);
  return { r: (parsed >> 16) & 255, g: (parsed >> 8) & 255, b: parsed & 255 };
}

/** Linear interpolation between two hex colors at the given ratio (0-1) */
function mixColor(base: string, target: string, ratio: number): string {
  const b = hexToRgb(base);
  const t = hexToRgb(target);
  if (!b || !t) return base;
  const r = Math.round(b.r + (t.r - b.r) * ratio);
  const g = Math.round(b.g + (t.g - b.g) * ratio);
  const bl = Math.round(b.b + (t.b - b.b) * ratio);
  return `#${[r, g, bl].map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('')}`;
}

/** Generates a 10-step palette (50-900) by mixing base with white/black.
 *  The mix endpoints are universal tint/shade anchors for the fixture
 *  computation, not brand values. */
function buildPaletteSteps(base: string): { step: number; color: string }[] {
  return [
    { step: 50, color: mixColor(base, '#ffffff', 0.92) },
    { step: 100, color: mixColor(base, '#ffffff', 0.82) },
    { step: 200, color: mixColor(base, '#ffffff', 0.68) },
    { step: 300, color: mixColor(base, '#ffffff', 0.48) },
    { step: 400, color: mixColor(base, '#ffffff', 0.2) },
    { step: 500, color: base },
    { step: 600, color: mixColor(base, '#000000', 0.12) },
    { step: 700, color: mixColor(base, '#000000', 0.24) },
    { step: 800, color: mixColor(base, '#000000', 0.36) },
    { step: 900, color: mixColor(base, '#000000', 0.48) },
  ];
}

/** Returns black or white for optimal contrast against the given background */
function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  return luminance > 186 ? '#171717' : '#ffffff';
}

/**
 * Modern (DS-token) implementation of the TenantPreview pattern.
 * Wraps everything in a token-styled card and injects sanitized CSS via a
 * `<style>` tag anchored to the preview-owned scope attribute, so the
 * generated variables apply only inside this container.
 *
 * @param props - See {@link TenantPreviewProps} for the full prop contract.
 * @returns The rendered tenant preview card.
 */
export default function ModernTenantPreview(props: TenantPreviewProps) {
  // Optional channel with an English floor: the preview renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;

  const {
    config: creationConfig,
    components = ALL_COMPONENTS,
    showColorPalette = true,
    showPersonalityInfo = true,
    className,
    style,
  } = props;

  const copy = {
    colorPalette: tOr('tenantPreview.colorPalette', 'Color Palette'),
    componentPreview: tOr('tenantPreview.componentPreview', 'Component Preview'),
    buttons: tOr('tenantPreview.buttons', 'Buttons'),
    card: tOr('tenantPreview.card', 'Card'),
    input: tOr('tenantPreview.input', 'Input'),
    badges: tOr('tenantPreview.badges', 'Badges'),
    table: tOr('tenantPreview.table', 'Table'),
    primary: tOr('tenantPreview.primary', 'Primary'),
    secondary: tOr('tenantPreview.secondary', 'Secondary'),
    outlined: tOr('tenantPreview.outlined', 'Outlined'),
    default: tOr('tenantPreview.default', 'Default'),
    inputPlaceholder: tOr('tenantPreview.inputPlaceholder', 'Type something...'),
    sampleCardTitle: tOr('tenantPreview.sampleCardTitle', 'Sample Card Title'),
    sampleCardBody: tOr(
      'tenantPreview.sampleCardBody',
      'This card demonstrates the tenant branding applied to a container component.',
    ),
    badgeActive: tOr('tenantPreview.badgeActive', 'Active'),
    badgePending: tOr('tenantPreview.badgePending', 'Pending'),
    badgeDraft: tOr('tenantPreview.badgeDraft', 'Draft'),
    colName: tOr('tenantPreview.colName', 'Name'),
    colStatus: tOr('tenantPreview.colStatus', 'Status'),
    colAmount: tOr('tenantPreview.colAmount', 'Amount'),
    yes: tOr('tenantPreview.yes', 'Yes'),
    no: tOr('tenantPreview.no', 'No'),
    disabled: tOr('tenantPreview.disabled', 'Disabled'),
  };

  /* Build full tenant config from creation input -- memoized for performance */
  const tenantConfig = useMemo(() => createTenantConfig(creationConfig), [creationConfig]);

  /* Resolve personality preset tokens for the info grid */
  const personalityInfo = useMemo(() => {
    const preset = creationConfig.personality ?? 'neutral';
    const tokens = resolvePersonalityPreset(preset);
    return { preset, tokens };
  }, [creationConfig.personality]);

  const primaryPalette = useMemo(() => buildPaletteSteps(creationConfig.primaryColor), [creationConfig.primaryColor]);

  const secondaryPalette = useMemo(
    () => (creationConfig.secondaryColor ? buildPaletteSteps(creationConfig.secondaryColor) : null),
    [creationConfig.secondaryColor]
  );

  /* Sanitized CSS re-anchored to the preview root; never html[data-tenant] */
  const preview = useMemo(() => buildPreviewCss(tenantConfig), [tenantConfig]);

  const previewRef = useRef<HTMLDivElement>(null);

  /* Informational data-tenant marker; no CSS keys on it. Removed on unmount
     so a detached root never advertises a tenant (CK-H1 lifecycle contract). */
  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;
    container.setAttribute('data-tenant', tenantConfig.slug);
    return () => {
      container.removeAttribute('data-tenant');
    };
  }, [tenantConfig.slug]);

  const primaryFg = getContrastColor(creationConfig.primaryColor);

  const personalityTiles = [
    { label: tOr('tenantPreview.tileAnimation', 'Animation'), value: personalityInfo.tokens.animation?.entrance ?? 'fade' },
    { label: tOr('tenantPreview.tileIntensity', 'Intensity'), value: String(personalityInfo.tokens.animation?.intensity ?? 0.5) },
    { label: tOr('tenantPreview.tileCardElevation', 'Card Elevation'), value: personalityInfo.tokens.card?.defaultElevation ?? 'sm' },
    { label: tOr('tenantPreview.tileCardBorder', 'Card Border'), value: personalityInfo.tokens.card?.showBorder ? copy.yes : copy.no },
    { label: tOr('tenantPreview.tileBadgeShape', 'Badge Shape'), value: personalityInfo.tokens.accent?.badgeShape ?? 'rounded' },
    { label: tOr('tenantPreview.tileLabelStyle', 'Label Style'), value: personalityInfo.tokens.typography?.labelStyle ?? 'sentence' },
    { label: tOr('tenantPreview.tileHoverLift', 'Hover Lift'), value: `${personalityInfo.tokens.animation?.hoverLift ?? 0}px` },
    { label: tOr('tenantPreview.tileEdgeAccent', 'Edge Accent'), value: copy.disabled },
  ];

  return (
    <div
      ref={previewRef}
      className={`ds-pattern-tenant-preview ds-engine-modern ${className ?? ''}`}
      data-part="root"
      /* Literal form of PREVIEW_SCOPE_ATTRIBUTE: every buildPreviewCss selector
         anchors on this attribute, and the contract tests query it by the
         exported constant. */
      data-ds-tenant-preview-root={preview.safeSlug}
      style={{
        ...style,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: preview.css }} />

      <div data-part="body">
        {/* Header */}
        <div data-part="header">
          {creationConfig.logo && (
            <div data-part="logo">
              <img src={creationConfig.logo} alt={creationConfig.name} />
            </div>
          )}
          <div>
            <h2 data-part="tenant-name">
              {creationConfig.name}
            </h2>
            <p data-part="tenant-slug">
              {creationConfig.slug} | {creationConfig.engine ?? 'classic'} | {creationConfig.personality ?? 'neutral'}
            </p>
          </div>
        </div>

        {/* Color Palette */}
        {showColorPalette && (
          <div data-part="palette">
            <div data-part="section-label" data-palette="all">
              {copy.colorPalette}
            </div>
            <div data-part="palette-groups">
              <div data-palette="primary">
                <div data-part="swatch-label" data-palette="primary">
                  {copy.primary}
                </div>
                <div data-part="palette" data-palette="primary">
                  {primaryPalette.map(({ step, color }) => (
                    <div
                      key={step}
                      title={`${step}: ${color}`}
                      data-part="swatch"
                      data-palette="primary"
                      data-step={step}
                      /* Palette fixtures are consumer config data: the computed
                         swatch color stays inline (the preview's purpose). */
                      style={{ backgroundColor: color }}
                    >
                      {step === 500 && (
                        <span
                          data-part="swatch-label"
                          data-palette="primary"
                          data-step={step}
                          style={{ color: primaryFg }}
                        >
                          500
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {secondaryPalette && (
                <div data-palette="secondary">
                  <div data-part="swatch-label" data-palette="secondary">
                    {copy.secondary}
                  </div>
                  <div data-part="palette" data-palette="secondary">
                    {secondaryPalette.map(({ step, color }) => (
                      <div
                        key={step}
                        title={`${step}: ${color}`}
                        data-part="swatch"
                        data-palette="secondary"
                        data-step={step}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Component Samples -- REAL DS primitives, painted by the injected
            tenant tokens (the preview's purpose: what do the components look
            like under this tenant). Each sample type is gated behind the
            components array for selective rendering. */}
        {components.length > 0 && (
          <div>
            <div data-part="section-label">{copy.componentPreview}</div>
            <div data-part="samples">
              {/* Buttons -- primary/outline/default variants under the tenant
                  primary injected into the preview scope. */}
              {components.includes('button') && (
                <div>
                  <div data-part="sub-label">{copy.buttons}</div>
                  <div data-part="sample-row">
                    <ModernButton variant="primary" size="sm" data-part="button" data-sample-variant="primary">
                      {copy.primary}
                    </ModernButton>
                    <ModernButton variant="outline" size="sm" data-part="button" data-sample-variant="outlined">
                      {copy.outlined}
                    </ModernButton>
                    <ModernButton variant="default" size="sm" data-part="button" data-sample-variant="default">
                      {copy.default}
                    </ModernButton>
                  </div>
                </div>
              )}

              {/* Card -- the composed Card primitive under tenant surface tokens. */}
              {components.includes('card') && (
                <div>
                  <div data-part="sub-label">{copy.card}</div>
                  <ModernCard size="sm" title={copy.sampleCardTitle}>
                    <p data-part="preview-card-body">
                      {copy.sampleCardBody}
                    </p>
                  </ModernCard>
                </div>
              )}

              {components.includes('input') && (
                <div>
                  <div data-part="sub-label">{copy.input}</div>
                  {/* Slot keeps the historical data-part; the composed Input
                      owns the control chrome. */}
                  <div data-part="sample-input">
                    <ModernInput
                      size="sm"
                      readOnly
                      placeholder={copy.inputPlaceholder}
                      aria-label={copy.input}
                    />
                  </div>
                </div>
              )}

              {/* Badges -- real Badge primitives; the active one demonstrates
                  the tenant primary, the others the semantic channels. */}
              {components.includes('badge') && (
                <div>
                  <div data-part="sub-label">{copy.badges}</div>
                  <div data-part="sample-row">
                    <ModernBadge variant="primary" data-part="badge" data-status="active">
                      {copy.badgeActive}
                    </ModernBadge>
                    <ModernBadge variant="warning" data-part="badge" data-status="pending">
                      {copy.badgePending}
                    </ModernBadge>
                    <ModernBadge variant="default" data-part="badge" data-status="draft">
                      {copy.badgeDraft}
                    </ModernBadge>
                  </div>
                </div>
              )}

              {/* Table -- display fixture with inline status badges */}
              {components.includes('table') && (
                <div>
                  <div data-part="sub-label">{copy.table}</div>
                  <div data-part="table-scroll">
                    <table data-part="sample-table">
                      <thead>
                        <tr data-part="table-head">
                          <th data-part="preview-table-cell" data-variant="head">
                            {copy.colName}
                          </th>
                          <th data-part="preview-table-cell" data-variant="head">
                            {copy.colStatus}
                          </th>
                          <th data-part="preview-table-cell" data-variant="head" data-align="end">
                            {copy.colAmount}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td data-part="preview-table-cell">Project Alpha</td>
                          <td data-part="preview-table-cell">
                            <ModernBadge variant="primary" data-part="badge" data-status="active">
                              {copy.badgeActive}
                            </ModernBadge>
                          </td>
                          <td data-part="preview-table-cell" data-align="end">$12,400</td>
                        </tr>
                        <tr>
                          <td data-part="preview-table-cell">Project Beta</td>
                          <td data-part="preview-table-cell">
                            <ModernBadge variant="default" data-part="badge" data-status="pending">
                              {copy.badgePending}
                            </ModernBadge>
                          </td>
                          <td data-part="preview-table-cell" data-align="end">$8,200</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Personality Info -- grid showing key personality tokens
            so designers can verify the preset configuration. */}
        {showPersonalityInfo && (
          <div>
            <div data-part="section-label">
              {tOr('tenantPreview.personalityLabel', 'Personality: {preset}', { preset: personalityInfo.preset })}
            </div>
            <div data-part="personality-grid">
              {personalityTiles.map(({ label, value }) => (
                <div key={label} data-part="personality-tile">
                  <div data-part="personality-tile-label">{label}</div>
                  <div data-part="personality-tile-value">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
