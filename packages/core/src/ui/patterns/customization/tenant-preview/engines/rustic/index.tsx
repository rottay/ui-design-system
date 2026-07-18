'use client';

/**
 * @fileoverview TenantPreview -- Rustic engine (Vanilla / CSS variables).
 * Renders a live preview of tenant branding with static paint in the rustic
 * skin and tenant-derived paint kept inline. Injects scoped CSS via a `<style>`
 * tag for accurate color representation. Shows palette swatches, sample
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
import type { TenantPreviewProps, PreviewComponent } from '../../contracts';
import { createTenantConfig } from '../../../../../../infrastructure/runtime/tenant/runtime/authoring/configuration';
import { resolvePersonalityPreset } from '../../../../../../infrastructure/runtime/tenant/foundation/personality/presets';
import { buildPreviewCss } from '../../runtime/preview-css';

/** Default component samples shown when none specified */
const ALL_COMPONENTS: PreviewComponent[] = ['button', 'card', 'input', 'badge', 'table'];

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

  /* Build full tenant config from creation input */
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

  const primary500 = creationConfig.primaryColor;
  const primaryFg = getContrastColor(primary500);

  const sectionLabel: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '10px',
    display: 'block',
  };

  return (
    <div
      ref={previewRef}
      className={`ds-pattern-tenant-preview ds-engine-rustic ${className ?? ''}`}
      data-part="root"
      /* Literal form of PREVIEW_SCOPE_ATTRIBUTE: every buildPreviewCss selector
         anchors on this attribute, and the contract tests query it by the
         exported constant. */
      data-ds-tenant-preview-root={preview.safeSlug}
      style={{
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        ...style,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: preview.css }} />

      {/* Header */}
      <div
        data-part="header"
        style={{
          marginBottom: '20px',
          paddingBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {creationConfig.logo && (
            <img
              src={creationConfig.logo}
              alt={creationConfig.name}
              data-part="logo"
              style={{
                width: '28px',
                height: '28px',
                objectFit: 'cover',
              }}
            />
          )}
          <div>
            <div data-part="tenant-name" style={{ fontSize: '16px', fontWeight: 600 }}>
              {creationConfig.name}
            </div>
            <div data-part="tenant-slug" style={{ fontSize: '12px' }}>
              {creationConfig.slug} | {creationConfig.engine ?? 'classic'} | {creationConfig.personality ?? 'neutral'}
            </div>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      {showColorPalette && (
        <div data-part="palette" style={{ marginBottom: '20px' }}>
          <span data-part="swatch-label" data-palette="all" style={sectionLabel}>
            Color Palette
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div data-palette="primary">
              <div
                data-part="swatch-label"
                data-palette="primary"
                style={{
                  fontSize: '11px',
                  marginBottom: '3px',
                }}
              >
                Primary
              </div>
              <div
                data-part="palette"
                data-palette="primary"
                style={{
                  display: 'flex',
                  overflow: 'hidden',
                }}
              >
                {primaryPalette.map(({ step, color }) => (
                  <div
                    key={step}
                    title={`${step}: ${color}`}
                    data-part="swatch"
                    data-palette="primary"
                    data-step={step}
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
                      <span
                        data-part="swatch-label"
                        data-palette="primary"
                        data-step={step}
                        style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          color: primaryFg,
                        }}
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
                <div
                  data-part="swatch-label"
                  data-palette="secondary"
                  style={{
                    fontSize: '11px',
                    marginBottom: '3px',
                  }}
                >
                  Secondary
                </div>
                <div
                  data-part="palette"
                  data-palette="secondary"
                  style={{
                    display: 'flex',
                    overflow: 'hidden',
                  }}
                >
                  {secondaryPalette.map(({ step, color }) => (
                    <div
                      key={step}
                      title={`${step}: ${color}`}
                      data-part="swatch"
                      data-palette="secondary"
                      data-step={step}
                      style={{
                        flex: 1,
                        height: '20px',
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
                <div
                  style={{
                    fontSize: '11px',
                    marginBottom: '6px',
                  }}
                >
                  Buttons
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    data-part="button"
                    data-variant="primary"
                    style={{
                      padding: '6px 14px',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Primary
                  </button>
                  <button
                    type="button"
                    data-part="button"
                    data-variant="outlined"
                    style={{
                      padding: '6px 14px',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Outlined
                  </button>
                  <button
                    type="button"
                    data-part="button"
                    data-variant="default"
                    style={{
                      padding: '6px 14px',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Default
                  </button>
                </div>
              </div>
            )}

            {/* Card -- all visual properties flow from --ds-card-* tokens with generic fallbacks. */}
            {components.includes('card') && (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    marginBottom: '6px',
                  }}
                >
                  Card
                </div>
                <div
                  data-part="sample-card"
                  style={{
                    padding: '14px',
                  }}
                >
                  <div
                    data-part="preview-card-title"
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    Sample Card Title
                  </div>
                  <div
                    data-part="preview-card-body"
                    style={{
                      fontSize: '12px',
                      marginTop: '4px',
                    }}
                  >
                    This card demonstrates the tenant branding applied to a container component.
                  </div>
                </div>
              </div>
            )}

            {/* Input -- readOnly to prevent user interaction; styled with --ds-input-* tokens */}
            {components.includes('input') && (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    marginBottom: '6px',
                  }}
                >
                  Input
                </div>
                <input
                  type="text"
                  placeholder="Type something..."
                  readOnly
                  data-part="sample-input"
                  style={{
                    width: '100%',
                    maxWidth: '280px',
                    padding: '6px 10px',
                    fontSize: '13px',
                  }}
                />
              </div>
            )}

            {/* Badge -- three tiers (primary, warning, neutral) using --ds-badge-radius
                for consistent shape across the tenant theme. */}
            {components.includes('badge') && (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    marginBottom: '6px',
                  }}
                >
                  Badges
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['Active', 'Pending', 'Draft'].map((label) => {
                    return (
                      <span
                        key={label}
                        data-part="badge"
                        data-status={label.toLowerCase()}
                        style={{
                          display: 'inline-block',
                          padding: '1px 8px',
                          fontSize: '11px',
                          fontWeight: 500,
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
                <div
                  style={{
                    fontSize: '11px',
                    marginBottom: '6px',
                  }}
                >
                  Table
                </div>
                <table
                  data-part="sample-table"
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                  }}
                >
                  <thead>
                    <tr data-part="table-head">
                      <th
                        data-part="preview-table-cell"
                        data-variant="head"
                        style={{
                          textAlign: 'left',
                          padding: '6px 8px',
                          fontWeight: 600,
                        }}
                      >
                        Name
                      </th>
                      <th
                        data-part="preview-table-cell"
                        data-variant="head"
                        style={{
                          textAlign: 'left',
                          padding: '6px 8px',
                          fontWeight: 600,
                        }}
                      >
                        Status
                      </th>
                      <th
                        data-part="preview-table-cell"
                        data-variant="head"
                        style={{
                          textAlign: 'right',
                          padding: '6px 8px',
                          fontWeight: 600,
                        }}
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        name: 'Project Alpha',
                        status: 'Active',
                        amount: '$12,400',
                      },
                      {
                        name: 'Project Beta',
                        status: 'Pending',
                        amount: '$8,200',
                      },
                    ].map((row) => (
                      <tr
                        key={row.name}
                      >
                        <td data-part="preview-table-cell" style={{ padding: '6px 8px' }}>
                          {row.name}
                        </td>
                        <td data-part="preview-table-cell" style={{ padding: '6px 8px' }}>
                          <span
                            data-part="badge"
                            data-status={row.status.toLowerCase()}
                            style={{
                              display: 'inline-block',
                              padding: '0px 6px',
                              fontSize: '11px',
                            }}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td
                          data-part="preview-table-cell"
                          style={{
                            padding: '6px 8px',
                            textAlign: 'right',
                          }}
                        >
                          {row.amount}
                        </td>
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
          <span data-part="swatch-label" data-palette="personality" style={sectionLabel}>
            Personality: {personalityInfo.preset}
          </span>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '6px',
            }}
          >
            {[
              {
                label: 'Animation',
                value: personalityInfo.tokens.animation?.entrance ?? 'fade',
              },
              {
                label: 'Intensity',
                value: String(personalityInfo.tokens.animation?.intensity ?? 0.5),
              },
              {
                label: 'Card Elevation',
                value: personalityInfo.tokens.card?.defaultElevation ?? 'sm',
              },
              {
                label: 'Card Border',
                value: personalityInfo.tokens.card?.showBorder ? 'Yes' : 'No',
              },
              {
                label: 'Badge Shape',
                value: personalityInfo.tokens.accent?.badgeShape ?? 'rounded',
              },
              {
                label: 'Label Style',
                value: personalityInfo.tokens.typography?.labelStyle ?? 'sentence',
              },
              {
                label: 'Hover Lift',
                value: `${personalityInfo.tokens.animation?.hoverLift ?? 0}px`,
              },
              {
                label: 'Edge Accent',
                value: 'Disabled',
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                data-part="personality-tile"
                style={{
                  padding: '6px 8px',
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    marginBottom: '1px',
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
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
