import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import axe from 'axe-core';
import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import type { UserProfileCardProps } from '../contracts';
import ModernUserProfileCard from '../engines/modern';

const SKIN = readFileSync(
  resolve(__dirname, '../../../../../../foundation/tokens/css/runtime/engines/modern/skin/user-profile-card/index.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

// The chrome-none gate's CHROME list: what a host may never declare on the carrier.
const CHROME = /^(background.*|border(?!-radius).*|color|box-shadow|opacity|filter|padding.*|min-block-size|min-inline-size|block-size|min-height|height|content)$/;

const USER: UserProfileCardProps['user'] = {
  name: 'Jane Doe',
  role: 'Product Manager',
  email: 'jane@example.com',
  department: 'Engineering',
  status: 'active',
};

const FOCUSABLE = 'button, a[href], input, select, textarea, [tabindex]';

function render(overrides: Partial<UserProfileCardProps> = {}) {
  return renderWithEngine(<ModernUserProfileCard user={USER} {...overrides} />, 'modern');
}

const root = (container: HTMLElement) => container.querySelector('[data-part="root"]') as HTMLElement;

function tabOrder(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter((node) => node.tabIndex >= 0 && !(node as HTMLButtonElement).disabled)
    .map((node) => (node.getAttribute('data-part') === 'card-activate' ? 'card-activate' : node.textContent ?? ''));
}

function keyboardActivations(onClick: ReturnType<typeof vi.fn>) {
  const activation = screen.getByRole('button', { name: USER.name });
  for (const key of ['Enter', ' ']) {
    onClick.mockClear();
    fireEvent.keyDown(activation, { key });
    expect(onClick).toHaveBeenCalledTimes(1);
  }
  onClick.mockClear();
  fireEvent.keyDown(activation, { key: 'a' });
  expect(onClick).not.toHaveBeenCalled();
}

async function nestedInteractive(container: HTMLElement) {
  const results = await axe.run(container, { runOnly: { type: 'rule', values: ['nested-interactive'] } });
  return results.violations;
}

const declared = (body: string) =>
  body.split(';').map((d) => d.split(':')[0].trim()).filter(Boolean);

function rules(css: string): Array<{ selector: string; body: string }> {
  const out: Array<{ selector: string; body: string }> = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(css))) out.push({ selector: match[1].replace(/@media[^{]*\{/, '').trim(), body: match[2] });
  return out;
}

const ACTIONS = (onEdit = vi.fn()) => [{ key: 'edit', label: 'Edit', onClick: onEdit }];

describe('UserProfileCard modern card activation: the keyboard parity matrix (T1)', () => {
  it.each([['full'], ['compact']] as const)('P1 %s, no extras: one activation reached by Enter and Space', (variant) => {
    const onClick = vi.fn();
    const { container } = render({ variant, onClick });
    expect(tabOrder(container)).toEqual(['card-activate']);
    keyboardActivations(onClick);
  });

  it('P2 full + actions: the activation then the action, each firing only its own callback', async () => {
    const onClick = vi.fn();
    const onEdit = vi.fn();
    const { container } = render({ onClick, actions: ACTIONS(onEdit) });
    expect(tabOrder(container)).toEqual(['card-activate', 'Edit']);
    keyboardActivations(onClick);
    onClick.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
    expect(await nestedInteractive(container)).toEqual([]);
  });

  it('P3 full + text headerExtra: the text no longer demotes the activation', () => {
    const onClick = vi.fn();
    const { container } = render({ onClick, headerExtra: <span>Pro plan</span> });
    expect(tabOrder(container)).toEqual(['card-activate']);
    keyboardActivations(onClick);
  });

  it('P4 compact + actions: actions are full-only and never demote the activation', async () => {
    const onClick = vi.fn();
    const { container } = render({ variant: 'compact', onClick, actions: ACTIONS() });
    expect(container.querySelectorAll('[data-part="action-button"]')).toHaveLength(0);
    expect(tabOrder(container)).toEqual(['card-activate']);
    keyboardActivations(onClick);
    expect(await nestedInteractive(container)).toEqual([]);
  });

  it('P5 full + actions + link headerExtra: the activation comes first in DOM order', async () => {
    const onClick = vi.fn();
    const { container } = render({
      onClick,
      actions: [{ key: 'msg', label: 'Message', onClick: vi.fn() }],
      headerExtra: <a href="#plan">Plan</a>,
    });
    expect(tabOrder(container)).toEqual(['card-activate', 'Plan', 'Message']);
    keyboardActivations(onClick);
    expect(await nestedInteractive(container)).toEqual([]);
  });

  it.each([
    ['full', {}],
    ['compact', {}],
    ['full', { actions: ACTIONS(), headerExtra: <a href="#plan">Plan</a> }],
    ['compact', { headerExtra: <span>Pro plan</span> }],
  ] as const)('P6 %s without onClick: a static card with no activation and no state', (variant, extras) => {
    const { container } = render({ variant, ...extras });
    expect(container.querySelector('[data-part="card-hit"]')).toBeNull();
    expect(container.querySelector('[data-part="card-activate"]')).toBeNull();
    // Composed action Buttons stamp their own state; the card itself stays stateless.
    expect(Array.from(container.querySelectorAll('[data-state]')).filter((node) => !node.closest('.ds-button'))).toEqual([]);
    expect(root(container)).toHaveAttribute('data-interactive', 'false');
    expect(container.querySelector('[data-part="name"]')).not.toHaveAttribute('id');
    expect(container.querySelector('[data-part="role"]')).not.toHaveAttribute('id');
  });

  it('fires once per pointer click on the activation', () => {
    const onClick = vi.fn();
    render({ onClick });
    fireEvent.click(screen.getByRole('button', { name: USER.name }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it.each([['full'], ['compact']] as const)('names the %s activation by the user and describes it by the role', (variant) => {
    const { container } = render({ variant, onClick: vi.fn() });
    const activation = container.querySelector('[data-part="card-activate"]') as HTMLElement;
    expect(activation.tagName).toBe('BUTTON');
    expect(activation).toHaveAttribute('data-chrome', 'none');
    expect(activation.parentElement).toHaveAttribute('data-part', 'card-hit');
    expect(root(container).firstElementChild).toBe(activation.parentElement);
    expect(activation).toHaveAccessibleName(USER.name);
    expect(activation).toHaveAccessibleDescription(USER.role);
    expect(activation).toHaveAttribute('title', USER.name);
    expect(activation.textContent).toBe('');
  });

  it.each([
    ['full', {}],
    ['compact', {}],
    ['full', { actions: ACTIONS(), headerExtra: <a href="#plan">Plan</a> }],
    ['compact', { actions: ACTIONS(), headerExtra: <button type="button">Follow</button> }],
  ] as const)('never nests an interactive descendant in a button (%s)', (variant, extras) => {
    const { container } = render({ variant, onClick: vi.fn(), ...extras });
    expect(root(container)).not.toHaveAttribute('role');
    expect(root(container)).not.toHaveAttribute('tabindex');
    expect(root(container)).toHaveAttribute('data-interactive', 'true');
    for (const button of container.querySelectorAll('button, [role="button"]')) {
      expect(button.querySelector(FOCUSABLE)).toBeNull();
    }
  });

  it('keeps a nested action from lighting the card', () => {
    const { container } = render({ onClick: vi.fn(), actions: ACTIONS() });
    const action = screen.getByRole('button', { name: 'Edit' });
    act(() => action.focus());
    expect(root(container).getAttribute('data-state') ?? '').not.toMatch(/\bfocus-visible\b/);
    fireEvent.pointerDown(action);
    expect(root(container).getAttribute('data-state') ?? '').not.toMatch(/\bpressed\b/);
  });

  it('stamps the root focus-visible from the activation', () => {
    const { container } = render({ onClick: vi.fn(), actions: ACTIONS() });
    act(() => screen.getByRole('button', { name: USER.name }).focus());
    expect(root(container).getAttribute('data-state')).toMatch(/\bfocus-visible\b/);
  });
});

describe('UserProfileCard modern skin keeps the carrier non-painting (T2)', () => {
  const all = rules(SKIN);

  it('declares a non-painting, corner-clipped frame', () => {
    const frame = all.find((rule) => /\[data-part='root'\] > \[data-part='card-hit'\]$/.test(rule.selector));
    const body = frame?.body.replace(/\s+/g, ' ') ?? '';
    for (const declaration of ['position: absolute', 'z-index: var(--ds-z-index-relative-above)', 'inset: 0', 'border-radius: inherit', 'clip-path: border-box', 'opacity: 0']) {
      expect(body).toContain(declaration);
    }
  });

  it('places the carrier and never touches its paint or kept arms', () => {
    const placement = all.find((rule) => /\[data-part='card-hit'\] > \[data-part='card-activate'\]$/.test(rule.selector));
    expect(placement && declared(placement.body)).toEqual(['position', 'inset', 'max-inline-size']);
    const onCarrier = all.filter((rule) => rule.selector.split(',').some((part) => /\[data-part='card-activate'\][^\s>+~]*$/.test(part.trim())));
    for (const rule of onCarrier) expect(declared(rule.body).filter((property) => CHROME.test(property))).toEqual([]);
  });

  it('lifts the nested controls and the email above the frame', () => {
    const lift = all.find((rule) => rule.selector.includes(":is([data-part='actions'], [data-part='header-extra'], [data-part='email'])"));
    expect(lift?.body.replace(/\s+/g, ' ')).toMatch(/position: relative; z-index: var\(--ds-z-index-relative-above\);/);
  });

  it('positions the interactive root for the stretched frame', () => {
    expect(all.some((rule) => /\[data-part='root'\]\[data-interactive='true'\]$/.test(rule.selector) && /position: relative/.test(rule.body))).toBe(true);
  });
});
