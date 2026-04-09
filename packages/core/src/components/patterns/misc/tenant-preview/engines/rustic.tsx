'use client';

/**
 * @fileoverview TenantPreview -- Rustic engine (Vanilla / CSS variables).
 * Renders a live preview of tenant branding using only inline styles
 * with --ds-* design tokens. Injects scoped CSS via a `<style>` tag
 * for accurate color representation. Shows palette swatches, sample
 * components using component-specific tokens (--ds-button-*, --ds-card-*,
 * --ds-input-*, --ds-badge-*), and personality metadata.
 *
 * @example
 * <RusticTenantPreview
 *   config={{ name: 'Acme', slug: 'acme', primaryColor: '#3b82f6', engine: 'rustic' }}
 *   showColorPalette
 *   showPersonalityInfo
 * />
 */

import React, { useMemo, useEffect, useRef } from 'react';
import type { TenantPreviewProps, PreviewComponent } from '../TenantPreview.types';
import { createTenantConfig } from '../../../../../runtime/tenancy/authoring/create-tenant';
import { resolvePersonalityPreset } from '../../../../../runtime/tenancy/personality-presets';
import { generateTenantCss } from '../../../../../runtime/tenancy/storage/static/generator';

/** Default component samples shown when none specified */
const ALL_COMPONENTS: PreviewComponent[] = ['button', 'card', 'input', 'badge', 'table'];

/** Parses hex color to RGB; handles shorthand (#abc) and full (#aabbcc) */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;
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

/** Generates a 10-step palette (50-900) by mixing base with white/black */
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
 * Rustic (Vanilla CSS) implementation of the TenantPreview pattern.
 * Uses component-specific --ds-* tokens (--ds-button-*, --ds-card-*,
 * --ds-input-*, --ds-badge-*) for the sample components, giving an
 * accurate representation of how the tenant theme applies at every level.
 *
 * @param props - See {@link TenantPreviewProps} for the full prop contract.
 * @returns The rendered tenant preview with palette, components, and personality info.
 */
export default function RusticTenantPreview(props: TenantPreviewProps) {
  const {
    config: creationConfig,
    components = ALL_COMPONENTS,
    showColorPalette = true,
    showPersonalityInfo = true,
    className,
    style,
  } = props;

  const previewRef = useRef<HTMLDivElement>(null);

  /* Build full tenant config from creation input */
  const tenantConfig = useMemo(
    () => createTenantConfig(creationConfig),
    [creationConfig]
  );

  /* Resolve personality preset tokens for the info grid */
  const personalityInfo = useMemo(() => {
    const preset = creationConfig.personality ?? 'neutral';
    const tokens = resolvePersonalityPreset(preset);
    return { preset, tokens };
  }, [creationConfig.personality]);

  const primaryPalette = useMemo(
    () => buildPaletteSteps(creationConfig.primaryColor),
    [creationConfig.primaryColor]
  );

  const secondaryPalette = useMemo(
    () => creationConfig.secondaryColor ? buildPaletteSteps(creationConfig.secondaryColor) : null,
    [creationConfig.secondaryColor]
  );

  /* Generate scoped CSS; dark mode excluded for preview context */
  const previewCss = useMemo(() => generateTenantCss(tenantConfig, {
    includeDarkSelector: false,
    includeSystemDarkSelector: false,
  }), [tenantConfig]);

  /* Attach data-tenant for CSS scoping; cleanup removes attribute on unmount */
  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;
    container.setAttribute('data-tenant', tenantConfig.slug);
    return () => {
      container.removeAttribute('data-tenant');
    };
  }, [tenantConfig.slug]);

  const primary500 = creationConfig.primaryColor;
  const primaryFg = getContrastColor(primary500);

  /* Shorthand token references for consistent use across all preview sections */
  const previewSurface = 'var(--ds-color-surface, var(--ds-color-bg-primary))';
  const previewSurfaceSecondary = 'var(--ds-color-surface-secondary, var(--ds-color-bg-secondary))';
  const previewSurfaceMuted = 'var(--ds-color-surface-muted, var(--ds-color-bg-secondary))';
  const previewBorder = 'var(--ds-color-border-primary, var(--ds-color-border))';
  const previewBorderMuted = 'var(--ds-color-border-secondary, var(--ds-color-border))';
  const previewText = 'var(--ds-color-text, var(--ds-color-text-primary))';
  const previewTextSecondary = 'var(--ds-color-text-secondary, var(--ds-color-text-muted))';
  const previewOnPrimary = 'var(--ds-color-text-on-primary)';

  const sectionLabel: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: previewTextSecondary,
    marginBottom: '10px',
    display: 'block',
  };

  return (
    <div
      ref={previewRef}
      className={`ds-pattern-tenant-preview ds-engine-rustic ${className ?? ''}`}
      style={{
        padding: '20px',
        border: `1px solid ${previewBorder}`,
        borderRadius: 'var(--ds-radius-md, 6px)',
        backgroundColor: previewSurface,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: previewText,
        boxShadow: 'var(--ds-shadow-md)',
        ...style,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: previewCss }} />

      {/* Header */}
      <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: `1px solid ${previewBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {creationConfig.logo && (
            <img
              src={creationConfig.logo}
              alt={creationConfig.name}
              style={{ width: '28px', height: '28px', borderRadius: 'var(--ds-radius-sm, 4px)', objectFit: 'cover' }}
            />
          )}
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: previewText }}>
              {creationConfig.name}
            </div>
            <div style={{ fontSize: '12px', color: previewTextSecondary }}>
              {creationConfig.slug} | {creationConfig.engine ?? 'classic'} | {creationConfig.personality ?? 'neutral'}
            </div>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      {showColorPalette && (
        <div style={{ marginBottom: '20px' }}>
          <span style={sectionLabel}>Color Palette</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>
              <div style={{ fontSize: '11px', color: previewTextSecondary, marginBottom: '3px' }}>Primary</div>
              <div style={{ display: 'flex', borderRadius: 'var(--ds-radius-sm, 4px)', overflow: 'hidden' }}>
                {primaryPalette.map(({ step, color }) => (
                  <div
                    key={step}
                    title={`${step}: ${color}`}
                    style={{
                      flex: 1,
                      height: '28px',
                      backgroundColor: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {step === 500 && (
                      <span style={{ fontSize: '9px', fontWeight: 700, color: primaryFg }}>500</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {secondaryPalette && (
              <div>
                <div style={{ fontSize: '11px', color: previewTextSecondary, marginBottom: '3px' }}>Secondary</div>
                <div style={{ display: 'flex', borderRadius: 'var(--ds-radius-sm, 4px)', overflow: 'hidden' }}>
                  {secondaryPalette.map(({ step, color }) => (
                    <div
                      key={step}
                      title={`${step}: ${color}`}
                      style={{ flex: 1, height: '20px', backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Component Samples -- uses component-specific --ds-* tokens (e.g. --ds-button-*,
          --ds-card-*, --ds-input-*, --ds-badge-*) so each sample accurately reflects
          how the tenant theme cascades down to individual component levels. */}
      {components.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <span style={sectionLabel}>Component Preview</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Buttons -- primary/outlined/default trio using --ds-button-* component tokens */}
            {components.includes('button') && (
              <div>
                <div style={{ fontSize: '11px', color: previewTextSecondary, marginBottom: '6px' }}>Buttons</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    style={{
                      backgroundColor: 'var(--ds-button-primary-bg, var(--ds-color-primary-500))',
                      color: 'var(--ds-button-primary-color, var(--ds-color-text-on-primary))',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: 'var(--ds-button-radius, var(--ds-radius-sm))',
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: 'var(--ds-button-primary-shadow, var(--ds-shadow-sm))',
                    }}
                  >
                    Primary
                  </button>
                  <button
                    type="button"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--ds-color-primary-500)',
                      border: '1px solid var(--ds-color-primary-500)',
                      padding: '6px 14px',
                      borderRadius: 'var(--ds-button-radius, var(--ds-radius-sm))',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Outlined
                  </button>
                  <button
                    type="button"
                    style={{
                      backgroundColor: 'var(--ds-button-secondary-bg, var(--ds-color-surface-secondary))',
                      color: 'var(--ds-button-secondary-color, var(--ds-color-text))',
                      border: '1px solid var(--ds-button-secondary-border, var(--ds-color-border-primary))',
                      padding: '6px 14px',
                      borderRadius: 'var(--ds-button-radius, var(--ds-radius-sm))',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Default
                  </button>
                </div>
              </div>
            )}

            {/* Card -- all visual properties flow from --ds-card-* tokens with generic fallbacks.
                The accent bar width/color reinforces brand identity within containers. */}
            {components.includes('card') && (
              <div>
                <div style={{ fontSize: '11px', color: previewTextSecondary, marginBottom: '6px' }}>Card</div>
                <div style={{
                  padding: '14px',
                  borderRadius: 'var(--ds-card-radius, var(--ds-radius-sm))',
                  border: '1px solid var(--ds-card-border, var(--ds-color-border-primary))',
                  background: 'var(--ds-card-bg, var(--ds-color-surface))',
                  boxShadow: 'var(--ds-card-shadow, var(--ds-shadow-sm))',
                }}>
                  {/* Accent bar in primary color for brand reinforcement */}
                  <div style={{ width: '100%', height: '2px', backgroundColor: primary500, marginBottom: '10px' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: previewText }}>Sample Card Title</div>
                  <div style={{ fontSize: '12px', color: previewTextSecondary, marginTop: '4px' }}>
                    This card demonstrates the tenant branding applied to a container component.
                  </div>
                </div>
              </div>
            )}

            {/* Input -- readOnly to prevent user interaction; styled with --ds-input-* tokens */}
            {components.includes('input') && (
              <div>
                <div style={{ fontSize: '11px', color: previewTextSecondary, marginBottom: '6px' }}>Input</div>
                <input
                  type="text"
                  placeholder="Type something..."
                  readOnly
                  style={{
                    width: '100%',
                    maxWidth: '280px',
                    padding: '6px 10px',
                    borderRadius: 'var(--ds-input-radius, var(--ds-radius-sm))',
                    border: '1px solid var(--ds-input-border, var(--ds-color-border-primary))',
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: 'var(--ds-input-bg, var(--ds-color-surface))',
                    color: 'var(--ds-input-color, var(--ds-color-text))',
                  }}
                />
              </div>
            )}

            {/* Badge -- three tiers (primary, warning, neutral) using --ds-badge-radius
                for consistent shape across the tenant theme. */}
            {components.includes('badge') && (
              <div>
                <div style={{ fontSize: '11px', color: previewTextSecondary, marginBottom: '6px' }}>Badges</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['Active', 'Pending', 'Draft'].map((label, i) => {
                    /* Each badge tier uses a different semantic color token */
                    const colors = [
                      { bg: 'var(--ds-color-primary-500)', fg: previewOnPrimary },
                      { bg: 'var(--ds-color-warning-500)', fg: previewOnPrimary },
                      { bg: previewSurfaceMuted, fg: previewTextSecondary },
                    ];
                    return (
                      <span
                        key={label}
                        style={{
                          display: 'inline-block',
                          padding: '1px 8px',
                          borderRadius: 'var(--ds-badge-radius, var(--ds-radius-sm))',
                          fontSize: '11px',
                          fontWeight: 500,
                          backgroundColor: colors[i].bg,
                          color: colors[i].fg,
                        }}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Table -- native HTML table using design tokens for borders and text color.
                Status badges inside cells use --ds-badge-radius for consistent shape. */}
            {components.includes('table') && (
              <div>
                <div style={{ fontSize: '11px', color: previewTextSecondary, marginBottom: '6px' }}>Table</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${previewBorder}` }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: previewText }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: previewText }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600, color: previewText }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Project Alpha', status: 'Active', amount: '$12,400' },
                      { name: 'Project Beta', status: 'Pending', amount: '$8,200' },
                    ].map((row) => (
                      <tr key={row.name} style={{ borderBottom: `1px solid ${previewBorderMuted}` }}>
                        <td style={{ padding: '6px 8px', color: previewText }}>{row.name}</td>
                        <td style={{ padding: '6px 8px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0px 6px',
                            borderRadius: 'var(--ds-badge-radius, var(--ds-radius-sm))',
                            fontSize: '11px',
                            backgroundColor: row.status === 'Active'
                              ? 'var(--ds-color-primary-50)'
                              : 'var(--ds-color-surface-muted, var(--ds-color-bg-secondary))',
                            color: row.status === 'Active'
                              ? 'var(--ds-color-primary-500)'
                              : previewTextSecondary,
                          }}>
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: previewText }}>{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Personality Info -- auto-fill grid displays key personality tokens so
          designers can verify the preset maps to expected animation, shape, and
          typography behaviors. minmax(140px) keeps cells readable on narrow screens. */}
      {showPersonalityInfo && (
        <div>
          <span style={sectionLabel}>Personality: {personalityInfo.preset}</span>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '6px',
          }}>
            {[
              { label: 'Animation', value: personalityInfo.tokens.animation?.entrance ?? 'fade' },
              { label: 'Intensity', value: String(personalityInfo.tokens.animation?.intensity ?? 0.5) },
              { label: 'Card Elevation', value: personalityInfo.tokens.card?.defaultElevation ?? 'sm' },
              { label: 'Card Border', value: personalityInfo.tokens.card?.showBorder ? 'Yes' : 'No' },
              { label: 'Badge Shape', value: personalityInfo.tokens.accent?.badgeShape ?? 'rounded' },
              { label: 'Label Style', value: personalityInfo.tokens.typography?.labelStyle ?? 'sentence' },
              { label: 'Hover Lift', value: `${personalityInfo.tokens.animation?.hoverLift ?? 0}px` },
              { label: 'Accent Bar', value: personalityInfo.tokens.accent?.barPosition ?? 'top' },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  padding: '6px 8px',
                  backgroundColor: previewSurfaceSecondary,
                  border: `1px solid ${previewBorderMuted}`,
                  borderRadius: 'var(--ds-radius-sm, 4px)',
                }}
              >
                <div style={{ fontSize: '10px', color: previewTextSecondary, marginBottom: '1px' }}>{label}</div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: previewText }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
