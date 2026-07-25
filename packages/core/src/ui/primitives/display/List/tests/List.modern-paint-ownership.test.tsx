import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import ModernList, { Item as ModernItem, Meta as ModernMeta } from '../engines/modern';

// ---------------------------------------------------------------------------
// K3-A Pass 1 — modern List paint-ownership ratchet.
//
// The engine's static geometry (item padding/transition, meta gaps and title/
// description typography, header/footer chrome, size steps, loading opacity)
// moved out of inline styles into `modern/skin/list.css`, keyed on data-part /
// data-size / data-bordered / data-loading. Extra/actions margins are LOGICAL
// (inline-start) so they flip in RTL. Inline is reserved for the data-driven
// grid projection and the public `style` channels.
// ---------------------------------------------------------------------------

const SKIN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/list.css'
  ),
  'utf8'
);

describe('List modern — geometry lives in the skin, hooks in the DOM', () => {
  it('stamps data-size and keeps no static geometry inline on item/meta/header/footer', () => {
    const { container } = render(
      <ModernList bordered header="Team" footer="2 members" size="large">
        <ModernItem extra={<span>x</span>} actions={[<button key="a">a</button>]}>
          <ModernMeta title="Ada" description="ada@rottay.dev" />
        </ModernItem>
      </ModernList>
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-size', 'large');
    expect(root.style.fontSize).toBe('');

    const item = container.querySelector('[data-part="item"]') as HTMLElement;
    expect(item.style.padding).toBe('');
    expect(item.style.transition).toBe('');

    const meta = container.querySelector('[data-part="meta"]') as HTMLElement;
    expect(meta.style.gap).toBe('');
    const title = container.querySelector('[data-part="meta-title"]') as HTMLElement;
    expect(title.style.fontWeight).toBe('');
    const description = container.querySelector('[data-part="meta-description"]') as HTMLElement;
    expect(description.style.marginTop).toBe('');

    const extra = container.querySelector('[data-part="item-extra"]') as HTMLElement;
    const actions = container.querySelector('[data-part="item-actions"]') as HTMLElement;
    expect(extra.style.marginLeft).toBe('');
    expect(actions.style.marginLeft).toBe('');
    expect(actions.style.gap).toBe('');

    const header = container.querySelector('[data-part="header"]') as HTMLElement;
    const footer = container.querySelector('[data-part="footer"]') as HTMLElement;
    expect(header.style.padding).toBe('');
    expect(header.style.fontWeight).toBe('');
    expect(footer.style.padding).toBe('');
  });

  it('keeps the grid projection inline (it is a prop-driven data value)', () => {
    const { container } = render(
      <ModernList grid={{ column: 2, gutter: 24 }} dataSource={['a', 'b']} renderItem={(x) => <ModernItem key={String(x)}>{String(x)}</ModernItem>} />
    );
    const ul = container.querySelector('ul') as HTMLElement;
    expect(ul.style.gridTemplateColumns).toBe('repeat(2, 1fr)');
    expect(ul.style.gap).toBe('24px');
  });

  it('loading posture carries hooks only', () => {
    const { container } = render(<ModernList loading />);
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-loading', 'true');
    expect(root.style.opacity).toBe('');
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('renders the split divider as an aria-hidden li (axe `list` rule, K3-A Pass-2 regression)', () => {
    const { container } = render(
      <ModernList split>
        <ModernItem>one</ModernItem>
        <ModernItem>two</ModernItem>
      </ModernList>
    );

    const divider = container.querySelector('[data-part="divider"]') as HTMLElement;
    // axe's `list` rule requires a <ul>'s direct children to be
    // <li>/<script>/<template> only — the old <div> divider was a serious
    // violation. The <li> stays out of the accessible count via aria-hidden.
    expect(divider.tagName).toBe('LI');
    expect(divider).toHaveAttribute('aria-hidden', 'true');
    // and the <ul> contains no other non-li element
    const ul = container.querySelector('ul[data-part="list"]') as HTMLElement;
    for (const child of Array.from(ul.children)) {
      expect(child.tagName).toBe('LI');
    }
  });

  it('pins the skin rules that replaced the inline geometry', () => {
    expect(SKIN).toMatch(/\[data-size='large'\][^{]*\{[^}]*font-size:\s*var\(--ds-list-lg-font-size/);
    expect(SKIN).toMatch(/\[data-loading='true'\][^{]*\{[^}]*opacity:\s*var\(--ds-list-loading-opacity/);
    expect(SKIN).toMatch(/\[data-part='item'\][^{]*\{[^}]*padding:\s*var\(--ds-list-default-padding-vertical/);
    expect(SKIN).toMatch(/\[data-part='item-extra'\][^{]*\{[^}]*margin-inline-start/);
    expect(SKIN).toMatch(/\[data-part='item-actions'\][^{]*\{[^}]*margin-inline-start/);
    expect(SKIN).toMatch(/\[data-part='meta'\][^{]*\{[^}]*gap:\s*var\(--ds-list-meta-avatar-margin-right/);
    expect(SKIN).toMatch(/\[data-part='header'\][^{]*\{[^}]*font-weight:\s*var\(--ds-list-header-font-weight/);
    // bordered header/footer separators are full shorthands owned here
    expect(SKIN).toMatch(/\[data-bordered='true'\]\s*>\s*\[data-part='header'\][^{]*\{[^}]*border-bottom/);
    expect(SKIN).toMatch(/\[data-bordered='true'\]\s*>\s*\[data-part='footer'\][^{]*\{[^}]*border-top/);
  });

  it('pins the CONTRAST LAW mix on the meta-description ink (axe AA, K3-A Pass 2)', () => {
    // The resolved channel failed AA on bithire (3.31:1); the skin deepens it
    // 30% toward the source's own primary ink, with a raw tenant escape hatch.
    expect(SKIN).toMatch(/--ds-list-meta-description-ink/);
    expect(SKIN).toMatch(
      /\[data-part='meta-description'\][^{]*\{[^}]*color-mix\(\s*in srgb,\s*var\(--ds-list-meta-description-color,\s*var\(--ds-color-text-secondary\)\)\s*70%,\s*var\(--ds-color-text-primary\)\s*30%\s*\)/
    );
  });
});
