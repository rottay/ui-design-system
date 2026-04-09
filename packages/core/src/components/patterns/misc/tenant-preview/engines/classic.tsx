'use client';

/**
 * @fileoverview TenantPreview -- Classic engine (Ant Design / inline styles).
 * Renders a live preview of tenant branding by injecting generated CSS
 * variables into a scoped container. Shows color palette swatches,
 * sample UI components (button, card, input, badge, table), and
 * personality token metadata. Uses inline styles with --ds-* token
 * references for the preview chrome itself.
 *
 * @example
 * <ClassicTenantPreview
 *   config={{ name: 'Acme', slug: 'acme', primaryColor: '#3b82f6', engine: 'classic' }}
 *   components={['button', 'card']}
 *   showColorPalette
 * />
 */

import React, { useMemo, useEffect, useRef } from 'react';
import type { TenantPreviewProps, PreviewComponent } from '../TenantPreview.types';
import { createTenantConfig } from '../../../../../hooks/tenant/create-tenant';
import { resolvePersonalityPreset } from '../../../../../hooks/tenant/personality-presets';
import { generateTenantCss } from '../../../../../runtime/tenancy/storage/static/generator';

/** Default set of component samples to display when none specified */
const ALL_COMPONENTS: PreviewComponent[] = ['button', 'card', 'input', 'badge', 'table'];

/**
 * Parses a hex color string into RGB components.
 * Handles both shorthand (#abc) and full (#aabbcc) formats.
 * Used by the palette generation utilities below.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;
  const match = /^#([0-9a-fA-F]{6})$/.exec(normalized);
  if (!match) return null;
  const parsed = Number.parseInt(match[1], 16);
  return { r: (parsed >> 16) & 255, g: (parsed >> 8) & 255, b: parsed & 255 };
}

/** Linearly interpolates between two hex colors at the given ratio (0-1) */
function mixColor(base: string, target: string, ratio: number): string {
  const b = hexToRgb(base);
  const t = hexToRgb(target);
  if (!b || !t) return base;
  const r = Math.round(b.r + (t.r - b.r) * ratio);
  const g = Math.round(b.g + (t.g - b.g) * ratio);
  const bl = Math.round(b.b + (t.b - b.b) * ratio);
  return `#${[r, g, bl].map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('')}`;
}

/** Generates a 10-step palette (50-900) by mixing the base color with white/black */
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

/** Returns black or white text color for optimal contrast against the given background */
function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  return luminance > 186 ? '#171717' : '#ffffff';
}

/**
 * Classic (inline styles) implementation of the TenantPreview pattern.
 * Injects scoped CSS via a `<style>` tag and sets `data-tenant` on the
 * container so the generated CSS variables apply only within the preview.
 *
 * @param props - See {@link TenantPreviewProps} for the full prop contract.
 * @returns The rendered tenant preview with palette, components, and personality info.
 */
export default function ClassicTenantPreview(props: TenantPreviewProps) {
  const {
    config: creationConfig,
    components = ALL_COMPONENTS,
    showColorPalette = true,
    showPersonalityInfo = true,
    className,
    style,
  } = props;

  const previewRef = useRef<HTMLDivElement>(null);

  /* Build a full tenant config from the creation input -- memoized to avoid recalc */
  const tenantConfig = useMemo(
    () => createTenantConfig(creationConfig),
    [creationConfig]
  );

  /* Resolve personality preset tokens for the info grid display */
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

  /* Generate scoped CSS; dark mode selectors excluded since this is a preview card */
  const previewCss = useMemo(() => generateTenantCss(tenantConfig, {
    includeDarkSelector: false,
    includeSystemDarkSelector: false,
  }), [tenantConfig]);

  /* Set data-tenant attribute so the injected CSS scopes correctly to this container.
     Cleanup removes the attribute to avoid leaking into other previews. */
  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;
    container.setAttribute('data-tenant', tenantConfig.slug);
    return () => {
      container.removeAttribute('data-tenant');
    };
  }, [tenantConfig.slug]);

  /* Shorthand color references used throughout the component samples */
  const primary500 = creationConfig.primaryColor;
  const primaryFg = getContrastColor(primary500);
  const textPrimary = 'var(--ds-color-text-primary, var(--ds-color-text))';
  const textSecondary = 'var(--ds-color-text-secondary, var(--ds-color-text-muted))';
  const textTertiary = 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))';
  const bgPrimary = 'var(--ds-color-bg-primary, var(--ds-color-bg-elevated, #ffffff))';
  const bgSecondary = 'var(--ds-color-bg-secondary, var(--ds-color-bg-muted))';
  const borderPrimary = 'var(--ds-color-border-primary, var(--ds-color-alpha-black-10))';
  const borderSubtle = 'var(--ds-color-border-secondary, var(--ds-color-alpha-black-5))';

  const sectionStyle: React.CSSProperties = {
    marginBottom: '24px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: textTertiary,
    marginBottom: '12px',
    display: 'block',
  };

  return (
    <div
      ref={previewRef}
      className={`ds-pattern-tenant-preview ds-engine-classic ${className ?? ''}`}
      style={{
        padding: '24px',
        borderRadius: '12px',
        border: `1px solid ${borderPrimary}`,
        backgroundColor: bgPrimary,
        ...style,
      }}
    >
      {/* Inject the generated CSS via style tag within the component */}
      <style dangerouslySetInnerHTML={{ __html: previewCss }} />

      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: `1px solid ${borderPrimary}`, paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {creationConfig.logo && (
            <img
              src={creationConfig.logo}
              alt={creationConfig.name}
              style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
            />
          )}
          <div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: textPrimary }}>
              {creationConfig.name}
            </div>
            <div style={{ fontSize: '13px', color: textTertiary }}>
              {creationConfig.slug} | {creationConfig.engine ?? 'classic'} | {creationConfig.personality ?? 'neutral'}
            </div>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      {showColorPalette && (
        <div style={sectionStyle}>
          <span style={labelStyle}>Color Palette</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '4px' }}>
                Primary
              </div>
              <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden' }}>
                {primaryPalette.map(({ step, color }) => (
                  <div
                    key={step}
                    title={`${step}: ${color}`}
                    style={{
                      flex: 1,
                      height: '32px',
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
                <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '4px' }}>
                  Secondary
                </div>
                <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden' }}>
                  {secondaryPalette.map(({ step, color }) => (
                    <div
                      key={step}
                      title={`${step}: ${color}`}
                      style={{
                        flex: 1,
                        height: '24px',
                        backgroundColor: color,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Component Samples -- renders interactive (but non-functional) UI samples
          that reflect the tenant's branding. Each sample type is gated behind the
          components array so consumers can cherry-pick which previews to show. */}
      {components.length > 0 && (
        <div style={sectionStyle}>
          <span style={labelStyle}>Component Preview</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Buttons -- primary/outlined/default trio shows the color hierarchy */}
            {components.includes('button') && (
              <div>
                <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '8px' }}>
                  Buttons
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    style={{
                      backgroundColor: primary500,
                      color: primaryFg,
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Primary
                  </button>
                  <button
                    type="button"
                    style={{
                      backgroundColor: 'transparent',
                      color: primary500,
                      border: `1px solid ${primary500}`,
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Outlined
                  </button>
                  <button
                    type="button"
                    style={{
                      backgroundColor: bgSecondary,
                      color: textPrimary,
                      border: `1px solid ${borderPrimary}`,
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Default
                  </button>
                </div>
              </div>
            )}

            {/* Card -- border visibility respects the tenant's personality.card.showBorder token.
                The colored accent bar at the top reinforces brand identity within containers. */}
            {components.includes('card') && (
              <div>
                <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '8px' }}>
                  Card
                </div>
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    /* Personality token controls whether the card has a visible border */
                    border: tenantConfig.personality?.card?.showBorder !== false
                      ? `1px solid ${borderPrimary}`
                      : 'none',
                    boxShadow: 'var(--ds-shadow-sm)',
                    backgroundColor: bgPrimary,
                  }}
                >
                  {/* Accent bar -- thin colored strip that establishes brand presence */}
                  <div style={{
                    width: '100%',
                    height: '3px',
                    backgroundColor: primary500,
                    borderRadius: '2px',
                    marginBottom: '12px',
                  }} />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: textPrimary }}>
                    Sample Card Title
                  </div>
                  <div style={{ fontSize: '13px', color: textTertiary, marginTop: '4px' }}>
                    This card demonstrates the tenant branding applied to a container component.
                  </div>
                </div>
              </div>
            )}

            {/* Input */}
            {components.includes('input') && (
              <div>
                <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '8px' }}>
                  Input
                </div>
                <input
                  type="text"
                  placeholder="Type something..."
                  readOnly
                  style={{
                    width: '100%',
                    maxWidth: '320px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${borderPrimary}`,
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: bgPrimary,
                    color: textPrimary,
                  }}
                />
              </div>
            )}

            {/* Badge -- three variants (Active/Pending/Draft) demonstrate the badge shape
                token from the personality preset (pill, square, or default rounded). */}
            {components.includes('badge') && (
              <div>
                <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '8px' }}>
                  Badges
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Active', 'Pending', 'Draft'].map((label, i) => {
                    /* Each badge uses a different color tier: primary, warning, neutral */
                    const colors = [
                      { bg: primary500, fg: primaryFg },
                      { bg: 'var(--ds-color-warning)', fg: 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))' },
                      { bg: bgSecondary, fg: textPrimary },
                    ];
                    /* Badge border-radius driven by personality accent token */
                    const badgeRadius = tenantConfig.personality?.accent?.badgeShape === 'pill'
                      ? '9999px'
                      : tenantConfig.personality?.accent?.badgeShape === 'square'
                        ? '4px'
                        : '6px';
                    return (
                      <span
                        key={label}
                        style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: badgeRadius,
                          fontSize: '12px',
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

            {/* Table -- two sample rows with inline status badges showing how the
                primary color integrates into data-dense views (8% opacity background). */}
            {components.includes('table') && (
              <div>
                <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '8px' }}>
                  Table
                </div>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px',
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${borderPrimary}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: textPrimary }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: textPrimary }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600, color: textPrimary }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Project Alpha', status: 'Active', amount: '$12,400' },
                      { name: 'Project Beta', status: 'Pending', amount: '$8,200' },
                    ].map((row) => (
                      <tr key={row.name} style={{ borderBottom: `1px solid ${borderSubtle}` }}>
                        <td style={{ padding: '8px 12px', color: textPrimary }}>{row.name}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '1px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: row.status === 'Active'
                              ? `${primary500}18`
                              : bgSecondary,
                            color: row.status === 'Active'
                              ? primary500
                              : textSecondary,
                          }}>
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: textPrimary }}>{row.amount}</td>
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
          designers can verify that the preset maps to the expected behaviors.
          Each cell shows a label/value pair from the resolved personality preset. */}
      {showPersonalityInfo && (
        <div style={sectionStyle}>
          <span style={labelStyle}>Personality: {personalityInfo.preset}</span>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '8px',
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
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: bgSecondary,
                  border: `1px solid ${borderSubtle}`,
                }}
              >
                <div style={{ fontSize: '11px', color: textTertiary, marginBottom: '2px' }}>
                  {label}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: textPrimary }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
