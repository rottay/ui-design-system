'use client';

/**
 * TenantPreview - Modern Engine (DaisyUI/Tailwind)
 *
 * Same preview functionality as Classic but styled with Tailwind/DaisyUI classes.
 */

import React, { useMemo, useEffect, useRef } from 'react';
import type { TenantPreviewProps, PreviewComponent } from '../TenantPreview.types';
import { createTenantConfig } from '../../../../hooks/tenant/create-tenant';
import { resolvePersonalityPreset } from '../../../../hooks/tenant/personality-presets';
import { generateTenantCss } from '../../../../tenancy/storage/static/generator';

const ALL_COMPONENTS: PreviewComponent[] = ['button', 'card', 'input', 'badge', 'table'];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;
  const match = /^#([0-9a-fA-F]{6})$/.exec(normalized);
  if (!match) return null;
  const parsed = Number.parseInt(match[1], 16);
  return { r: (parsed >> 16) & 255, g: (parsed >> 8) & 255, b: parsed & 255 };
}

function mixColor(base: string, target: string, ratio: number): string {
  const b = hexToRgb(base);
  const t = hexToRgb(target);
  if (!b || !t) return base;
  const r = Math.round(b.r + (t.r - b.r) * ratio);
  const g = Math.round(b.g + (t.g - b.g) * ratio);
  const bl = Math.round(b.b + (t.b - b.b) * ratio);
  return `#${[r, g, bl].map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('')}`;
}

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

function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  return luminance > 186 ? '#171717' : '#ffffff';
}

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

  const tenantConfig = useMemo(
    () => createTenantConfig(creationConfig),
    [creationConfig]
  );

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

  const previewCss = useMemo(() => generateTenantCss(tenantConfig, {
    includeDarkSelector: false,
    includeSystemDarkSelector: false,
  }), [tenantConfig]);

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

        {/* Component Samples */}
        {components.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-3">
              Component Preview
            </div>
            <div className="flex flex-col gap-4">

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

              {components.includes('card') && (
                <div>
                  <div className="text-xs opacity-60 mb-2">Card</div>
                  <div className="card card-compact bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body">
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

              {components.includes('badge') && (
                <div>
                  <div className="text-xs opacity-60 mb-2">Badges</div>
                  <div className="flex gap-2 flex-wrap">
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

        {/* Personality Info */}
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
