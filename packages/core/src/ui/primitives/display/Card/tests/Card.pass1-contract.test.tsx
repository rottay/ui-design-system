import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { chromeToVariables } from '@/infrastructure/compilers/kernel/foundation/css/chrome-variables';
import { validateTenantThemeDocument } from '@/infrastructure/compilers/composition/tenant-theme';
import { Card } from '..';
import ModernCard from '../engines/modern';

describe('Card Pass 1 primitive contract', () => {
  it('owns selectable semantics and supports pointer plus keyboard activation', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <ModernCard selectable selected={false} onSelect={onSelect}>
        Evidence
      </ModernCard>,
    );

    const root = container.querySelector('.ds-card--modern') as HTMLElement;
    expect(root).toHaveAttribute('role', 'button');
    expect(root).toHaveAttribute('tabindex', '0');
    expect(root).toHaveAttribute('aria-pressed', 'false');
    expect(root).toHaveAttribute('data-selected', 'false');

    fireEvent.click(root);
    fireEvent.keyDown(root, { key: 'Enter' });
    fireEvent.keyDown(root, { key: ' ' });
    expect(onSelect).toHaveBeenNthCalledWith(1, true);
    expect(onSelect).toHaveBeenCalledTimes(3);
  });

  it('does not activate the card when an owned nested control is used', () => {
    const onSelect = vi.fn();
    render(
      <ModernCard selectable onSelect={onSelect} aria-label="Evidence card">
        <button type="button">Inspect source</button>
      </ModernCard>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Inspect source' }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('removes disabled cards from the tab sequence and prevents activation', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <ModernCard selectable disabled onSelect={onSelect}>
        Evidence
      </ModernCard>,
    );

    const root = container.querySelector('.ds-card--modern') as HTMLElement;
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(root).not.toHaveAttribute('tabindex');
    fireEvent.click(root);
    fireEvent.keyDown(root, { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('keeps loading and cover anatomy semantic and localizable', () => {
    const { container, rerender } = render(
      <ModernCard loading cover="/candidate.jpg" title="Candidate">
        Hidden
      </ModernCard>,
    );

    const root = container.querySelector('.ds-card--modern') as HTMLElement;
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root).toHaveAttribute('data-loading', 'true');
    expect(container.querySelector('[data-part="spinner"]')?.tagName).toBe('SPAN');

    rerender(
      <ModernCard cover="/candidate.jpg" coverAlt="Localized portrait" title={<span>Candidate</span>}>
        Visible
      </ModernCard>,
    );
    expect(screen.getByAltText('Localized portrait')).toBeInTheDocument();
  });

  it('supports semantic heading levels and compound passthrough', () => {
    const { container } = render(
      <Card.Header
        id="decision-header"
        aria-label="Decision context"
        data-audit="pass1"
        data-part="caller-part"
        headingLevel={2}
        title="Decision readiness"
      />,
    );

    const root = container.querySelector('.rottay-card-header') as HTMLElement;
    expect(root).toHaveAttribute('id', 'decision-header');
    expect(root).toHaveAttribute('data-audit', 'pass1');
    expect(root).toHaveAttribute('data-part', 'header');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Decision readiness');
  });

  it('compiles finite BrandTheme and DB-safe TenantTheme card channels', () => {
    const vars = chromeToVariables({
      cardComponent: {
        bgActive: '#eff6ff',
        bgSelected: '#dbeafe',
        colorHover: '#102a43',
        colorSelected: '#0b1f33',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderSelected: '#2563eb',
        shadowSelected: '0 0 0 3px #bfdbfe',
        surfaceGradient: 'linear-gradient(180deg, #ffffff, #f8fafc)',
        stateOverlay: 'linear-gradient(120deg, rgba(37,99,235,.08), transparent)',
        stateOverlayHoverOpacity: 0.42,
        headerIconBg: '#f8fafc',
        headerIconBorder: '#cbd5e1',
        headerGap: '0.875rem',
        headerBorderWidth: '1px',
        bodyLineHeight: '1.6',
        footerBorderWidth: '1px',
        actionsGap: '0.625rem',
        imageLoadingActive: '#2563eb',
        skeletonHighlight: '#ffffffaa',
        loadingCoverOpacity: 0.58,
      },
    });

    expect(vars).toMatchObject({
      '--ds-card-bg-active': '#eff6ff',
      '--ds-card-bg-selected': '#dbeafe',
      '--ds-card-color-hover': '#102a43',
      '--ds-card-color-selected': '#0b1f33',
      '--ds-card-border-width': '1px',
      '--ds-card-border-style': 'solid',
      '--ds-card-border-selected': '#2563eb',
      '--ds-card-shadow-selected': '0 0 0 3px #bfdbfe',
      '--ds-card-surface-gradient': 'linear-gradient(180deg, #ffffff, #f8fafc)',
      '--ds-card-state-overlay': 'linear-gradient(120deg, rgba(37,99,235,.08), transparent)',
      '--ds-card-state-overlay-hover-opacity': '0.42',
      '--ds-card-header-icon-bg': '#f8fafc',
      '--ds-card-header-icon-border': '#cbd5e1',
      '--ds-card-header-gap': '0.875rem',
      '--ds-card-header-border-width': '1px',
      '--ds-card-body-line-height': '1.6',
      '--ds-card-footer-border-width': '1px',
      '--ds-card-actions-gap': '0.625rem',
      '--ds-card-image-loading-active': '#2563eb',
      '--ds-card-skeleton-highlight': '#ffffffaa',
      '--ds-card-loading-cover-opacity': '0.58',
    });
  });

  it('accepts the premium Card recipe through the strict DB document schema', () => {
    const valid = validateTenantThemeDocument({
      schemaVersion: 1,
      mode: 'advanced',
      visualFoundation: {
        advanced: {
          chrome: {
            cardComponent: {
              bg: '#ffffff',
              colorHover: '#102a43',
              surfaceGradient: 'linear-gradient(180deg, #ffffff, #f8fafc)',
              stateOverlay: 'linear-gradient(120deg, rgba(37,99,235,.08), transparent)',
              stateOverlayHoverOpacity: 0.42,
              headerGap: '0.875rem',
              bodyLineHeight: '1.6',
              skeletonDuration: '1200ms',
            },
          },
        },
      },
    });
    const hostileOpacity = validateTenantThemeDocument({
      schemaVersion: 1,
      mode: 'advanced',
      visualFoundation: {
        advanced: {
          chrome: {
            cardComponent: { stateOverlayHoverOpacity: 4 },
          },
        },
      },
    });

    expect(valid.success).toBe(true);
    expect(hostileOpacity.success).toBe(false);
  });

  it('ships motion/accessibility gates without a chromatic side rail', () => {
    const skin = readFileSync(
      join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/card.css'),
      'utf-8',
    );
    const compounds = readFileSync(
      join(__dirname, '../../../../../foundation/tokens/css/presentation/components/skin/card-compounds.css'),
      'utf-8',
    );
    const css = `${skin}\n${compounds}`;

    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('@media (forced-colors: active)');
    expect(css).toContain("[data-selected='true']");
    expect(css).not.toMatch(/border-(left|inline-start)\s*:/);
  });
});
