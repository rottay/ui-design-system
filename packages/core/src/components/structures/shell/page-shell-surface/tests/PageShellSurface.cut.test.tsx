/**
 * WO-FAM-11 sub-lot C — the `page-shell-surface` cut.
 *
 * This family was PAINTLESS: zero skin files anywhere, which the family-cut
 * gate refuses outright, and one BLOCKING `style={{ viewTransitionName }}` as
 * its only visual statement. The paint is created in this lot; these are the
 * assertions that would fail if it went back into TypeScript.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import React from 'react';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageShellSurface } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

const SOURCE = readFileSync(
  resolve(process.cwd(), 'src/components/structures/shell/page-shell-surface/index.tsx'),
  'utf8',
);

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/presentation/components/skin/page-shell-surface/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

describe('PageShellSurface — the FAM-11 cut', () => {
  it('stamps the page body as anatomy instead of styling it inline', async () => {
    const { container } = renderSurface(
      <PageShellSurface chrome={{ title: 'Launch' }}>
        <div>body</div>
      </PageShellSurface>,
      { engine: 'modern' },
    );

    await waitFor(
      () => expect(container.querySelector('[data-part="body"]')).not.toBeNull(),
      { timeout: 15000 },
    );
    const body = container.querySelector('[data-part="body"]') as HTMLElement;

    expect(body.className).toContain('ds-page-shell-surface');
    expect(body.style.getPropertyValue('view-transition-name')).toBe('');
    expect(SOURCE).not.toContain('viewTransitionName');
  });

  it('states the view-transition seam as a channel with a reachable rest', () => {
    // A `view-transition-name` that resolves to nothing is invalid at computed
    // value time, so the rest is declared rather than hidden in a `var()` tail.
    expect(SKIN).toContain('--ds-page-shell-surface-transition-name: ds-vt-page-body;');
    expect(SKIN).toContain(
      'view-transition-name: var(--ds-page-shell-surface-transition-name);',
    );
  });

  it('stops naming a morph target under a reduced-motion preference', () => {
    expect(SKIN).toContain('@media (prefers-reduced-motion: reduce)');
    expect(SKIN).toContain('view-transition-name: none;');
  });

  it('answers to one class vocabulary, spelled for its own family', () => {
    expect(SOURCE).toContain('ds-page-shell-surface');
    expect(SOURCE).not.toContain('rottay-');
  });
});
