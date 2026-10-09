/**
 * WO-FAM-11 sub-lot C — the `page-shell` cut.
 *
 * The three things the cut changed, each asserted where it can fail: the state
 * contract is decided once by the kernel, the loading state is derived from the
 * anatomy rather than drawn beside it, and the deriver covers every channel of
 * the family's own two spellings that the skin reads.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernPageShell from '../engines/modern';
import type { PageShellProps } from '../contracts';
import { pageShellChromeDeriver } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/page-shell';
import { Button } from '@/components/primitives/inputs/button';
import { renderWithEngine } from '@tests/support/engine';

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

function buildProps(overrides: Partial<PageShellProps> = {}): PageShellProps {
  return {
    title: 'Launchpad',
    subtitle: 'Ready for launch',
    metadata: <span>12 items</span>,
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Launchpad' }],
    actions: <button type="button">Create</button>,
    tabs: [
      { key: 'overview', label: 'Overview', content: <div>Overview content</div> },
      { key: 'activity', label: 'Activity', content: <div>Activity content</div> },
    ],
    activeTab: 'overview',
    onTabChange: vi.fn(),
    children: <div>Fallback content</div>,
    ...overrides,
  };
}

describe('PatternPageShell — the FAM-11 cut', () => {
  it.each([false, true])('keeps page padding off composed Button content with loading=%s', async (loading) => {
    const { container } = renderWithEngine(
      <ModernPageShell {...buildProps({
        loading,
        tabs: undefined,
        actions: <Button>Page action</Button>,
        children: (
          <ModernPageShell title="Nested page" actions={<Button>Nested action</Button>}>
            <Button>Nested body action</Button>
          </ModernPageShell>
        ),
      })} />,
      'modern',
    );
    await waitFor(() => {
      expect(container.querySelectorAll('.ds-button.ds-button--modern')).toHaveLength(loading ? 1 : 3);
    });
    const contentRules = [...SKIN.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(
      (match) => match[1]!.includes("[data-part='content']"),
    );
    expect(contentRules).toHaveLength(1);
    const selector = contentRules[0]![1]!.trim();
    expect(selector).toBe(".ds-pattern-page-shell.ds-engine-modern > [data-part='content']");
    expect(contentRules[0]![2]!.trim()).toBe('padding: var(--ds-page-shell-content-padding);');

    const shells = [...container.querySelectorAll('.ds-pattern-page-shell.ds-engine-modern')];
    expect(shells).toHaveLength(loading ? 1 : 2);
    const ownedContent = shells.flatMap((shell) => [...shell.children].filter(
      (child) => child.matches("[data-part='content']"),
    ));
    expect(ownedContent).toHaveLength(loading ? 0 : 2);
    expect([...container.querySelectorAll(selector)]).toEqual(ownedContent);
    const buttonContent = container.querySelectorAll('.ds-button.ds-button--modern [data-part="content"]');
    expect(buttonContent).toHaveLength(loading ? 1 : 3);
    for (const content of buttonContent) expect(content.matches(selector)).toBe(false);
    if (loading) {
      const source = container.querySelector('.ds-skeleton-anatomy [data-part="source"]')!;
      expect(source).toHaveAttribute('aria-hidden', 'true');
      expect(source.querySelector('[data-part="header"]')).not.toBeNull();
      expect(source.querySelector('.ds-button.ds-button--modern')).not.toBeNull();
    }
  });

  it('decides hover once, in the kernel, for the panel and its identity tile', () => {
    const { container } = render(<ModernPageShell {...buildProps({ icon: <span>I</span> })} />);
    const header = container.querySelector('[data-part="header"]') as HTMLElement;

    expect(header).not.toHaveAttribute('data-state');
    fireEvent.pointerEnter(header);
    expect(header.getAttribute('data-state')).toContain('hovered');
    fireEvent.pointerLeave(header);
    expect(header).not.toHaveAttribute('data-state');
  });

  it('decides press and the ring on the crumb link and on the tab', () => {
    const { container } = render(<ModernPageShell {...buildProps()} />);
    // P-88: the crumb link keeps the Link's own part; it is found by the family class.
    const crumb = container.querySelector('.ds-pattern-page-shell__crumb[data-interactive="true"]') as HTMLElement;
    expect(container.querySelector('a[data-part="crumb"]')).toBeNull();
    const tab = container.querySelectorAll('[data-part="tab"]')[1] as HTMLElement;

    fireEvent.pointerDown(crumb);
    expect(crumb.getAttribute('data-state')).toContain('pressed');
    fireEvent.pointerUp(crumb);
    expect(crumb.getAttribute('data-state') ?? '').not.toContain('pressed');

    // A focus that did not arrive from a pointer is the keyboard's, so the
    // ring is the one the skin pairs with `:focus-visible`.
    fireEvent.focus(tab);
    expect(tab.getAttribute('data-state')).toContain('focus-visible');
  });

  it('pairs every state pseudo-class in the skin with the kernel state it stands for', () => {
    // A bare `:hover` / `:active` / `:focus-visible` is a second authority on
    // a question the kernel already answers.
    for (const match of SKIN.matchAll(/:(hover|active|focus-visible)(?![-\w])/g)) {
      const line = SKIN.slice(SKIN.lastIndexOf('\n', match.index ?? 0), match.index);
      expect({ pseudo: match[1], line }).toEqual({
        pseudo: match[1],
        line: expect.stringContaining(`[data-state~='${match[1] === 'active' ? 'pressed' : match[1] === 'hover' ? 'hovered' : 'focus-visible'}']`),
      });
    }
  });

  it('draws the loading state from the anatomy and nowhere else', () => {
    const { container } = render(<ModernPageShell {...buildProps({ loading: true })} />);

    // The shared renderer owns the stand-in; the family draws no bone of its own.
    expect(container.querySelector('.ds-skeleton-anatomy')).not.toBeNull();
    expect(container.querySelectorAll('[data-part="skeleton"]')).toHaveLength(0);
    expect(SKIN).not.toContain("[data-part='skeleton");
    expect(SKIN).not.toContain('@keyframes ds-foundation-pulse');
  });

  it('carries no visual value inline: the root writes one channel and the caller`s own style', () => {
    const { container } = render(
      <ModernPageShell {...buildProps({ maxWidth: 1200, style: { opacity: 0.5 } })} />,
    );
    const root = container.querySelector('[data-part="root"]') as HTMLElement;

    expect(root.style.getPropertyValue('--ds-page-shell-max-width')).toBe('1200px');
    // The caller's own `style` is opaque and still wins over the channel block.
    expect(root.style.opacity).toBe('0.5');
    expect(container.querySelector('[style*="border-radius"]')).toBeNull();
  });

  it('produces every channel of its own two spellings that the skin reads', () => {
    const read = new Set(
      [...SKIN.matchAll(/var\(\s*(--ds-(?:page-shell|page-header)-[a-z0-9-]+)/g)].map((m) => m[1]),
    );
    const produced = new Set<string>(pageShellChromeDeriver.produces);
    // Declared in the skin instead: a per-instance value the engine writes.
    const declaredInSkin = new Set(
      [...SKIN.matchAll(/^\s*(--ds-(?:page-shell|page-header)-[a-z0-9-]+)\s*:/gm)].map((m) => m[1]),
    );
    // Named, adjudicated and left to the authority that already owns them:
    // the expressive motif and type axes, the edge-width emphasis axis, and
    // the three names `collection-header` reads through at a second rest.
    const ownedElsewhere = new Set([
      '--ds-page-header-bg',
      '--ds-page-header-eyebrow-size',
      '--ds-page-header-eyebrow-tracking',
      '--ds-page-header-eyebrow-text-transform',
      '--ds-page-header-title-max-width',
      '--ds-page-shell-border-width',
    ]);

    const unreached = [...read].filter(
      (channel) =>
        !produced.has(channel) && !declaredInSkin.has(channel) && !ownedElsewhere.has(channel),
    );
    expect(unreached).toEqual([]);
  });
});
