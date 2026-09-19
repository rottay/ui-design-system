/**
 * WO-FAM-11 sub-lot C — the `workspace-shell` cut.
 *
 * The family carried 21 of the shell cut's 26 BLOCKING inline paints and both
 * of its BLOCKING visual literals, all in one decorative feature. They are
 * asserted gone where they were, not merely absent from a count.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import React from 'react';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';
import { WorkspaceShell } from '../index';
import { workspaceShellChromeDeriver } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/workspace-shell';

const SOURCE = readFileSync(
  resolve(process.cwd(), 'src/components/structures/shell/workspace-shell/index.tsx'),
  'utf8',
);

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/presentation/components/skin/collection-shell/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

describe('WorkspaceShell — the FAM-11 cut', () => {
  it('states no geometry and no colour of its own in TypeScript', () => {
    // `position`, `overflow`, `isolation`, `inset`, `pointerEvents`, `zIndex`
    // and both mask ramps used to be authored here.
    expect(SOURCE).not.toMatch(/position:\s*'(?:relative|absolute)'/);
    expect(SOURCE).not.toMatch(/zIndex:/);
    expect(SOURCE).not.toMatch(/maskImage:/);
    expect(SOURCE).not.toContain('color-mix(');
  });

  it('leaves the root exactly one inline statement: the caller`s own style', async () => {
    const { container } = renderSurface(
      <WorkspaceShell style={{ marginBlockStart: 12 }}>content</WorkspaceShell>,
    );
    await waitFor(() => expect(container.querySelector('[data-part="root"]')).not.toBeNull());
    const root = container.querySelector('[data-part="root"]') as HTMLElement;

    expect(root.style.marginBlockStart).toBe('12px');
    expect(root.style.position).toBe('');
    expect(root.style.overflow).toBe('');
    expect(root.style.isolation).toBe('');
  });

  it('paints the stacking context the structure used to inline', () => {
    expect(SKIN).toContain('isolation: isolate;');
    expect(SKIN).toContain('z-index: 1;');
  });

  it('hands the canvas a resolution relay, so a tenant statement still reaches it', () => {
    // The canvas is painted by script off its own computed style, so the
    // public channel is resolved into a private relay in the skin with the
    // literal rest as the terminal fallback.
    expect(SOURCE).toContain('var(--_ds-workspace-shell-particle-primary-resolved)');
    expect(SKIN).toContain('--_ds-workspace-shell-particle-primary-resolved: var(');
    expect(SKIN).toContain('--ds-workspace-shell-particle-primary,');
    expect(workspaceShellChromeDeriver.produces).toContain(
      '--ds-workspace-shell-particle-primary',
    );
  });

  it('carries no programme-numbered attribute', () => {
    // `data-cra-14-static-fallback` was the last `data-cra-*` in the package.
    expect(SOURCE).not.toContain('data-cra-');
  });

  it('keeps the published class root the family id does not match', async () => {
    const { container } = renderSurface(<WorkspaceShell>content</WorkspaceShell>);
    // `skin/collection-workspace` compounds on it and the public-api barrel
    // gate asserts `__static-particle-field` survives into the artifact, so
    // the rename is refused and the roster carries a `skins` pin instead.
    await waitFor(() =>
      expect(container.querySelector('.ds-surface.ds-collection-shell')).not.toBeNull(),
    );
  });
});
