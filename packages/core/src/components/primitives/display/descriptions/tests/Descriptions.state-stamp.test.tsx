/**
 * Descriptions has no interactive part, so it stamps no interaction state.
 *
 * The header is a title block and a row is a `role="listitem"` inside a `<dl>`:
 * no engine gives either one a click handler, an activation key or a tab stop,
 * and the public contract declares no `onClick` / `clickable` / row callback.
 * Its skin's hover and press response is therefore a reading aid painted by the
 * platform's own pseudo-classes, NOT a kernel state -- stamping one would have
 * installed an interaction producer on a part that has no interaction, which is
 * an affordance lie (F-37 adjudication, this packet).
 *
 * This pins both halves of that decision so neither can drift back.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';

import { ModernDescriptions, ModernItem } from '../engines/modern';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css',
  ),
  'utf8',
);

afterEach(cleanup);

const tree = (
  <ModernDescriptions title="Profile" bordered>
    <ModernItem label="Name">Ada Lovelace</ModernItem>
    <ModernItem label="Role">Staff Engineer</ModernItem>
  </ModernDescriptions>
);

describe('Descriptions modern state contract', () => {
  it('reads no `data-state`: the skin decides its hover wash natively', () => {
    expect(SKIN).not.toContain('data-state');
    // The paint itself is untouched -- both responses still exist.
    expect(SKIN).toMatch(/\[data-part='header'\]:hover\s*\{/u);
    expect(SKIN).toMatch(/\[data-part='row'\]:hover\s*\{/u);
    expect(SKIN).toMatch(/\[data-part='row'\]:active\s*\{/u);
  });

  it('gives neither the header nor a row any interaction semantics', () => {
    const { container } = render(tree);
    const header = container.querySelector<HTMLElement>("[data-part='header']")!;
    const rows = container.querySelectorAll<HTMLElement>("[data-part='row']");

    expect(rows).toHaveLength(2);
    for (const node of [header, ...Array.from(rows)]) {
      expect(node.hasAttribute('tabindex')).toBe(false);
      expect(node.getAttribute('role')).not.toBe('button');
    }
    expect(header.getAttribute('role')).toBeNull();
    expect(rows[0].getAttribute('role')).toBe('listitem');
  });

  it('stamps no interaction state under pointer or focus input', () => {
    const { container } = render(tree);
    const header = container.querySelector<HTMLElement>("[data-part='header']")!;
    const row = container.querySelector<HTMLElement>("[data-part='row']")!;

    for (const node of [header, row]) {
      fireEvent.pointerEnter(node);
      fireEvent.pointerDown(node);
      fireEvent.focus(node);
      expect(node.hasAttribute('data-state')).toBe(false);
    }
  });
});
