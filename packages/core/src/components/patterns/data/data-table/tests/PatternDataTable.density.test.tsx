/**
 * @fileoverview Density-mode tests for PatternDataTable.
 *
 * Pins `density` as neutral anatomy with no inline padding, and the Modern skin's
 * cell-padding order as CSS text; the causality suite measures rendered padding.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import React, { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { DesignSystemProvider } from '../../../../../infrastructure/runtime/bootstrap';
import type { TenantConfig } from '../../../../../foundation/contracts';
import { PatternDataTable } from '..';

const TENANT: TenantConfig = {
  slug: 'density-test',
  name: 'Density Test Tenant',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: {
    companyName: 'Density Test Tenant',
  },
};

const rows = [
  { id: 'r-1', name: 'Alice' },
  { id: 'r-2', name: 'Bob' },
];

async function renderTableRoot(density: 'comfortable' | 'compact'): Promise<HTMLElement> {
  const { container } = render(
    <DesignSystemProvider tenantConfig={TENANT} forceEngine="modern" skipCssLoading>
      <Suspense fallback={<div>loading</div>}>
        <PatternDataTable
          engine="modern"
          data={rows}
          rowKey="id"
          columns={[{ key: 'name', header: 'Name', accessorKey: 'name' }]}
          density={density}
        />
      </Suspense>
    </DesignSystemProvider>,
  );

  await screen.findByText('Name', undefined, { timeout: 15000 });
  const root = container.querySelector('.ds-pattern-data-table') as HTMLElement | null;
  if (!root) throw new Error('data table root not found');
  return root;
}

describe('PatternDataTable density', () => {
  it('stamps the comfortable posture without an inline cell-padding value', async () => {
    const root = await renderTableRoot('comfortable');
    expect(root).toHaveAttribute('data-density', 'comfortable');
    expect(root.style.getPropertyValue('--ds-density-cell-padding')).toBe('');
    expect(root.className).toContain('ds-table-density-comfortable');
  }, 20000);

  it('stamps the compact posture without an inline cell-padding value', async () => {
    const root = await renderTableRoot('compact');
    expect(root).toHaveAttribute('data-density', 'compact');
    expect(root.style.getPropertyValue('--ds-density-cell-padding')).toBe('');
    expect(root.className).toContain('ds-table-density-compact');
  }, 20000);

  it('defaults to the comfortable posture when density is omitted', async () => {
    const { container } = render(
      <DesignSystemProvider tenantConfig={TENANT} forceEngine="modern" skipCssLoading>
        <Suspense fallback={<div>loading</div>}>
          <PatternDataTable
            engine="modern"
            data={rows}
            rowKey="id"
            columns={[{ key: 'name', header: 'Name', accessorKey: 'name' }]}
          />
        </Suspense>
      </DesignSystemProvider>,
    );
    await screen.findByText('Name', undefined, { timeout: 15000 });
    const root = container.querySelector('.ds-pattern-data-table') as HTMLElement;
    expect(root).toHaveAttribute('data-density', 'comfortable');
    expect(root.style.getPropertyValue('--ds-density-cell-padding')).toBe('');
  }, 20000);
});

const AMBIENT = '--ds-density-cell-padding';
const FLAT = '--ds-table-cell-padding';
const sourceRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const modernSkinPath = join(
  sourceRoot,
  'foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css',
);
const baseThemePath = join(sourceRoot, 'foundation/tokens/css/foundation/themes/default/index.css');

const withoutComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');

function cssFilesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return cssFilesUnder(path);
    return entry.name.endsWith('.css') ? [path] : [];
  });
}

/** The `var()` names a posture's `--ds-modern-table-cell-padding` reads, outermost first, and its literal. */
function cellPaddingChain(posture: 'comfortable' | 'compact' | 'spacious'): {
  names: string[];
  literal: string;
} {
  const css = withoutComments(readFileSync(modernSkinPath, 'utf8'));
  const selector =
    posture === 'comfortable'
      ? '.ds-pattern-data-table.ds-engine-modern[data-part="root"] {'
      : `.ds-pattern-data-table.ds-engine-modern[data-part="root"][data-density="${posture}"] {`;
  const rule = css.slice(css.indexOf(selector));
  const start = rule.indexOf('--ds-modern-table-cell-padding:');
  const declaration = rule.slice(start, rule.indexOf(';', start)).replace(/\s+/g, ' ');
  return {
    names: [...declaration.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].map((match) => match[1]!),
    literal: /,\s*([^,()]+?)[\s)]*$/.exec(declaration)?.[1] ?? '',
  };
}

describe('PatternDataTable Modern cell-padding order (DSA-FK-004)', () => {
  it('stops compact at the ambient channel, then the compact literal', () => {
    expect(cellPaddingChain('compact')).toEqual({
      names: ['--ds-table-padding-compact', AMBIENT],
      literal: '0.5rem 0.75rem',
    });
  });

  it('keeps comfortable and spacious on the flat name the base theme writes', () => {
    expect(cellPaddingChain('comfortable')).toEqual({
      names: ['--ds-table-padding-comfortable', AMBIENT, FLAT],
      literal: '0.875rem 1rem',
    });
    expect(cellPaddingChain('spacious')).toEqual({
      names: ['--ds-table-padding-spacious', AMBIENT, FLAT],
      literal: '16px 16px',
    });
    expect(readFileSync(baseThemePath, 'utf8')).toMatch(/--ds-table-cell-padding:\s*0\.75rem 1rem;/);
  });

  // A declaration would satisfy the debt gate and break the chain: at any
  // scope it reaches a standalone table, it replaces a mode's own default.
  it('keeps the ambient channel undeclared by every stylesheet in the package source', () => {
    const files = cssFilesUnder(sourceRoot);
    expect(files).toEqual(expect.arrayContaining([modernSkinPath, baseThemePath]));
    const declaring = files.filter((file) =>
      new RegExp(`${AMBIENT}\\s*:`).test(withoutComments(readFileSync(file, 'utf8'))),
    );
    expect(declaring).toEqual([]);
  });
});
