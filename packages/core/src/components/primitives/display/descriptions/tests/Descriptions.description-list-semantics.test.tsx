/**
 * The modern engine renders a real description list, and axe agrees.
 *
 * `<dl>` may group each term/definition pair in a `<div>` (HTML 5.2+), but
 * axe-core's `dlitem` check walks out of AT MOST ONE wrapper and only when that
 * wrapper carries no explicit role:
 *
 *   if (parentTagName === 'DIV' && ['presentation','none',null].includes(parentRole)) {
 *     parent = composedParent(parent); …
 *   }
 *   if (parentTagName !== 'DL') return false;
 *
 * The engine used to stamp `role="list"` / `role="listitem"` on that pair, which
 * pinned the wrapper as a listitem, stopped the unwrap and orphaned every
 * `<dt>`/`<dd>` (SERIOUS dlitem, WCAG 1.3.1 — route batch + the 2026-09-20
 * whitelabel data-display run). The roles are gone; this file is why they cannot
 * come back, and the drills below prove each law reds on the real regression.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import axe from 'axe-core';

import { ModernDescriptions, ModernItem } from '../engines/modern';

const SOURCE = readFileSync(join(__dirname, '../engines/modern/index.tsx'), 'utf8');

/** The four rules that decide whether this markup is a description list. */
const RULES = ['dlitem', 'definition-list', 'aria-required-children', 'aria-required-parent'];

afterEach(cleanup);

const tree = (layout: 'horizontal' | 'vertical') => (
  <ModernDescriptions title="Profile" layout={layout} bordered>
    <ModernItem label="Name">Ada Lovelace</ModernItem>
    <ModernItem label="Role" span={2}>Staff Engineer</ModernItem>
    <ModernItem label="Tenure">7 years</ModernItem>
  </ModernDescriptions>
);

async function audit(root: Element) {
  return axe.run(root, { runOnly: { type: 'rule', values: RULES } });
}

const violationIds = (result: Awaited<ReturnType<typeof audit>>) =>
  result.violations.map((violation) => violation.id);

const passedNodes = (result: Awaited<ReturnType<typeof audit>>, id: string) =>
  result.passes.find((pass) => pass.id === id)?.nodes.length ?? 0;

describe.each(['horizontal', 'vertical'] as const)('Descriptions modern %s semantics', (layout) => {
  it('builds the pairs from native dl/dt/dd', () => {
    const { container } = render(tree(layout));
    const rows = container.querySelector("[data-part='rows']")!;

    expect(rows.tagName).toBe('DL');
    const wrappers = Array.from(container.querySelectorAll("[data-part='row']"));
    expect(wrappers).toHaveLength(3);
    for (const wrapper of wrappers) {
      expect(wrapper.tagName).toBe('DIV');
      expect(wrapper.parentElement).toBe(rows);
      expect(wrapper.querySelector("[data-part='label']")!.tagName).toBe('DT');
      expect(wrapper.querySelector("[data-part='content']")!.tagName).toBe('DD');
    }
  });

  it('leaves the dl and every row wrapper roleless, so the native mapping stands', () => {
    const { container } = render(tree(layout));

    expect(container.querySelector("[data-part='rows']")!.hasAttribute('role')).toBe(false);
    for (const wrapper of container.querySelectorAll("[data-part='row']")) {
      expect(wrapper.hasAttribute('role')).toBe(false);
    }
  });

  it('puts exactly one wrapper between the dl and each dt/dd', () => {
    const { container } = render(tree(layout));

    // axe walks out of ONE div. A second nesting level orphans the pair just as
    // surely as a role does, which is why this is a law and not an accident.
    for (const item of container.querySelectorAll('dt, dd')) {
      expect(item.parentElement!.tagName).toBe('DIV');
      expect(item.parentElement!.parentElement!.tagName).toBe('DL');
    }
  });

  it('reports no axe structure violation, over a non-vacuous corpus', async () => {
    const { container } = render(tree(layout));
    const result = await audit(container);

    expect(violationIds(result)).toEqual([]);
    // Floor: the rules actually RAN. `definition-list` only applies to a
    // roleless <dl>, so a nonzero count is itself proof the role is gone.
    expect(passedNodes(result, 'dlitem')).toBe(6);
    expect(passedNodes(result, 'definition-list')).toBe(1);
  });

  it('DRILL: re-stamping role="listitem" on a wrapper reds dlitem', async () => {
    const { container } = render(tree(layout));
    const wrapper = container.querySelector("[data-part='row']")!;
    wrapper.setAttribute('role', 'listitem');

    const result = await audit(container);
    expect(violationIds(result)).toContain('dlitem');
    expect(result.violations.find((v) => v.id === 'dlitem')!.nodes).toHaveLength(2);
  });

  it('DRILL: a second wrapper level reds dlitem', async () => {
    const { container } = render(tree(layout));
    const wrapper = container.querySelector("[data-part='row']")!;
    const extra = document.createElement('div');
    extra.append(...Array.from(wrapper.childNodes));
    wrapper.append(extra);

    const result = await audit(container);
    expect(violationIds(result)).toContain('dlitem');
  });
});

describe('Descriptions modern list-role source law', () => {
  it('stamps no list/listitem role in any branch of the engine', () => {
    // Both layouts are rendered above, but the scan also covers a branch a
    // future edit adds before it has a test.
    expect(SOURCE).not.toMatch(/role=["']list(item)?["']/u);
  });
});
