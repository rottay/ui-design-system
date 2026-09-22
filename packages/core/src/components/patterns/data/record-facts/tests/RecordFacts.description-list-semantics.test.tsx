/**
 * The facts grid is a real description list, and axe agrees.
 *
 * axe-core's `dlitem` check walks out of AT MOST ONE wrapper, and only when
 * that wrapper carries no explicit role:
 *
 *   if (parentTagName === 'DIV' && ['presentation','none',null].includes(parentRole)) {
 *     parent = composedParent(parent); …
 *   }
 *   if (parentTagName !== 'DL') return false;
 *
 * This family used to nest `div.fact > div.fact-copy > dt/dd` — two levels —
 * so every pair was orphaned (SERIOUS dlitem + definition-list, WCAG 1.3.1).
 * The copy wrapper is gone and its two layout duties moved onto the pair via
 * `data-has-icon` (which track) and `data-rows` (how far the icon spans).
 *
 * The empty state is a second, independent cause: the Empty primitive is not a
 * term/definition pair, so the grid is a plain <div> in that state.
 *
 * Sibling law: Descriptions.description-list-semantics.test.tsx.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import axe from 'axe-core';

import { RecordFactsEngine } from '../engines/foundation';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/presentation/components/skin/record-facts/index.css',
  ),
  'utf8',
);

const RULES = ['dlitem', 'definition-list', 'aria-required-children', 'aria-required-parent'];

afterEach(cleanup);

const icon = <span aria-hidden="true">i</span>;

const FACTS = [
  { key: 'a', label: 'Reviewer', value: 'Jane Doe' },
  { key: 'b', label: 'Status', value: 'Pending', supporting: 'since Tuesday' },
];
const FACTS_WITH_ICON = FACTS.map((fact) => ({ ...fact, icon }));

const audit = (root: Element) =>
  axe.run(root, { runOnly: { type: 'rule', values: RULES } });

const violationIds = (r: Awaited<ReturnType<typeof audit>>) => r.violations.map((v) => v.id);
const passedNodes = (r: Awaited<ReturnType<typeof audit>>, id: string) =>
  r.passes.find((p) => p.id === id)?.nodes.length ?? 0;

describe.each([
  ['without icons', FACTS],
  ['with icons', FACTS_WITH_ICON],
])('RecordFacts description list %s', (_label, facts) => {
  const tree = <RecordFactsEngine title="Record" facts={facts} />;

  it('builds the pairs from native dl/dt/dd', () => {
    const { container } = render(tree);
    const grid = container.querySelector("[data-part='grid']")!;

    expect(grid.tagName).toBe('DL');
    const wrappers = Array.from(container.querySelectorAll("[data-part='fact']"));
    expect(wrappers).toHaveLength(2);
    for (const wrapper of wrappers) {
      expect(wrapper.tagName).toBe('DIV');
      expect(wrapper.parentElement).toBe(grid);
      expect(wrapper.querySelector('dt')).not.toBeNull();
      expect(wrapper.querySelector('dd')).not.toBeNull();
    }
  });

  it('leaves the dl and every fact wrapper roleless', () => {
    const { container } = render(tree);
    expect(container.querySelector("[data-part='grid']")!.hasAttribute('role')).toBe(false);
    for (const wrapper of container.querySelectorAll("[data-part='fact']")) {
      expect(wrapper.hasAttribute('role')).toBe(false);
    }
  });

  it('puts exactly one wrapper between the dl and each dt/dd', () => {
    const { container } = render(tree);
    const items = container.querySelectorAll('dt, dd');
    expect(items.length).toBe(5);
    for (const item of items) {
      expect(item.parentElement!.tagName).toBe('DIV');
      expect(item.parentElement!.parentElement!.tagName).toBe('DL');
    }
  });

  it('carries the two stamps the skin needs now that the copy wrapper is gone', () => {
    const { container } = render(tree);
    const hasIcons = facts === FACTS_WITH_ICON;
    for (const wrapper of container.querySelectorAll("[data-part='fact']")) {
      expect(wrapper.getAttribute('data-has-icon')).toBe(hasIcons ? 'true' : 'false');
      const rows = wrapper.querySelectorAll('dt, dd').length;
      expect(wrapper.getAttribute('data-rows')).toBe(String(rows));
    }
  });

  it('reports no axe structure violation, over a non-vacuous corpus', async () => {
    const { container } = render(tree);
    const result = await audit(container);
    expect(violationIds(result)).toEqual([]);
    expect(passedNodes(result, 'dlitem')).toBe(5);
    expect(passedNodes(result, 'definition-list')).toBe(1);
  });

  it('DRILL: a role on a fact wrapper reds dlitem', async () => {
    const { container } = render(tree);
    container.querySelector("[data-part='fact']")!.setAttribute('role', 'listitem');
    expect(violationIds(await audit(container))).toContain('dlitem');
  });

  it('DRILL: re-introducing the copy wrapper reds dlitem', async () => {
    const { container } = render(tree);
    const wrapper = container.querySelector("[data-part='fact']")!;
    const copy = document.createElement('div');
    copy.append(...Array.from(wrapper.querySelectorAll('dt, dd')));
    wrapper.append(copy);
    expect(violationIds(await audit(container))).toContain('dlitem');
  });
});

describe('RecordFacts empty state', () => {
  it('renders no description list when there is no pair to list', async () => {
    const { container } = render(<RecordFactsEngine title="Record" facts={[]} />);
    const grid = container.querySelector("[data-part='grid']")!;

    expect(grid.tagName).toBe('DIV');
    expect(container.querySelectorAll('dl')).toHaveLength(0);
    expect(container.querySelector("[data-part='empty']")).not.toBeNull();
    expect(violationIds(await audit(container))).toEqual([]);
  });

  it('DRILL: putting the empty state back inside a <dl> reds definition-list', async () => {
    const { container } = render(<RecordFactsEngine title="Record" facts={[]} />);
    const grid = container.querySelector("[data-part='grid']")!;
    const dl = document.createElement('dl');
    dl.className = grid.className;
    dl.append(...Array.from(grid.childNodes));
    grid.replaceWith(dl);

    expect(violationIds(await audit(container))).toContain('definition-list');
  });

  it('keeps the skeleton state a description list of aria-hidden pairs', async () => {
    const { container } = render(<RecordFactsEngine title="Record" facts={[]} loading />);
    expect(container.querySelector("[data-part='grid']")!.tagName).toBe('DL');
    expect(violationIds(await audit(container))).toEqual([]);
  });
});

describe('RecordFacts skin contract', () => {
  it('reads the stamps that replaced the copy wrapper, and no longer reads the wrapper', () => {
    expect(SKIN).not.toContain('fact-copy');
    expect(SKIN).toMatch(/__fact\[data-has-icon="true"\]\s*>\s*dt/u);
    expect(SKIN).toMatch(/__fact\[data-rows="3"\]/u);
    // The pair are grid items now, so a symmetric `gap` would open a row gap
    // the block-flow copy box never had.
    expect(SKIN).toMatch(/row-gap:\s*0/u);
  });
});
