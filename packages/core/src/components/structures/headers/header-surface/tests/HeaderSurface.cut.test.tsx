/**
 * HeaderSurface, WO-FAM-10 sub-lot D2 — the family cut.
 *
 * The skin (`skin/layout-header`, the family's real skin name) reads zero
 * custom properties by measured design: every visual decision belongs to a
 * composed component — PageShellSurface, Tabs, Stack, Typography — each with
 * its own family row. What the cut pins here is the contract that remains:
 * the stamped anatomy the skin's one resilience rule keys on, the loading
 * passthrough to PageShellSurface, zero family paint of its own, and the
 * family's own accessibility evidence. The empty produces set is pinned in
 * the deriver's contract test; no painted-causality probe exists for this
 * family because it owns zero paint channels (template §1.6 deviation,
 * measured — a probe here would claim causality for paint owned by the
 * composed families and probed in their own cuts).
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import React from 'react';
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HeaderSurface } from '..';
import type { HeaderSurfaceConfig } from '../../../foundation/chrome/contracts';
import {
  renderSurface,
  RESOLVED_PHONE_TEST_CONTEXT,
} from '../../../../surfaces/foundation/common/test-utils';

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/presentation/components/skin/layout-header/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

function buildConfig(overrides?: Partial<HeaderSurfaceConfig>): HeaderSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: { title: 'Workspace' },
      description: 'Manage workspace-level content and controls.',
    },
    behavior: {
      tabs: [
        { key: 'overview', label: 'Overview', content: <div>Overview panel</div> },
        { key: 'activity', label: 'Activity', content: <div>Activity panel</div> },
      ],
    },
    access: undefined,
    ...overrides,
  };
}

function surfaceRoot(): HTMLElement {
  return document.querySelector('.ds-surface.ds-header[data-part="root"]') as HTMLElement;
}

/** Every inline declaration key on `node`. */
function inlineDeclarations(node: HTMLElement): string[] {
  const style = node.getAttribute('style');
  if (!style) return [];
  return style
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => declaration.slice(0, declaration.indexOf(':')).trim());
}

describe('HeaderSurface (WO-FAM-10 cut)', () => {
  it('stamps the anatomy the skin selects: root plus the three state attributes', async () => {
    renderSurface(<HeaderSurface config={buildConfig()} />, { engine: 'modern' });

    const root = await screen.findByRole('heading', { level: 1, name: 'Workspace' }, { timeout: 15000 })
      .then(() => surfaceRoot());
    expect(root).toBeTruthy();
    expect(root).toHaveAttribute('data-part', 'root');
    expect(root).toHaveAttribute('data-loading', 'false');
    expect(root).toHaveAttribute('data-mobile-compact', 'false');
    expect(root).toHaveAttribute('data-mobile-actions', 'all');

    // The skin's one living rule selects exactly this contract.
    expect(SKIN).toContain("[data-part='root'][data-mobile-compact='true']");
    expect(SKIN).toContain('min-inline-size: 0');
  });

  it('carries the compact mobile posture to the stamp the skin rule keys on', async () => {
    renderSurface(
      <HeaderSurface
        config={buildConfig({ visual: { compactOnMobile: true, hideSecondaryActionsOnMobile: true } })}
      />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );

    await screen.findByRole('heading', { level: 1, name: 'Workspace' }, { timeout: 15000 });
    const root = surfaceRoot();
    expect(root).toHaveAttribute('data-mobile-compact', 'true');
    expect(root).toHaveAttribute('data-mobile-actions', 'primary-only');
  });

  it('delegates loading entirely to PageShellSurface: the shell skeleton replaces the surface body', async () => {
    renderSurface(<HeaderSurface config={buildConfig()} loading />, { engine: 'modern' });

    const shellRoot = await screen.findByText('Loading page', undefined, { timeout: 15000 })
      .then((status) => status.closest('.ds-pattern-page-shell') as HTMLElement);
    expect(shellRoot).toHaveAttribute('data-loading', 'true');
    expect(shellRoot).toHaveAttribute('aria-busy', 'true');
    // The shell announces the state instead of wandering AT through the skeleton.
    expect(within(shellRoot).getByRole('status')).toHaveTextContent('Loading page');
    expect(shellRoot.querySelector("[data-part='skeleton-group']")).toBeTruthy();
    // The early return is the passthrough: the family's own root and body
    // content do not render alongside the shell's loading state.
    expect(document.querySelector('.ds-surface.ds-header')).toBeNull();
    expect(screen.queryByText('Overview panel')).not.toBeInTheDocument();
  });

  it('paints nothing of its own: the surface root carries channels only, never paint', async () => {
    renderSurface(<HeaderSurface config={buildConfig()} />, { engine: 'modern' });

    await screen.findByRole('heading', { level: 1, name: 'Workspace' }, { timeout: 15000 });
    const root = surfaceRoot();
    // HeaderSurface passes no style prop at all; the only inline declarations
    // on its root are the composed Stack's --ds-stack-gap channel. Descendant
    // inline font-size is Typography's documented size channel — that family's
    // own paint, not this one's.
    for (const key of inlineDeclarations(root)) {
      expect(key.startsWith('--')).toBe(true);
    }
  });

  it('owns its a11y evidence: labelled tabs, the description, and no improper landmark', async () => {
    renderSurface(<HeaderSurface config={buildConfig()} />, { engine: 'modern' });

    await screen.findByRole('heading', { level: 1, name: 'Workspace' }, { timeout: 15000 });
    const root = surfaceRoot();

    // The visible tabs render as tabs, with their labels.
    const tablist = within(root).getByRole('tablist');
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual(['Overview', 'Activity']);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    // The description text the config carries is present on the surface.
    expect(within(root).getByText('Manage workspace-level content and controls.')).toBeInTheDocument();

    // The root is a plain group container, not a second landmark: the real
    // banner lives in PageShellSurface's own header, above this root.
    expect(root).not.toHaveAttribute('role');
    expect(root.tagName).toBe('DIV');
    expect(within(root).queryByRole('banner')).toBeNull();
    expect(within(root).queryByRole('main')).toBeNull();
  });
});
