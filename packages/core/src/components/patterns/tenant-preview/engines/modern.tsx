'use client';

/**
 * @fileoverview TenantPreview -- Modern engine (DaisyUI / Tailwind).
 * Renders a live preview of tenant branding inside a DaisyUI card.
 * Injects scoped CSS variables via a `<style>` tag so the preview
 * accurately reflects the tenant's color scheme. Shows palette swatches,
 * sample DaisyUI components (buttons, card, input, badges, table), and
 * personality token metadata in a responsive grid.
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
import { createTenantConfig } from '../../../../hooks/tenant/create-tenant';
import { resolvePersonalityPreset } from '../../../../hooks/tenant/personality-presets';
import { generateTenantCss } from '../../../../runtime/tenancy/storage/static/generator';

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
 * Modern (DaisyUI/Tailwind) implementation of the TenantPreview pattern.
 * Wraps everything in a DaisyUI card and injects scoped CSS via a
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
      className={`ds-pattern-tenant-preview ds-engine-modern card bg-base-100 shadow-md ${className ?? ''}`}
      style={style}
    >
      <style dangerouslySetInnerHTML={{ __html: previewCss }} />

      <div className="card-body gap-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-base-200">
          {creationConfig.logo && (
            <div className="avatar">
              <div className="w-8 rounded-lg">
                <img src={creationConfig.logo} alt={creationConfig.name} />
              </div>
            </div>
          )}
          <div>
            <h2 className="card-title text-lg">{creationConfig.name}</h2>
            <p className="text-xs opacity-60">
              {creationConfig.slug} | {creationConfig.engine ?? 'classic'} | {creationConfig.personality ?? 'neutral'}
            </p>
          </div>
        </div>

        {/* Color Palette */}
        {showColorPalette && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-3">
              Color Palette
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <div className="text-xs opacity-60 mb-1">Primary</div>
                <div className="flex rounded-lg overflow-hidden">
                  {primaryPalette.map(({ step, color }) => (
                    <div
                      key={step}
                      className="flex-1 h-8 flex items-center justify-center"
                      title={`${step}: ${color}`}
                      style={{ backgroundColor: color }}
                    >
                      {step === 500 && (
                        <span className="text-[9px] font-bold" style={{ color: primaryFg }}>500</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {secondaryPalette && (
                <div>
                  <div className="text-xs opacity-60 mb-1">Secondary</div>
                  <div className="flex rounded-lg overflow-hidden">
                    {secondaryPalette.map(({ step, color }) => (
                      <div
                        key={step}
                        className="flex-1 h-6"
                        title={`${step}: ${color}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Component Samples -- interactive (but non-functional) DaisyUI elements
            styled with the tenant's primary color to demonstrate real-world appearance.
            Each sample type is gated behind the components array for selective rendering. */}
        {components.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-3">
              Component Preview
            </div>
            <div className="flex flex-col gap-4">

              {/* Buttons -- inline style overrides DaisyUI's default palette with tenant color */}
              {components.includes('button') && (
                <div>
                  <div className="text-xs opacity-60 mb-2">Buttons</div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ backgroundColor: primary500, color: primaryFg, borderColor: primary500 }}
                    >
                      Primary
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      style={{ color: primary500, borderColor: primary500 }}
                    >
                      Outlined
                    </button>
                    <button type="button" className="btn btn-sm btn-ghost">
                      Default
                    </button>
                  </div>
                </div>
              )}

              {/* Card -- nested DaisyUI card with accent bar in tenant primary color */}
              {components.includes('card') && (
                <div>
                  <div className="text-xs opacity-60 mb-2">Card</div>
                  <div className="card card-compact bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body">
                      {/* Accent bar reinforces brand identity within card containers */}
                      <div className="h-1 rounded-full mb-2" style={{ backgroundColor: primary500 }} />
                      <h3 className="font-semibold text-sm">Sample Card Title</h3>
                      <p className="text-xs opacity-60">
                        This card demonstrates the tenant branding applied to a container component.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {components.includes('input') && (
                <div>
                  <div className="text-xs opacity-60 mb-2">Input</div>
                  <input
                    type="text"
                    placeholder="Type something..."
                    readOnly
                    className="input input-bordered input-sm w-full max-w-xs"
                  />
                </div>
              )}

              {/* Badge -- primary badge uses tenant color; warning/ghost use DaisyUI defaults */}
              {components.includes('badge') && (
                <div>
                  <div className="text-xs opacity-60 mb-2">Badges</div>
                  <div className="flex gap-2 flex-wrap">
                    {/* Primary badge overrides DaisyUI color with tenant's primary */}
                    <span
                      className="badge badge-sm"
                      style={{ backgroundColor: primary500, color: primaryFg, borderColor: primary500 }}
                    >
                      Active
                    </span>
                    <span className="badge badge-sm badge-warning">Pending</span>
                    <span className="badge badge-sm badge-ghost">Draft</span>
                  </div>
                </div>
              )}

              {/* Table -- DaisyUI table with inline status badges using 8% opacity primary */}
              {components.includes('table') && (
                <div>
                  <div className="text-xs opacity-60 mb-2">Table</div>
                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Status</th>
                          <th className="text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Project Alpha</td>
                          <td>
                            {/* "18" hex suffix = ~9% opacity for a subtle colored background */}
                            <span
                              className="badge badge-sm"
                              style={{ backgroundColor: `${primary500}18`, color: primary500, border: 'none' }}
                            >
                              Active
                            </span>
                          </td>
                          <td className="text-right">$12,400</td>
                        </tr>
                        <tr>
                          <td>Project Beta</td>
                          <td><span className="badge badge-sm badge-ghost">Pending</span></td>
                          <td className="text-right">$8,200</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Personality Info -- responsive grid (2 cols on mobile, 4 on sm+) showing
            key personality tokens so designers can verify the preset configuration. */}
        {showPersonalityInfo && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-3">
              Personality: {personalityInfo.preset}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                <div key={label} className="bg-base-200 rounded-md p-2">
                  <div className="text-[11px] opacity-50">{label}</div>
                  <div className="text-xs font-medium">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
