/**
 * The two public paths to a `Stepper.Step`, measured side by side (owner
 * ruling 2026-10-01, WO-EVI-02).
 *
 * - The CONTAINER path: `<Stepper clickable onChange>` with `Stepper.Step`
 *   children. Every engine flattens each child into an item (title,
 *   description, subTitle, icon, status, disabled) and drops its `onClick`, so
 *   the engine track renders and `.ds-stepper-step` never does.
 * - The STANDALONE path: `<StepperStep onClick>`, exported and public. It
 *   renders `.ds-stepper-step[data-clickable='true']`, the interaction kernel
 *   stamps its states, and the stepper-compounds skin's clickable paint fires.
 *
 * The standalone path is a supported public surface, NOT dead paint: its
 * clickable rules are reachable through it and unreachable through the
 * container. A future unification of the two paths must preserve this
 * contract. Which skin selectors each path reaches is pinned below by exact
 * list, so a path that gains or loses a rule reddens here.
 */
import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { fireEvent, render } from '@testing-library/react';
import postcss from 'postcss';
import { describe, expect, it, vi } from 'vitest';

import ModernStepper from '../engines/modern';
import { StepperContent, StepperStep } from '../compound';
import { measureArms } from '@tests/support/family-causality';

const SKIN = join(
  process.cwd(),
  'src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css',
);

/** Every selector the stepper-compounds skin authors, comma lists split, in source order. */
function skinSelectors(): string[] {
  const selectors: string[] = [];
  postcss.parse(readFileSync(SKIN, 'utf8')).walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && /keyframes$/u.test((rule.parent as postcss.AtRule).name)) return;
    for (const selector of rule.selectors) if (!selectors.includes(selector)) selectors.push(selector);
  });
  return selectors;
}

/** The skin selectors that reach at least one node under `host`. */
function reached(host: ParentNode, selectors: readonly string[]): string[] {
  return selectors.filter((selector) => host.querySelectorAll(selector).length > 0);
}

/** Every user-action state the kernel serializes, stamped at once so each state rule can match. */
const ALL_STATES = 'hovered pressed focused focus-visible';

const CLICKABLE_RULES = [
  ".ds-stepper-step[data-clickable='true']",
  ".ds-stepper-step[data-clickable='true']:is([data-state~='focus-visible'], :focus-visible)",
  ".ds-stepper-step[data-clickable='true']:is([data-state~='hovered'], :hover) [data-part='label']",
  ".ds-stepper-step[data-clickable='true']:is([data-state~='hovered'], :hover) [data-part='icon']",
  ".ds-stepper-step[data-clickable='true']:is([data-state~='pressed'], :active) [data-part='icon']",
];

function Container({ onStep, onChange }: { onStep: () => void; onChange: (index: number) => void }) {
  return (
    <ModernStepper current={0} clickable onChange={onChange}>
      <StepperStep title="Account" description="Create it" onClick={onStep} />
      <StepperStep title="Profile" onClick={onStep} />
      <StepperStep title="Done" disabled onClick={onStep} />
      <StepperContent stepIndex={0}>Account form</StepperContent>
      <StepperContent stepIndex={1}>Profile form</StepperContent>
    </ModernStepper>
  );
}

describe('Stepper.Step: the container path and the standalone path', () => {
  it('the skin under test is the one the probe reads, and it authors the clickable paint', () => {
    const selectors = skinSelectors();
    for (const rule of CLICKABLE_RULES) expect(selectors, rule).toContain(rule);
  });

  it('CONTAINER: the engine flattens Stepper.Step, drops its onClick, and never renders .ds-stepper-step', () => {
    const onStep = vi.fn();
    const onChange = vi.fn();
    const { container } = render(<Container onStep={onStep} onChange={onChange} />);

    expect(container.querySelectorAll('.ds-stepper-step')).toHaveLength(0);
    expect(container.querySelectorAll('.ds-stepper-connector')).toHaveLength(0);
    // The engine track carries the clickable item instead: an <li> with a trigger button.
    const items = container.querySelectorAll(".ds-stepper--modern [data-part='item']");
    expect(items).toHaveLength(3);
    const clickable = container.querySelectorAll(".ds-stepper--modern li[data-part='item'][data-clickable='true'] > button[data-part='trigger']");
    expect(clickable).toHaveLength(2);

    fireEvent.click(clickable[1]!);
    expect(onChange).toHaveBeenCalledWith(1);
    expect(onStep).not.toHaveBeenCalled();
  });

  it('CONTAINER: of the stepper-compounds skin, only the content-panel rules reach a node, even with every state stamped', () => {
    const { container } = render(<Container onStep={vi.fn()} onChange={vi.fn()} />);
    for (const node of container.querySelectorAll("[data-part='item'], [data-part='trigger']")) node.setAttribute('data-state', ALL_STATES);
    const hit = reached(container, skinSelectors());
    expect(hit.filter((selector) => !selector.startsWith('.ds-stepper-content'))).toEqual([]);
    expect(hit).toEqual([
      ".ds-stepper-content[data-part='panel']:not([data-animation='none'])",
    ]);
    for (const rule of CLICKABLE_RULES) expect(hit, rule).not.toContain(rule);
  });

  it('STANDALONE: <StepperStep onClick> is clickable, kernel-stamped, and activates by pointer and keyboard', () => {
    const onClick = vi.fn();
    const { container } = render(<StepperStep title="Standalone" stepNumber={1} onClick={onClick} />);
    const step = container.querySelector<HTMLElement>('.ds-stepper-step')!;
    expect(step).toHaveAttribute('data-clickable', 'true');
    expect(step).toHaveAttribute('role', 'button');
    expect(step).toHaveAttribute('tabindex', '0');

    fireEvent.pointerEnter(step);
    expect(step.getAttribute('data-state')?.split(' ')).toContain('hovered');
    fireEvent.click(step);
    fireEvent.keyDown(step, { key: 'Enter' });
    fireEvent.keyDown(step, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('STANDALONE: every clickable rule reaches a node; without onClick none does', () => {
    const { container } = render(
      <>
        <section id="clickable"><StepperStep title="Clickable" stepNumber={1} onClick={vi.fn()} /></section>
        <section id="inert"><StepperStep title="Inert" stepNumber={1} /></section>
      </>,
    );
    for (const node of container.querySelectorAll('.ds-stepper-step')) node.setAttribute('data-state', ALL_STATES);
    const clickable = reached(container.querySelector('#clickable')!, skinSelectors());
    const inert = reached(container.querySelector('#inert')!, skinSelectors());
    for (const rule of CLICKABLE_RULES) {
      expect(clickable, rule).toContain(rule);
      expect(inert, rule).not.toContain(rule);
    }
  });
});

/**
 * The same split in a real browser: the clickable paint is COMPUTED on the
 * standalone step (cursor and corner from the `[data-clickable='true']` rule,
 * the hover lift from the kernel-stamped state), against an inert standalone
 * step as the negative control, and the container path has no node to paint.
 */
describe('Stepper.Step paths in a real browser', () => {
  const container = renderToStaticMarkup(
    <ModernStepper current={0} clickable onChange={() => undefined}>
      <StepperStep title="Account" onClick={() => undefined} />
      <StepperStep title="Profile" onClick={() => undefined} />
    </ModernStepper>,
  );
  const clickable = renderToStaticMarkup(<StepperStep title="Clickable" stepNumber={1} isLast onClick={() => undefined} />);
  const inert = renderToStaticMarkup(<StepperStep title="Inert" stepNumber={1} isLast />);
  const markup = `<div id="container">${container}</div><div id="clickable">${clickable}</div><div id="inert">${inert}</div>`;

  it('the clickable paint fires on the standalone step and has no node on the container path', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'containerStep', selector: '#container .ds-stepper-step', property: 'cursor' },
        { id: 'containerTrigger', selector: "#container [data-clickable='true'] > [data-part='trigger']", property: 'cursor' },
        { id: 'clickableCursor', selector: '#clickable .ds-stepper-step', property: 'cursor' },
        { id: 'inertCursor', selector: '#inert .ds-stepper-step', property: 'cursor' },
        { id: 'clickableRadius', selector: '#clickable .ds-stepper-step', property: 'border-top-left-radius' },
        { id: 'inertRadius', selector: '#inert .ds-stepper-step', property: 'border-top-left-radius' },
        { id: 'clickableHover', selector: "#clickable .ds-stepper-step [data-part='icon']", property: 'box-shadow', attributes: { 'data-state': 'hovered' }, attributesOn: '#clickable .ds-stepper-step' },
        { id: 'inertHover', selector: "#inert .ds-stepper-step [data-part='icon']", property: 'box-shadow', attributes: { 'data-state': 'hovered' }, attributesOn: '#inert .ds-stepper-step' },
      ],
    });
    const r = result.base!;
    expect(r.containerStep).toBe('<no match: #container .ds-stepper-step>');
    expect(r.containerTrigger).not.toMatch(/^<no match/u);
    expect(r.clickableCursor).toBe('pointer');
    expect(r.inertCursor).not.toBe('pointer');
    expect(r.clickableRadius).not.toBe(r.inertRadius);
    expect(r.clickableHover).not.toBe(r.inertHover);
  }, 60_000);
});
