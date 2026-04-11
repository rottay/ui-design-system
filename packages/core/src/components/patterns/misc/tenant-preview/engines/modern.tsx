'use client';

/**
 * @fileoverview TenantPreview -- Modern engine (DS tokens only).
 * Renders a live preview of tenant branding inside a token-styled card.
 * Injects scoped CSS variables via a `<style>` tag so the preview
 * accurately reflects the tenant's color scheme. Shows palette swatches,
 * sample DS-token components (buttons, card, input, badges, table), and
 * personality token metadata in a responsive grid.
 *
 * Zero DaisyUI / Tailwind utility classes -- all styling via inline DS tokens.
 *
 * @example
 * <ModernTenantPreview
 *   config={{ name: 'Acme', slug: 'acme', primaryColor: '#3b82f6', engine: 'modern' }}
 *   components={['button', 'badge']}
 *   showColorPalette
 * />
 */

import React, { useMemo, useEffect, useRef } from 'react';
import type { TenantPreviewProps, PreviewComponent } from '../TenantPreview.types';
import { createTenantConfig } from '../../../../../runtime/tenant/authoring/create-tenant';
import { resolvePersonalityPreset } from '../../../../../runtime/tenant/presets';
import { generateTenantCss } from '../../../../../runtime/tenant/storage/static/generator';

/** Default component samples shown when none specified */
const ALL_COMPONENTS: PreviewComponent[] = ['button', 'card', 'input', 'badge', 'table'];

/* ------------------------------------------------------------------ */
/*  Shared inline style fragments                                     */
/* ------------------------------------------------------------------ */

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  opacity: 0.5,
  marginBottom: 12,
};

const subLabelStyle: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.6,
  marginBottom: 8,
};

const badgeBaseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 20,
  padding: '0 8px',
  fontSize: 11,
  fontWeight: 500,
  borderRadius: 'var(--ds-radius-full)',
  border: 'none',
  lineHeight: 1,
  whiteSpace: 'nowrap',
};

/* ------------------------------------------------------------------ */
/*  Color helpers                                                     */
/* ------------------------------------------------------------------ */

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
 * Modern (DS-token) implementation of the TenantPreview pattern.
 * Wraps everything in a token-styled card and injects scoped CSS via a
 * `<style>` tag with `data-tenant` scoping on the container.
 *
 * @param props - See {@link TenantPreviewProps} for the full prop contract.
 * @returns The rendered tenant preview card.
 */
export default function ModernTenantPreview(props: TenantPreviewProps) {
  const {
    config: creationConfig,
    components = ALL_COMPONENTS,
    showColorPalette = true,
    showPersonalityInfo = true,
    className,
    style,
  } = props;

  const previewRef = useRef<HTMLDivElement>(null);

  /* Build full tenant config from creation input -- memoized for performance */
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

  /* Generate scoped CSS; dark mode excluded since this is a preview card */
  const previewCss = useMemo(() => generateTenantCss(tenantConfig, {
    includeDarkSelector: false,
    includeSystemDarkSelector: false,
  }), [tenantConfig]);

  /* Set data-tenant attribute for CSS scoping; cleanup on unmount */
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

  return (
    <div
      ref={previewRef}
      className={`ds-pattern-tenant-preview ds-engine-modern ${className ?? ''}`}
      style={{ background: 'var(--ds-surface-card)', borderRadius: 'var(--ds-radius-lg)', boxShadow: 'var(--ds-elevation-1)', ...style }}
    >
      <style dangerouslySetInnerHTML={{ __html: previewCss }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--ds-color-border)' }}>
          {creationConfig.logo && (
            <div style={{ width: 32, height: 32, borderRadius: 'var(--ds-radius-md)', overflow: 'hidden', flexShrink: 0 }}>
              <img src={creationConfig.logo} alt={creationConfig.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3, margin: 0, color: 'var(--ds-color-text-primary)' }}>{creationConfig.name}</h2>
            <p style={{ fontSize: 12, opacity: 0.6, margin: 0, color: 'var(--ds-color-text-secondary)' }}>
              {creationConfig.slug} | {creationConfig.engine ?? 'classic'} | {creationConfig.personality ?? 'neutral'}
            </p>
          </div>
        </div>

        {/* Color Palette */}
        {showColorPalette && (
          <div>
            <div style={sectionLabelStyle}>
              Color Palette
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>Primary</div>
                <div style={{ display: 'flex', borderRadius: 'var(--ds-radius-md)', overflow: 'hidden' }}>
                  {primaryPalette.map(({ step, color }) => (
                    <div
                      key={step}
                      title={`${step}: ${color}`}
                      style={{ flex: 1, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: color }}
                    >
                      {step === 500 && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: primaryFg }}>500</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {secondaryPalette && (
                <div>
                  <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>Secondary</div>
                  <div style={{ display: 'flex', borderRadius: 'var(--ds-radius-md)', overflow: 'hidden' }}>
                    {secondaryPalette.map(({ step, color }) => (
                      <div
                        key={step}
                        title={`${step}: ${color}`}
                        style={{ flex: 1, height: 24, backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Component Samples -- non-functional DS-token elements
            styled with the tenant's primary color to demonstrate real-world appearance.
            Each sample type is gated behind the components array for selective rendering. */}
        {components.length > 0 && (
          <div>
            <div style={sectionLabelStyle}>
              Component Preview
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Buttons -- inline token styles with tenant color */}
              {components.includes('button') && (
                <div>
                  <div style={subLabelStyle}>Buttons</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer', backgroundColor: primary500, color: primaryFg }}
                    >
                      Primary
                    </button>
                    <button
                      type="button"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: `1px solid ${primary500}`, cursor: 'pointer', background: 'transparent', color: primary500 }}
                    >
                      Outlined
                    </button>
                    <button type="button" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--ds-color-text-primary)' }}>
                      Default
                    </button>
                  </div>
                </div>
              )}

              {/* Card -- token-styled card with accent bar in tenant primary color */}
              {components.includes('card') && (
                <div>
                  <div style={subLabelStyle}>Card</div>
                  <div style={{ background: 'var(--ds-surface-card)', border: '1px solid var(--ds-color-border)', borderRadius: 'var(--ds-radius-md)', boxShadow: 'var(--ds-elevation-1)' }}>
                    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {/* Accent bar reinforces brand identity within card containers */}
                      <div style={{ height: 4, borderRadius: 'var(--ds-radius-full)', marginBottom: 8, backgroundColor: primary500 }} />
                      <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--ds-color-text-primary)' }}>Sample Card Title</h3>
                      <p style={{ fontSize: 12, opacity: 0.6, margin: 0, color: 'var(--ds-color-text-secondary)' }}>
                        This card demonstrates the tenant branding applied to a container component.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {components.includes('input') && (
                <div>
                  <div style={subLabelStyle}>Input</div>
                  <input
                    type="text"
                    placeholder="Type something..."
                    readOnly
                    style={{
                      height: 32,
                      padding: '0 12px',
                      fontSize: 13,
                      border: '1px solid var(--ds-color-border)',
                      borderRadius: 'var(--ds-radius-md)',
                      background: 'var(--ds-surface-card)',
                      color: 'var(--ds-color-text-primary)',
                      outline: 'none',
                      width: '100%',
                      maxWidth: 320,
                    }}
                  />
                </div>
              )}

              {/* Badge -- primary badge uses tenant color; warning and neutral use DS tokens */}
              {components.includes('badge') && (
                <div>
                  <div style={subLabelStyle}>Badges</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {/* Primary badge with tenant's primary color */}
                    <span
                      style={{ ...badgeBaseStyle, backgroundColor: primary500, color: primaryFg }}
                    >
                      Active
                    </span>
                    <span style={{ ...badgeBaseStyle, background: 'color-mix(in srgb, var(--ds-color-warning) 15%, transparent)', color: 'var(--ds-color-warning)' }}>Pending</span>
                    <span style={{ ...badgeBaseStyle, background: 'var(--ds-surface-panel)', color: 'var(--ds-color-text-secondary)' }}>Draft</span>
                  </div>
                </div>
              )}

              {/* Table -- DS-token table with inline status badges */}
              {components.includes('table') && (
                <div>
                  <div style={subLabelStyle}>Table</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--ds-color-border)' }}>
                          <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, fontSize: 12, color: 'var(--ds-color-text-secondary)' }}>Name</th>
                          <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, fontSize: 12, color: 'var(--ds-color-text-secondary)' }}>Status</th>
                          <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600, fontSize: 12, color: 'var(--ds-color-text-secondary)' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid var(--ds-color-border)' }}>
                          <td style={{ padding: '8px 12px', color: 'var(--ds-color-text-primary)' }}>Project Alpha</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span
                              style={{ ...badgeBaseStyle, backgroundColor: `${primary500}18`, color: primary500 }}
                            >
                              Active
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--ds-color-text-primary)' }}>$12,400</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 12px', color: 'var(--ds-color-text-primary)' }}>Project Beta</td>
                          <td style={{ padding: '8px 12px' }}><span style={{ ...badgeBaseStyle, background: 'var(--ds-surface-panel)', color: 'var(--ds-color-text-secondary)' }}>Pending</span></td>
                          <td style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--ds-color-text-primary)' }}>$8,200</td>
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
            <div style={sectionLabelStyle}>
              Personality: {personalityInfo.preset}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
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
                <div key={label} style={{ borderRadius: 'var(--ds-radius-md)', padding: 8, background: 'var(--ds-surface-inset)' }}>
                  <div style={{ fontSize: 11, opacity: 0.5 }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
