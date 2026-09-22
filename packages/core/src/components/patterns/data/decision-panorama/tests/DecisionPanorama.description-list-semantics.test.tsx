/**
 * The context facts are a real description list, and axe agrees.
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
 * The copy wrapper is gone; `data-has-icon` carries the track it used to pick
 * implicitly, and the skin declares the two rows the icon spans.
 *
 * Sibling laws: RecordFacts / Descriptions .description-list-semantics.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import axe from 'axe-core';

import { DecisionPanoramaEngine } from '../engines/foundation';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/presentation/components/skin/decision-panorama/index.css',
  ),
  'utf8',
);

const RULES = ['dlitem', 'definition-list', 'aria-required-children', 'aria-required-parent'];

afterEach(cleanup);

const icon = <span aria-hidden="true">i</span>;

const FACTS = [
  { key: 'a', label: 'Cost', value: '10' },
  { key: 'b', label: 'Owner', value: 'Jane', supporting: 'primary' },
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
])('DecisionPanorama context facts %s', (_label, contextFacts) => {
  const tree = <DecisionPanoramaEngine contextLabel="Context" title="T" contextFacts={contextFacts} />;

  it('builds the pairs from native dl/dt/dd', () => {
    const { container } = render(tree);
    const list = container.querySelector('dl')!;

    const wrappers = Array.from(container.querySelectorAll("[data-part='fact']"));
    expect(wrappers).toHaveLength(2);
    for (const wrapper of wrappers) {
      expect(wrapper.tagName).toBe('DIV');
      expect(wrapper.parentElement).toBe(list);
      expect(wrapper.querySelector('dt')).not.toBeNull();
      expect(wrapper.querySelector('dd')).not.toBeNull();
    }
  });

  it('leaves the dl and every fact wrapper roleless', () => {
    const { container } = render(tree);
    expect(container.querySelector('dl')!.hasAttribute('role')).toBe(false);
    for (const wrapper of container.querySelectorAll("[data-part='fact']")) {
      expect(wrapper.hasAttribute('role')).toBe(false);
    }
  });

  it('puts exactly one wrapper between the dl and each dt/dd', () => {
    const { container } = render(tree);
    const items = container.querySelectorAll('dt, dd');
    expect(items.length).toBe(4);
    for (const item of items) {
      expect(item.parentElement!.tagName).toBe('DIV');
      expect(item.parentElement!.parentElement!.tagName).toBe('DL');
    }
  });

  it('carries the stamp the skin needs now that the copy wrapper is gone', () => {
    const { container } = render(tree);
    const hasIcons = contextFacts === FACTS_WITH_ICON;
    for (const wrapper of container.querySelectorAll("[data-part='fact']")) {
      expect(wrapper.getAttribute('data-has-icon')).toBe(hasIcons ? 'true' : 'false');
    }
  });

  it('reports no axe structure violation, over a non-vacuous corpus', async () => {
    const { container } = render(tree);
    const result = await audit(container);
    expect(violationIds(result)).toEqual([]);
    expect(passedNodes(result, 'dlitem')).toBe(4);
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

describe('DecisionPanorama skin contract', () => {
  it('reads the stamp that replaced the copy wrapper, and no longer reads the wrapper', () => {
    expect(SKIN).not.toContain('fact-copy');
    expect(SKIN).toMatch(/__fact\[data-has-icon='true'\]\s*>\s*dt/u);
    // `grid-row: 1 / -1` only spans when the explicit rows exist.
    expect(SKIN).toMatch(/grid-template-rows:\s*auto auto/u);
    expect(SKIN).toMatch(/row-gap:\s*0/u);
  });
});
