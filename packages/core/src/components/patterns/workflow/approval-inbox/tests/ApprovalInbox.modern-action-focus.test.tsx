import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ApprovalGroup } from '../contracts';
import ModernApprovalInbox from '../engines/modern';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/approval-inbox/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

const ACTION_PARTS = ['item-action-button', 'batch-approve-button', 'batch-clear-button'];

const GROUPS: ApprovalGroup[] = [
  {
    domain: 'Finance',
    items: [{ id: 'a', title: 'Invoice a', submittedAt: '2026-03-18T10:00:00.000Z' }],
  },
];

function rulesNaming(part: string): Array<{ selector: string; body: string }> {
  return [...SKIN.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map((match) => ({ selector: match[1], body: match[2] }))
    .filter((rule) => rule.selector.includes(`[data-part='${part}']`));
}

const ROOT_FOCUS =
  ".ds-pattern-approval-inbox.ds-engine-modern[data-part='root']:is([data-state~='focus-visible'], :focus-visible)";

function declarationsOf(css: string): Array<{ selector: string; declarations: string[] }> {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1].trim().replace(/\s+/g, ' '),
    declarations: match[2]
      .split(';')
      .map((declaration) => declaration.trim().replace(/\s+/g, ' '))
      .filter(Boolean),
  }));
}

function renderWithSelection() {
  const view = render(
    <ModernApprovalInbox
      groups={GROUPS}
      onApprove={() => undefined}
      onReject={() => undefined}
      onBatchApprove={() => undefined}
    />,
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Invoice a' }));
  return view;
}

describe('Modern ApprovalInbox — actions wear the Button focus signature', () => {
  it('renders every action as a keyboard-reachable DS Button that keeps its part', () => {
    const { container } = renderWithSelection();

    const actions = ACTION_PARTS.flatMap((part) => [
      ...container.querySelectorAll(`[data-part="${part}"]`),
    ]);
    expect(actions).toHaveLength(4);
    for (const action of actions) {
      expect(action.tagName).toBe('BUTTON');
      expect(action).toHaveClass('ds-button', 'ds-button--modern');
      expect(action).toHaveAttribute('data-variant');
      expect(action).not.toHaveAttribute('tabindex', '-1');
    }
  });

  it('paints no focus indicator of its own on the composed Buttons', () => {
    // A pattern-level outline matched the Button ring rule's specificity and
    // drew a solid contour over the `underline` and `glow` signatures.
    for (const part of ACTION_PARTS) {
      for (const rule of rulesNaming(part)) {
        expect(rule.selector).not.toMatch(/focus/);
        expect(rule.body).not.toMatch(/(^|[\s;])outline(-[a-z]+)?\s*:/);
        expect(rule.body).not.toContain('--ds-button-focus-ring');
        expect(rule.body).not.toContain('--ds-focus-ring');
      }
    }
  });

  it('offers no interactive part besides the composed DS primitives', () => {
    const { container } = renderWithSelection();

    const tabStops = [
      ...container.querySelectorAll('button, a[href], input, select, textarea, [tabindex]'),
    ].filter((node) => node.getAttribute('tabindex') !== '-1');
    for (const node of tabStops) {
      const isButton = node.classList.contains('ds-button');
      const isCheckbox = node.matches('input[type="checkbox"]');
      expect(isButton || isCheckbox).toBe(true);
    }
    expect(container.querySelector('[data-part="item"]')).not.toHaveAttribute('tabindex');
  });

  it('dresses the hand-off root in the focus signature, carried above its content', () => {
    const { container } = renderWithSelection();
    const root = container.querySelector<HTMLElement>('[data-part="root"]');
    expect(root?.tabIndex).toBe(-1);

    const forcedStart = SKIN.indexOf('@media (forced-colors: active)');
    const forcedEnd = SKIN.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(forcedStart).toBeGreaterThan(-1);
    expect(forcedEnd).toBeGreaterThan(forcedStart);
    const authored = declarationsOf(SKIN.slice(0, forcedStart) + SKIN.slice(forcedEnd));
    const forced = declarationsOf(SKIN.slice(forcedStart, forcedEnd));
    const named = (rules: typeof authored, selector: string) =>
      rules.filter((rule) => rule.selector === selector).map((rule) => rule.declarations);

    expect(named(authored, ROOT_FOCUS)).toEqual([
      [
        'outline: var(--ds-focus-ring-width) solid transparent',
        'outline-offset: var(--ds-focus-ring-offset)',
      ],
    ]);
    expect(named(authored, `${ROOT_FOCUS}::after`)).toEqual([
      [
        'position: absolute',
        'inset: 0',
        'z-index: var(--ds-z-index-relative-above, 1)',
        "content: ''",
        'border-radius: var(--ds-radius-lg)',
        'box-shadow: var(--ds-focus-ring)',
        'pointer-events: none',
      ],
    ]);
    const rest = named(authored, ".ds-pattern-approval-inbox.ds-engine-modern[data-part='root']");
    expect(rest.flat()).toContain('position: relative');

    expect(named(forced, ROOT_FOCUS)).toEqual([
      [
        'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
        'outline-offset: var(--ds-focus-ring-offset)',
      ],
    ]);
    expect(named(forced, `${ROOT_FOCUS}::after`)).toEqual([['display: none']]);

    for (const rule of [...authored, ...forced]) {
      const readsSignature = rule.declarations.some((declaration) => declaration.includes('--ds-focus-ring'));
      if (readsSignature) expect(rule.selector.startsWith(ROOT_FOCUS)).toBe(true);
    }
    expect(SKIN).not.toContain('--ds-focus-ring-color');
  });
});
