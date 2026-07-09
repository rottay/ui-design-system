/**
 * @fileoverview Branding Preview Sandbox - Live preview of branding changes.
 *
 * Renders a gallery of representative DS components with a proposed
 * TenantAppearance applied in an isolated CSS scope. Used by tenant admins
 * to preview branding changes before saving.
 *
 * Uses CSS scope isolation via data-tenant attribute to prevent style
 * collisions with the admin's own dashboard.
 *
 * @example
 * ```tsx
 * import { BrandingPreviewSandbox } from '@rottay/design-system';
 *
 * <BrandingPreviewSandbox
 *   appearance={{
 *     general: { palette: { primary: '#FF0000' } },
 *     advanced: { chrome: { controls: { buttonPrimary: { bg: '#FF0000' } } } },
 *   }}
 * />
 * ```
 *
 * @module BrandingPreviewSandbox
 * @category Patterns/Misc
 * @package @rottay/design-system
 */

'use client';

import React, { useMemo, useId } from 'react';
import type { TenantAppearance } from '../../../../contracts/themes';

// Lazy import to avoid pulling appearance compiler into main bundle
// when sandbox is not used (tree-shaken)
import { appearanceToVariables } from '../../../../compilers/appearance';

interface BrandingPreviewSandboxProps {
  /** Proposed tenant appearance to preview. */
  appearance: TenantAppearance;
  /** Additional raw CSS variables to inject. */
  extraVars?: Record<string, string>;
  /** Show section labels. Default: true */
  showLabels?: boolean;
  /** Compact mode (fewer components). Default: false */
  compact?: boolean;
}

/**
 * Live preview sandbox for tenant branding changes.
 * Renders representative DS components in an isolated CSS scope.
 */
export function BrandingPreviewSandbox({
  appearance,
  extraVars,
  showLabels = true,
  compact = false,
}: BrandingPreviewSandboxProps): React.ReactElement {
  const sandboxId = useId().replace(/:/g, '');
  const scopeAttr = `data-preview-${sandboxId}`;

  // Compile appearance to CSS variables
  const cssVars = useMemo(() => {
    const vars = appearanceToVariables(appearance);
    if (extraVars) Object.assign(vars, extraVars);
    return vars;
  }, [appearance, extraVars]);

  // Build scoped CSS string
  const scopedCss = useMemo(() => {
    const entries = Object.entries(cssVars);
    if (entries.length === 0) return '';
    const declarations = entries.map(([k, v]) => `  ${k}: ${v};`).join('\n');
    return `[${scopeAttr}] {\n${declarations}\n}`;
  }, [cssVars, scopeAttr]);

  const sectionStyle: React.CSSProperties = {
    marginBottom: 16,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: 'var(--ds-color-text-muted)',
    marginBottom: 8,
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
    alignItems: 'center',
  };

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 16px',
    borderRadius: 'var(--ds-radius-md, 8px)',
    fontSize: 13,
    fontWeight: 500,
    border: '1px solid transparent',
    cursor: 'default',
    fontFamily: 'var(--ds-font-family-base, inherit)',
  };

  const inputBase: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 'var(--ds-radius-md, 8px)',
    fontSize: 13,
    border: '1px solid var(--ds-input-border, var(--ds-color-border))',
    background: 'var(--ds-input-bg, var(--ds-color-bg-primary))',
    color: 'var(--ds-input-color, var(--ds-color-text-primary))',
    fontFamily: 'var(--ds-font-family-base, inherit)',
    width: 200,
    outline: 'none',
  };

  const cardBase: React.CSSProperties = {
    padding: 16,
    borderRadius: 'var(--ds-radius-lg, 12px)',
    border: '1px solid var(--ds-card-border, var(--ds-color-border))',
    background: 'var(--ds-card-bg, var(--ds-color-bg-elevated, #fff))',
    width: compact ? 200 : 260,
  };

  return React.createElement(React.Fragment, null,
    // Inject scoped CSS
    React.createElement('style', {
      dangerouslySetInnerHTML: { __html: scopedCss },
    }),

    // Sandbox container
    React.createElement('div', {
      [scopeAttr]: '',
      style: {
        background: 'var(--ds-color-bg-primary, var(--ds-layout-bg, #fff))',
        color: 'var(--ds-color-text-primary)',
        fontFamily: 'var(--ds-font-family-base, inherit)',
        padding: 24,
        borderRadius: 12,
        border: '1px solid var(--ds-color-border)',
      },
    },
      // Buttons section
      showLabels && React.createElement('div', { style: labelStyle }, 'Buttons'),
      React.createElement('div', { style: { ...sectionStyle, ...rowStyle } },
        React.createElement('button', { style: { ...btnBase, background: 'var(--ds-button-primary-bg, var(--ds-color-primary))', color: 'var(--ds-button-primary-color, #fff)' } }, 'Primary'),
        React.createElement('button', { style: { ...btnBase, background: 'var(--ds-button-secondary-bg, transparent)', color: 'var(--ds-button-secondary-color, var(--ds-color-text-primary))', borderColor: 'var(--ds-button-secondary-border, var(--ds-color-border))' } }, 'Secondary'),
        React.createElement('button', { style: { ...btnBase, background: 'var(--ds-button-default-bg, transparent)', color: 'var(--ds-button-default-color, var(--ds-color-text-primary))', borderColor: 'var(--ds-button-default-border, var(--ds-color-border))' } }, 'Default'),
        React.createElement('button', { style: { ...btnBase, background: 'var(--ds-button-ghost-bg, transparent)', color: 'var(--ds-button-ghost-color, var(--ds-color-text-muted))' } }, 'Ghost'),
      ),

      // Inputs section
      showLabels && React.createElement('div', { style: labelStyle }, 'Inputs'),
      React.createElement('div', { style: { ...sectionStyle, ...rowStyle } },
        React.createElement('input', { style: inputBase, placeholder: 'Text input...', readOnly: true }),
        React.createElement('input', { style: { ...inputBase, borderColor: 'var(--ds-input-error-border, var(--ds-color-error))' }, placeholder: 'Error state', readOnly: true }),
      ),

      // Cards section
      showLabels && React.createElement('div', { style: labelStyle }, 'Cards'),
      React.createElement('div', { style: { ...sectionStyle, ...rowStyle } },
        React.createElement('div', { style: cardBase },
          React.createElement('div', { style: { fontWeight: 600, color: 'var(--ds-card-title-color, var(--ds-color-text-primary))', marginBottom: 4 } }, 'Card Title'),
          React.createElement('div', { style: { fontSize: 13, color: 'var(--ds-card-body-color, var(--ds-color-text-muted))' } }, 'Card body text with secondary color.'),
        ),
        !compact && React.createElement('div', { style: { ...cardBase, boxShadow: 'var(--ds-card-shadow-hover, 0 8px 24px rgba(0,0,0,0.1))' } },
          React.createElement('div', { style: { fontWeight: 600, color: 'var(--ds-card-title-color, var(--ds-color-text-primary))', marginBottom: 4 } }, 'Elevated Card'),
          React.createElement('div', { style: { fontSize: 13, color: 'var(--ds-card-body-color, var(--ds-color-text-muted))' } }, 'With hover shadow applied.'),
        ),
      ),

      // Badges section
      showLabels && React.createElement('div', { style: labelStyle }, 'Badges'),
      React.createElement('div', { style: { ...sectionStyle, ...rowStyle } },
        ...[
          { label: 'Active', bg: 'var(--ds-color-success-bg, rgba(34,197,94,0.1))', color: 'var(--ds-color-success)' },
          { label: 'Warning', bg: 'var(--ds-color-warning-bg, rgba(245,158,11,0.1))', color: 'var(--ds-color-warning)' },
          { label: 'Error', bg: 'var(--ds-color-error-bg, rgba(239,68,68,0.1))', color: 'var(--ds-color-error)' },
          { label: 'Info', bg: 'var(--ds-color-info-bg, rgba(59,130,246,0.1))', color: 'var(--ds-color-info)' },
        ].map(badge =>
          React.createElement('span', {
            key: badge.label,
            style: { padding: '2px 8px', borderRadius: 'var(--ds-radius-sm, 6px)', fontSize: 12, fontWeight: 500, background: badge.bg, color: badge.color },
          }, badge.label),
        ),
      ),

      // Table preview (mini)
      !compact && React.createElement(React.Fragment, null,
        showLabels && React.createElement('div', { style: labelStyle }, 'Table'),
        React.createElement('div', {
          style: {
            ...sectionStyle,
            borderRadius: 'var(--ds-radius-md, 8px)',
            border: '1px solid var(--ds-table-border, var(--ds-color-border))',
            overflow: 'hidden',
          },
        },
          // Header
          React.createElement('div', {
            style: {
              display: 'flex',
              padding: 'var(--ds-table-cell-padding, 10px 16px)',
              background: 'var(--ds-table-header-bg, var(--ds-color-bg-secondary))',
              fontSize: 'var(--ds-table-header-font-size, 13px)',
              fontWeight: 'var(--ds-table-header-font-weight, 500)' as unknown as number,
              color: 'var(--ds-table-header-color, var(--ds-color-text-muted))',
              borderBottom: '1px solid var(--ds-table-border, var(--ds-color-border))',
            },
          },
            React.createElement('div', { style: { flex: 2 } }, 'Name'),
            React.createElement('div', { style: { flex: 1 } }, 'Status'),
            React.createElement('div', { style: { flex: 1, textAlign: 'right' as const } }, 'Date'),
          ),
          // Rows
          ...['John Doe', 'Jane Smith'].map((name, i) =>
            React.createElement('div', {
              key: name,
              style: {
                display: 'flex',
                padding: 'var(--ds-table-cell-padding, 10px 16px)',
                fontSize: 'var(--ds-table-cell-font-size, 14px)',
                color: 'var(--ds-table-cell-color, var(--ds-color-text-primary))',
                background: i % 2 === 1 ? 'var(--ds-table-row-bg-striped, transparent)' : 'var(--ds-table-row-bg, transparent)',
                borderBottom: '1px solid var(--ds-table-row-border, var(--ds-color-border))',
              },
            },
              React.createElement('div', { style: { flex: 2, fontWeight: 500 } }, name),
              React.createElement('div', { style: { flex: 1 } },
                React.createElement('span', {
                  style: { padding: '1px 6px', borderRadius: 4, fontSize: 11, background: 'var(--ds-color-success-bg, rgba(34,197,94,0.1))', color: 'var(--ds-color-success)' },
                }, 'Active'),
              ),
              React.createElement('div', { style: { flex: 1, textAlign: 'right' as const, color: 'var(--ds-color-text-muted)', fontFamily: 'var(--ds-font-family-mono, monospace)', fontSize: 12 } }, 'Apr 17, 2026'),
            ),
          ),
        ),
      ),

      // Typography preview
      !compact && React.createElement(React.Fragment, null,
        showLabels && React.createElement('div', { style: labelStyle }, 'Typography'),
        React.createElement('div', { style: sectionStyle },
          React.createElement('div', { style: { fontSize: 24, fontWeight: 700, fontFamily: 'var(--ds-font-family-heading, inherit)', letterSpacing: 'var(--ds-letter-spacing-heading, -0.02em)', color: 'var(--ds-color-text-primary)' } }, 'Heading Text'),
          React.createElement('div', { style: { fontSize: 14, fontFamily: 'var(--ds-font-family-base, inherit)', lineHeight: 'var(--ds-line-height-body, 1.6)', color: 'var(--ds-color-text-secondary)', marginTop: 4 } }, 'Body text in the base font family. This is how paragraph text will look with the selected fonts and colors.'),
          React.createElement('div', { style: { fontSize: 12, fontFamily: 'var(--ds-font-family-mono, monospace)', color: 'var(--ds-color-text-muted)', marginTop: 4 } }, 'const monospace = "code preview";'),
        ),
      ),

      // Footer: var count
      React.createElement('div', {
        style: { fontSize: 10, color: 'var(--ds-color-text-disabled)', textAlign: 'center' as const, marginTop: 8 },
      }, `${Object.keys(cssVars).length} CSS variables applied`),
    ),
  );
}
