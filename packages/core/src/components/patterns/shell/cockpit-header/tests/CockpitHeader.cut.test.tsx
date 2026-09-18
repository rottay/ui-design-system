/**
 * CockpitHeader, WO-FAM-10 sub-lot E.
 *
 * What this suite owns: the DOM and skin contract the family cut changed. The
 * card, the trail and every interactive crumb read their hover, press and
 * keyboard ring off the shared kernel's `data-state`; the loading state is the
 * shared anatomy renderer; and the back control is no longer painted by reaching
 * into the Button's internals.
 */

import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernCockpitHeader from '../engines/modern';

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/runtime/engines/modern/skin/cockpit-header/index.css',
  ),
  'utf8',
);
/** The skin with its prose removed, so a rule is a rule and never a sentence. */
const RULES = SKIN.replace(/\/\*[\s\S]*?\*\//g, '');

const CRUMBS = [{ label: 'Home', href: '/' }, { label: 'Detail' }];

describe('CockpitHeader (WO-FAM-10 cut) — the kernel decides interaction', () => {
  it('decides the card hover and press once, in the kernel, and reads them off data-state', () => {
    const { container } = render(<ModernCockpitHeader title="Detail" />);
    const root = container.querySelector('[data-part="root"]') as HTMLElement;

    expect(root.getAttribute('data-state')).toBeNull();

    fireEvent.pointerEnter(root);
    expect(root.getAttribute('data-state')).toBe('hovered');

    fireEvent.pointerDown(root);
    expect(root.getAttribute('data-state')).toContain('pressed');

    fireEvent.pointerUp(root);
    fireEvent.pointerLeave(root);
    expect(root.getAttribute('data-state')).toBeNull();
  });

  it('never reports the card keyboard-focused because a part inside it is', () => {
    const { container } = render(
      <ModernCockpitHeader title="Detail" breadcrumbs={CRUMBS} />,
    );
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    const home = screen.getByRole('link', { name: 'Home' });

    act(() => home.focus());

    // The crumb owns the ring; the card it sits in owns no focus state at all.
    expect(home.getAttribute('data-state')).toContain('focus-visible');
    expect(root.getAttribute('data-state')).toBeNull();
  });

  it('gives an interactive crumb the full triad and leaves the terminal crumb stateless', () => {
    const { container } = render(
      <ModernCockpitHeader title="Detail" breadcrumbs={CRUMBS} />,
    );
    const link = screen.getByRole('link', { name: 'Home' });
    const terminal = container.querySelector(
      '[data-part="crumb"][data-last="true"]',
    ) as HTMLElement;

    fireEvent.pointerEnter(link);
    expect(link.getAttribute('data-state')).toBe('hovered');
    fireEvent.pointerDown(link);
    expect(link.getAttribute('data-state')).toContain('pressed');
    fireEvent.pointerUp(link);
    fireEvent.pointerLeave(link);
    expect(link.getAttribute('data-state')).toBeNull();

    // The current page is not a control: it never carries an interaction state.
    expect(terminal.getAttribute('data-state')).toBeNull();
    expect(terminal).toHaveAttribute('aria-current', 'page');
  });

  it('gives the focusable trail its own ring state', async () => {
    const { container } = render(
      <ModernCockpitHeader title="Detail" breadcrumbs={CRUMBS} />,
    );
    const trail = container.querySelector('[data-part="breadcrumb"]') as HTMLElement;
    expect(trail).toHaveAttribute('tabindex', '0');

    act(() => trail.focus());
    await waitFor(() => expect(trail.getAttribute('data-state')).toContain('focus-visible'));

    act(() => trail.blur());
    await waitFor(() => expect(trail.getAttribute('data-state')).toBeNull());
  });
});

describe('CockpitHeader (WO-FAM-10 cut) — the skin owns no other component', () => {
  it('states the back control through the Button channels instead of selecting into it', () => {
    // The retired rules painted `[data-part="back"] > .ds-button` directly. What
    // is left is one geometry rule; every paint value is a channel the Button
    // itself reads, so its hover, press and ring stay its own decision.
    const reaches = RULES.match(/[^\n{}]*\.ds-button[^\n{}]*\{[^}]*\}/g) ?? [];
    expect(reaches).toHaveLength(1);
    expect(reaches[0]).toContain('flex-shrink: 0');
    expect(reaches[0]).not.toMatch(/background|color|border|box-shadow|outline/);

    for (const channel of [
      '--ds-button-ghost-color:',
      '--ds-button-ghost-bg-hover:',
      '--ds-button-ghost-border-hover:',
      '--ds-button-ghost-color-hover:',
      '--ds-button-ghost-bg-active:',
      '--ds-button-ghost-border-active:',
      '--ds-button-ghost-color-active:',
    ]) {
      expect(RULES, channel).toContain(channel);
    }
  });

  it('pairs every state pseudo-class with the token the kernel stamps', () => {
    const chunks = RULES.split('{').map((chunk) => (chunk.split('}').pop() ?? '').trim());
    for (const [pseudo, twin] of [
      [':hover', 'hovered'],
      [':active', 'pressed'],
      [':focus-visible', 'focus-visible'],
    ] as const) {
      for (const selector of chunks.filter((chunk) => chunk.includes(pseudo))) {
        expect({ pseudo, selector }).toEqual({
          pseudo,
          selector: expect.stringContaining(`data-state~='${twin}'`),
        });
      }
    }
  });

  it('owns no skeleton part, no skeleton geometry and no pulse of its own', () => {
    expect(RULES).not.toContain('skeleton');
    expect(RULES).not.toContain('pulse');
  });
});
