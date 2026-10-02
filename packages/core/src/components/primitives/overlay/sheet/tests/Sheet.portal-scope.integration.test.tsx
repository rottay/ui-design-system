/**
 * The modern sheet carries its mount scope across the portal: a sheet opened
 * inside a nested compact, tenant-scoped region paints with the region's
 * density answer, not the document root's, and the tenant, mode and locale
 * attributes reach the portaled surface. The sheet's own part channels are
 * root-declared, so the measured paint is the density set its parts read and
 * the content it hosts.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernSheet from '../engines/modern';
import { mountArm, measureMountedArms } from '@tests/support/family-causality';

const HEADER = "[data-part='header']";
const CONTENT = "[data-part='body'] [data-probe='content']";

function renderScopedSheet(): { portaled: string; root: string } {
  const view = render(
    <div data-ds-root="" data-tenant="acme" data-theme="dark" data-density="compact" dir="rtl" lang="ar">
      <ModernSheet open onOpenChange={() => {}} title="Navigation">
        <span data-probe="content" style={{ display: 'block', paddingTop: 'var(--ds-spacing-3)' }}>
          Links
        </span>
      </ModernSheet>
    </div>,
  );
  const portalRoot = document.getElementById('rottay-portal-root')!;
  const sheetRoot = portalRoot.querySelector<HTMLElement>('.ds-sheet')!;
  const markup = { portaled: portalRoot.innerHTML, root: sheetRoot.outerHTML };
  view.unmount();
  return markup;
}

describe('sheet portal scope', () => {
  it('re-stamps the mount lineage onto the portaled surface', () => {
    render(
      <div data-ds-root="" data-tenant="acme" data-theme="dark" data-density="compact" dir="rtl" lang="ar">
        <ModernSheet open onOpenChange={() => {}} title="Navigation">
          Links
        </ModernSheet>
      </div>,
    );
    const surface = screen.getByRole('dialog');
    const scope = surface.closest<HTMLElement>('[data-portal-scope="true"]');
    expect(scope).not.toBeNull();
    expect(document.getElementById('rottay-portal-root')).toContainElement(scope);
    expect(scope).toHaveAttribute('data-tenant', 'acme');
    expect(scope).toHaveAttribute('data-theme', 'dark');
    expect(scope).toHaveAttribute('data-density', 'compact');
    expect(scope).toHaveAttribute('dir', 'rtl');
    expect(scope).toHaveAttribute('lang', 'ar');
  });

  it('paints the portaled sheet with the local density answer', async () => {
    const { portaled, root } = renderScopedSheet();
    const markup = [
      `<div id="portaled">${portaled}</div>`,
      `<div id="in-tree" data-density="compact">${root}</div>`,
      `<div id="at-root">${root}</div>`,
    ].join('');
    const targets = (['portaled', 'in-tree', 'at-root'] as const).flatMap((host) => [
      { id: `${host}.scale`, selector: `#${host} ${HEADER}`, property: '--ds-density-effective-scale' },
      { id: `${host}.spacing`, selector: `#${host} ${HEADER}`, property: '--ds-spacing-3' },
      { id: `${host}.content`, selector: `#${host} ${CONTENT}`, property: 'padding-top' },
    ]);
    const readings = await measureMountedArms({
      markup,
      targets,
      arms: {
        bithire: async () => {
          const arm = await mountArm('bithire', {});
          return { css: arm.css, rootAttributes: { ...arm.rootAttributes, 'data-density': 'comfortable' } };
        },
      },
    });
    const read = readings.bithire!;

    for (const channel of ['scale', 'spacing', 'content']) {
      expect(read[`in-tree.${channel}`]).not.toBe(read[`at-root.${channel}`]);
      expect(read[`portaled.${channel}`]).toBe(read[`in-tree.${channel}`]);
    }
  });
});
