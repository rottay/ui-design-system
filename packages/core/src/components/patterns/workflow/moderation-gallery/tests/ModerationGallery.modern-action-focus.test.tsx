import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ModerationItem } from '../contracts';
import ModernModerationGallery from '../engines/modern';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/moderation-gallery/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

const ACTION_PARTS = [
  'card-action-button',
  'bulk-approve-button',
  'bulk-reject-button',
  'bulk-clear-button',
];

const ITEMS: ModerationItem[] = [
  {
    id: '1',
    thumbnailUrl: '/img/ana.jpg',
    type: 'image',
    status: 'pending',
    uploadedBy: 'Ana',
    uploadedAt: '2026-03-18T10:00:00.000Z',
  },
];

function rulesNaming(part: string): Array<{ selector: string; body: string }> {
  return [...SKIN.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map((match) => ({ selector: match[1], body: match[2] }))
    .filter((rule) => rule.selector.includes(`[data-part='${part}']`));
}

function renderWithSelection() {
  const view = render(
    <ModernModerationGallery
      items={ITEMS}
      selectable
      onApprove={() => undefined}
      onReject={() => undefined}
      onBulkAction={() => undefined}
    />,
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select media by Ana' }));
  return view;
}

describe('Modern ModerationGallery — actions wear the Button focus signature', () => {
  it('renders every action as a keyboard-reachable DS Button that keeps its part', () => {
    const { container } = renderWithSelection();

    const actions = ACTION_PARTS.flatMap((part) => [
      ...container.querySelectorAll(`[data-part="${part}"]`),
    ]);
    expect(actions).toHaveLength(5);
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
    for (const part of ['card', 'card-media', 'card-thumbnail']) {
      expect(container.querySelector(`[data-part="${part}"]`)).not.toHaveAttribute('tabindex');
    }
  });
});
