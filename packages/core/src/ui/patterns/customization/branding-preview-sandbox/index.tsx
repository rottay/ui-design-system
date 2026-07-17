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
 * @category Patterns/Customization
 * @package @rottay/design-system
 */

'use client';

import React, { useMemo, useId } from 'react';
import type { TenantAppearance } from '../../../../foundation/contracts/composition/tenants/themes';

// Lazy import to avoid pulling appearance compiler into main bundle
// when sandbox is not used (tree-shaken)
import { appearanceToVariables } from '@/infrastructure/compilers/kernel/runtime/appearance';

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
    fontSize: 13,
    fontWeight: 500,
    cursor: 'default',
    fontFamily: 'var(--ds-font-family-base, inherit)',
  };

  const inputBase: React.CSSProperties = {
    padding: '8px 12px',
    fontSize: 13,
    fontFamily: 'var(--ds-font-family-base, inherit)',
    width: 200,
  };

  const cardBase: React.CSSProperties = {
    padding: 16,
    width: compact ? 200 : 260,
  };

  return React.createElement(
    React.Fragment,
    null,
    // Inject scoped CSS
    React.createElement('style', {
      dangerouslySetInnerHTML: { __html: scopedCss },
    }),

    // Sandbox container
    React.createElement(
      'div',
      {
        [scopeAttr]: '',
        className: 'ds-pattern-branding-preview-sandbox',
        'data-part': 'root',
        'data-state': compact ? 'compact' : 'full',
        style: {
          fontFamily: 'var(--ds-font-family-base, inherit)',
          padding: 24,
        },
      },
      // Buttons section
      showLabels &&
        React.createElement('div', { 'data-part': 'header', 'data-state': 'buttons', style: labelStyle }, 'Buttons'),
      React.createElement(
        'div',
        {
          'data-part': 'surface',
          'data-state': 'buttons',
          style: { ...sectionStyle, ...rowStyle },
        },
        React.createElement(
          'button',
          {
            'data-part': 'button',
            'data-variant': 'primary',
            style: { ...btnBase },
          },
          'Primary'
        ),
        React.createElement(
          'button',
          {
            'data-part': 'button',
            'data-variant': 'secondary',
            style: { ...btnBase },
          },
          'Secondary'
        ),
        React.createElement(
          'button',
          {
            'data-part': 'button',
            'data-variant': 'default',
            style: { ...btnBase },
          },
          'Default'
        ),
        React.createElement(
          'button',
          {
            'data-part': 'button',
            'data-variant': 'ghost',
            style: { ...btnBase },
          },
          'Ghost'
        )
      ),

      // Inputs section
      showLabels &&
        React.createElement('div', { 'data-part': 'header', 'data-state': 'inputs', style: labelStyle }, 'Inputs'),
      React.createElement(
        'div',
        {
          'data-part': 'surface',
          'data-state': 'inputs',
          style: { ...sectionStyle, ...rowStyle },
        },
        React.createElement('input', {
          'data-part': 'input',
          'data-state': 'default',
          style: inputBase,
          placeholder: 'Text input...',
          readOnly: true,
        }),
        React.createElement('input', {
          'data-part': 'input',
          'data-state': 'error',
          style: { ...inputBase },
          placeholder: 'Error state',
          readOnly: true,
        })
      ),

      // Cards section
      showLabels &&
        React.createElement('div', { 'data-part': 'header', 'data-state': 'cards', style: labelStyle }, 'Cards'),
      React.createElement(
        'div',
        {
          'data-part': 'surface',
          'data-state': 'cards',
          style: { ...sectionStyle, ...rowStyle },
        },
        React.createElement(
          'div',
          { 'data-part': 'card', 'data-state': 'default', style: cardBase },
          React.createElement(
            'div',
            {
              'data-part': 'preview-card-title',
              style: {
                fontWeight: 600,
                marginBottom: 4,
              },
            },
            'Card Title'
          ),
          React.createElement(
            'div',
            {
              'data-part': 'preview-card-body',
              style: {
                fontSize: 13,
              },
            },
            'Card body text with secondary color.'
          )
        ),
        !compact &&
          React.createElement(
            'div',
            {
              'data-part': 'card',
              'data-state': 'elevated',
              style: { ...cardBase },
            },
            React.createElement(
              'div',
              {
                'data-part': 'preview-card-title',
                style: {
                  fontWeight: 600,
                  marginBottom: 4,
                },
              },
              'Elevated Card'
            ),
            React.createElement(
              'div',
              {
                'data-part': 'preview-card-body',
                style: {
                  fontSize: 13,
                },
              },
              'With hover shadow applied.'
            )
          )
      ),

      // Badges section
      showLabels &&
        React.createElement('div', { 'data-part': 'header', 'data-state': 'badges', style: labelStyle }, 'Badges'),
      React.createElement(
        'div',
        {
          'data-part': 'surface',
          'data-state': 'badges',
          style: { ...sectionStyle, ...rowStyle },
        },
        ...['Active', 'Warning', 'Error', 'Info'].map((label) =>
          React.createElement(
            'span',
            {
              key: label,
              'data-part': 'badge',
              'data-state': label.toLowerCase(),
              style: {
                padding: '2px 8px',
                fontSize: 12,
                fontWeight: 500,
              },
            },
            label
          )
        )
      ),

      // Table preview (mini)
      !compact &&
        React.createElement(
          React.Fragment,
          null,
          showLabels &&
            React.createElement(
              'div',
              {
                'data-part': 'header',
                'data-state': 'table',
                style: labelStyle,
              },
              'Table'
            ),
          React.createElement(
            'div',
            {
              'data-part': 'table',
              style: {
                ...sectionStyle,
                overflow: 'hidden',
              },
            },
            // Header
            React.createElement(
              'div',
              {
                'data-part': 'table-head',
                style: {
                  display: 'flex',
                  padding: 'var(--ds-table-cell-padding, 10px 16px)',
                  fontSize: 'var(--ds-table-header-font-size, 13px)',
                  fontWeight: 'var(--ds-table-header-font-weight, 500)' as unknown as number,
                },
              },
              React.createElement(
                'div',
                {
                  'data-part': 'preview-table-cell',
                  'data-variant': 'head',
                  style: { flex: 2 },
                },
                'Name'
              ),
              React.createElement(
                'div',
                {
                  'data-part': 'preview-table-cell',
                  'data-variant': 'head',
                  style: { flex: 1 },
                },
                'Status'
              ),
              React.createElement(
                'div',
                {
                  'data-part': 'preview-table-cell',
                  'data-variant': 'head',
                  style: { flex: 1, textAlign: 'right' as const },
                },
                'Date'
              )
            ),
            // Rows
            ...['John Doe', 'Jane Smith'].map((name, i) =>
              React.createElement(
                'div',
                {
                  key: name,
                  'data-part': 'surface',
                  'data-state': i % 2 === 1 ? 'striped' : 'default',
                  style: {
                    display: 'flex',
                    padding: 'var(--ds-table-cell-padding, 10px 16px)',
                    fontSize: 'var(--ds-table-cell-font-size, 14px)',
                  },
                },
                React.createElement(
                  'div',
                  {
                    'data-part': 'preview-table-cell',
                    'data-variant': 'name',
                    style: { flex: 2, fontWeight: 500 },
                  },
                  name
                ),
                React.createElement(
                  'div',
                  {
                    'data-part': 'preview-table-cell',
                    'data-variant': 'status',
                    style: { flex: 1 },
                  },
                  React.createElement(
                    'span',
                    {
                      'data-part': 'badge',
                      'data-state': 'active',
                      style: {
                        padding: '1px 6px',
                        fontSize: 11,
                      },
                    },
                    'Active'
                  )
                ),
                React.createElement(
                  'div',
                  {
                    'data-part': 'preview-table-cell',
                    'data-variant': 'date',
                    style: {
                      flex: 1,
                      textAlign: 'right' as const,
                      fontFamily: 'var(--ds-font-family-mono, monospace)',
                      fontSize: 12,
                    },
                  },
                  'Apr 17, 2026'
                )
              )
            )
          )
        ),

      // Typography preview
      !compact &&
        React.createElement(
          React.Fragment,
          null,
          showLabels &&
            React.createElement(
              'div',
              {
                'data-part': 'header',
                'data-state': 'typography',
                style: labelStyle,
              },
              'Typography'
            ),
          React.createElement(
            'div',
            {
              'data-part': 'surface',
              'data-state': 'typography',
              style: sectionStyle,
            },
            React.createElement(
              'div',
              {
                'data-part': 'title',
                style: {
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: 'var(--ds-font-family-heading, inherit)',
                  letterSpacing: 'var(--ds-letter-spacing-heading, -0.02em)',
                },
              },
              'Heading Text'
            ),
            React.createElement(
              'div',
              {
                'data-part': 'subtitle',
                'data-variant': 'body',
                style: {
                  fontSize: 14,
                  fontFamily: 'var(--ds-font-family-base, inherit)',
                  lineHeight: 'var(--ds-line-height-body, 1.6)',
                  marginTop: 4,
                },
              },
              'Body text in the base font family. This is how paragraph text will look with the selected fonts and colors.'
            ),
            React.createElement(
              'div',
              {
                'data-part': 'subtitle',
                'data-variant': 'code',
                style: {
                  fontSize: 12,
                  fontFamily: 'var(--ds-font-family-mono, monospace)',
                  marginTop: 4,
                },
              },
              'const monospace = "code preview";'
            )
          )
        ),

      // Footer: var count
      React.createElement(
        'div',
        {
          'data-part': 'subtitle',
          'data-variant': 'variable-count',
          style: {
            fontSize: 10,
            textAlign: 'center' as const,
            marginTop: 8,
          },
        },
        `${Object.keys(cssVars).length} CSS variables applied`
      )
    )
  );
}
