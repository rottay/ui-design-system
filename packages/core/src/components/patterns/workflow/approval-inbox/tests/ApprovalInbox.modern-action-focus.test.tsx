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
});
