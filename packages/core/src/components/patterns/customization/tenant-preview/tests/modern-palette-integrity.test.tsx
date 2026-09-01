import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { TenantCreationConfig } from '../../../../../infrastructure/runtime/tenant/runtime/authoring/configuration';
import ModernTenantPreview from '../engines/modern';

const baseConfig: TenantCreationConfig = {
  name: 'Acme',
  slug: 'acme',
  primaryColor: '#3b82f6',
};

function renderPreview(overrides: Partial<TenantCreationConfig> = {}) {
  return render(
    <ModernTenantPreview config={{ ...baseConfig, ...overrides }} components={['table']} />,
  );
}

describe('ModernTenantPreview — the palette never fabricates a ramp', () => {
  it('builds the full ten-step ramp from a parseable brand color', () => {
    const { container } = renderPreview();

    const swatches = container.querySelectorAll('[data-part="swatch"][data-palette="primary"]');
    expect(swatches).toHaveLength(10);
    const colors = new Set(
      Array.from(swatches).map((node) => node.getAttribute('aria-label')),
    );
    expect(colors.size).toBe(10);
  });

  it('shows one honest swatch when the brand color cannot be mixed', () => {
    // When the brand color cannot be mixed, the preview must show one honest
    // swatch rather than ten fabricated identical tiles.
    const { container } = renderPreview({ primaryColor: 'rebeccapurple' });

    const swatches = container.querySelectorAll('[data-part="swatch"][data-palette="primary"]');
    expect(swatches).toHaveLength(1);
    expect(swatches[0]).toHaveAttribute('data-step', '500');
  });

  it('withholds the step label when the ink contrast cannot be measured', () => {
    const { container } = renderPreview({ primaryColor: 'rebeccapurple' });

    expect(container.querySelector('[data-part="swatch-label"][data-step="500"]')).toBeNull();
  });

  it('accepts the eight-digit hex design tools export', () => {
    const { container } = renderPreview({ primaryColor: '#3b82f6ff' });

    expect(
      container.querySelectorAll('[data-part="swatch"][data-palette="primary"]'),
    ).toHaveLength(10);
    expect(container.querySelector('[data-part="swatch-label"][data-step="500"]')).not.toBeNull();
  });
});

describe('ModernTenantPreview — the sample table fixture is reachable', () => {
  it('gives the horizontal scroll region a named tab stop', () => {
    renderPreview();

    const region = screen.getByRole('group', { name: 'Table' });
    expect(region).toHaveAttribute('data-part', 'table-scroll');
    expect(region).toHaveAttribute('tabindex', '0');
  });
});

describe('ModernTenantPreview — the tenant mark is decorative', () => {
  it('does not repeat the tenant name through the logo', () => {
    const { container } = renderPreview({ logo: 'https://example.invalid/logo.png' });

    expect(container.querySelector('[data-part="logo"] img')).toHaveAttribute('alt', '');
    // The name still reaches assistive technology through the heading.
    expect(screen.getByRole('heading', { name: 'Acme' })).toBeInTheDocument();
  });
});
