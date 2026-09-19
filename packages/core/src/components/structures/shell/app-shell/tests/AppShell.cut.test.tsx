/**
 * AppShell, WO-FAM-11 sub-lot B.
 *
 * What this suite owns, and the responsive suite beside it does not: the
 * contract the family cut changed. The `--ds-shell-*` namespace splits into a
 * resolved band the structure stamps and a derived band the chrome deriver
 * produces, and the two together must cover every channel the skin reads.
 * The navigation presentation is the shared adaptation kernel's answer, the
 * chrome actions' state is the interaction kernel's, and every part the skin
 * selects is a part the structure stamps.
 */

import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';

import { renderWithEngine } from '@tests/support/engine';
import {
  ResponsiveContext,
  type ResponsiveContextValue,
} from '@/infrastructure/runtime/responsive';
import { appShellChromeDeriver } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/app-shell';
import { AppShell } from '..';
import { SHELL_PUBLISHED_CHANNELS, SHELL_RESOLVED_CHANNELS } from '../../contracts';

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/presentation/components/skin/app-shell/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

/** The anatomy this structure owns; the composed Sheet stamps its own parts. */
const OWNED_PARTS = [
  'root',
  'skip-link',
  'navigation-sidebar',
  'navigation-logo',
  'navigation-body',
  'navigation-footer',
  'navigation-drawer-header',
  'navigation-close',
  'navigation-trigger',
  'main-area',
  'header',
  'header-left',
  'header-center',
  'header-right',
  'content',
  'footer',
] as const;

/**
 * The one channel this cut leaves unproduced, and why: `--ds-shell-navigation-shadow`
 * has two correct rests — a flat fixed track and a lifted overlay drawer —
 * and app-bithire authors the name on both elements, so producing either rest
 * silently repaints the other.
 */
const DECLARED_UNPRODUCED = ['--ds-shell-navigation-shadow'] as const;

/**
 * The one `--ds-shell-*` name in the skin that belongs to a different owner:
 * the legacy header spelling `chrome-variables` emits beside
 * `--ds-shell-header-block-size` from the same `chrome.layout.headerHeight`
 * field. The chain keeps it reachable; this family never produces it.
 */
const FOREIGN_READS = ['--ds-shell-topbar-height'] as const;

const DESKTOP_CONTEXT: ResponsiveContextValue = {
  deviceClass: 'desktop',
  activeBreakpoint: 'lg',
  isPhone: false,
  isTablet: false,
  isDesktop: true,
  pointer: 'fine',
  orientation: 'landscape',
  prefersReducedMotion: false,
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
};
const TABLET_CONTEXT: ResponsiveContextValue = {
  ...DESKTOP_CONTEXT,
  deviceClass: 'tablet',
  activeBreakpoint: 'md',
  isTablet: true,
  isDesktop: false,
  isPhoneOrTablet: true,
  pointer: 'coarse',
  isTouchDevice: true,
};

const SIDEBAR = {
  navigationLabel: 'Primary navigation',
  logo: <span>Logo</span>,
  nav: <a href="/inbox">Inbox</a>,
  footer: <span>Signed in</span>,
};

function renderShell(
  responsive: ResponsiveContextValue,
  props: Partial<React.ComponentProps<typeof AppShell>> = {},
) {
  return renderWithEngine(
    <ResponsiveContext.Provider value={responsive}>
      <AppShell sidebar={SIDEBAR} header={{ left: <span>Workspace</span> }} footer={<span>©</span>} {...props}>
        <p>Page content</p>
      </AppShell>
    </ResponsiveContext.Provider>,
    'modern',
  );
}

/** Every `--ds-shell-*` name the skin reads through `var()`. */
function skinReads(): Set<string> {
  const names = new Set<string>();
  for (const match of SKIN.matchAll(/var\(\s*(--ds-shell-[a-z0-9-]+)/g)) names.add(match[1]!);
  return names;
}

/** Every `--ds-shell-*` name the skin DECLARES. */
function skinDeclares(): Set<string> {
  const names = new Set<string>();
  for (const match of SKIN.matchAll(/(--ds-shell-[a-z0-9-]+)\s*:/g)) names.add(match[1]!);
  return names;
}

describe('AppShell (WO-FAM-11 cut) — the --ds-shell-* split', () => {
  it('keeps the resolved band and the derived band disjoint', () => {
    const derived = new Set<string>(appShellChromeDeriver.produces);
    const overlap = SHELL_RESOLVED_CHANNELS.filter((channel) => derived.has(channel));
    // A decision cannot answer a question whose answer is a prop, a posture
    // or a device inset — and a runtime value cannot be a tenant's decision.
    expect(overlap).toEqual([]);
  });

  it('covers every channel the skin reads with one band or the other', () => {
    const covered = new Set<string>([
      ...SHELL_RESOLVED_CHANNELS,
      ...appShellChromeDeriver.produces,
      ...skinDeclares(),
      ...FOREIGN_READS,
    ]);
    const uncovered = [...skinReads()].filter((name) => !covered.has(name)).sort();
    expect(uncovered).toEqual([...DECLARED_UNPRODUCED]);
  });

  it('publishes every cross-owner channel from one band or the other', () => {
    const published = new Set<string>([
      ...SHELL_RESOLVED_CHANNELS,
      ...appShellChromeDeriver.produces,
    ]);
    for (const channel of SHELL_PUBLISHED_CHANNELS) {
      expect({ channel, published: published.has(channel) }).toEqual({ channel, published: true });
    }
  });

  it('names only its own namespace, and never a resolved name, in the deriver', () => {
    for (const channel of appShellChromeDeriver.produces) {
      expect(channel.startsWith('--ds-shell-')).toBe(true);
    }
  });
});

describe('AppShell (WO-FAM-11 cut) — the anatomy contract', () => {
  it('stamps every part the skin selects, and the skin selects every stamped part', () => {
    const { container } = renderShell(DESKTOP_CONTEXT);
    const stamped = new Set(
      [...container.querySelectorAll('[data-part]')].map((node) => node.getAttribute('data-part')!),
    );
    // Two exclusions, both stated. The drawer-only parts render in the
    // compact arm, measured below. `root` is selected by the class and not by
    // its stamp on purpose: every other rule is scoped under it, and adding
    // the attribute would lift the root rule above the (0,1,0) background
    // statement app-bithire already makes on the same element.
    const DRAWER_ONLY = ['navigation-drawer-header', 'navigation-close', 'navigation-trigger'];
    for (const part of OWNED_PARTS) {
      if (part === 'root' || DRAWER_ONLY.includes(part)) continue;
      expect({ part, stamped: stamped.has(part) }).toEqual({ part, stamped: true });
      expect(SKIN, `skin rule for ${part}`).toContain(`[data-part="${part}"]`);
    }
    expect(stamped.has('root')).toBe(true);
    expect(SKIN).toContain('.rottay-app-shell {');
    // And the converse: no skin rule hangs on a part this structure never stamps.
    for (const match of SKIN.matchAll(/\[data-part="([a-z-]+)"\]/g)) {
      expect(OWNED_PARTS, match[1]).toContain(match[1]);
    }
  });

  it('paints nothing inline: only runtime-resolved --ds-shell-* channels travel', () => {
    const { container } = renderShell(DESKTOP_CONTEXT);
    const resolved = new Set<string>(SHELL_RESOLVED_CHANNELS);
    const published = new Set<string>(SHELL_PUBLISHED_CHANNELS);
    for (const node of container.querySelectorAll('[data-part]')) {
      const style = node.getAttribute('style');
      if (style === null) continue;
      for (const declaration of style.split(';')) {
        const name = declaration.split(':')[0]?.trim();
        if (!name) continue;
        expect({ part: node.getAttribute('data-part'), name }).toEqual({
          part: node.getAttribute('data-part'),
          name: resolved.has(name) || published.has(name) ? name : `UNEXPECTED ${name}`,
        });
      }
    }
  });
});

describe('AppShell (WO-FAM-11 cut) — the adapt slot', () => {
  it('resolves the navigation presentation through the shared posture, not a private one', () => {
    const { container } = renderShell(TABLET_CONTEXT);
    const root = container.querySelector('[data-part="root"]')!;
    // The stamp is the kernel's token list, not a word this family spells.
    expect(root).toHaveAttribute('data-posture', 'tablet');
    expect(root).toHaveAttribute('data-compact', 'true');
    expect(container.querySelector('[data-part="navigation-sidebar"]')).toBeNull();
  });

  it('lets the app declare a delta at one posture without inventing a threshold', () => {
    const { container } = renderShell(TABLET_CONTEXT, {
      adapt: { tablet: { navigation: 'sidebar' } },
    });
    const root = container.querySelector('[data-part="root"]')!;
    // Same posture, app-declared delta: the fixed track returns, and the
    // posture stamp is untouched — the app said WHAT, not WHEN.
    expect(root).toHaveAttribute('data-posture', 'tablet');
    expect(root).toHaveAttribute('data-compact', 'false');
    expect(container.querySelector('[data-part="navigation-sidebar"]')).not.toBeNull();
  });
});

describe('AppShell (WO-FAM-11 cut) — accessibility', () => {
  it('gives the skip link a real first-tab-stop path into the content landmark', () => {
    const { container } = renderShell(DESKTOP_CONTEXT);
    const skip = container.querySelector('[data-part="skip-link"]') as HTMLAnchorElement;
    const main = container.querySelector('main') as HTMLElement;

    // The link is the first tabbable node and resolves to the landmark that
    // can take programmatic focus.
    expect(container.querySelector('a, button')).toBe(skip);
    expect(skip.getAttribute('href')).toBe(`#${main.id}`);
    expect(main.tabIndex).toBe(-1);
    expect(skip).toHaveAccessibleName('Skip to main content');
  });

  it('names the navigation region and both of its controls', async () => {
    renderWithEngine(
      <ResponsiveContext.Provider value={TABLET_CONTEXT}>
        <AppShell sidebar={SIDEBAR}>
          <p>Page content</p>
        </AppShell>
      </ResponsiveContext.Provider>,
      'modern',
    );
    const trigger = screen.getByRole('button', { name: 'Open Primary navigation' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    const dialog = await screen.findByRole(
      'dialog',
      { name: 'Primary navigation' },
      { timeout: 15_000 },
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(dialog).getByRole('button', { name: 'Close Primary navigation' })).toBeTruthy();
  });
});
