/**
 * The Modern stepper's anatomy contract, executed: one `ds-stepper` namespace
 * across the engine track, the Step and Content compounds and the deprecated
 * Steps name; the interaction kernel deciding a clickable step's state once;
 * a content panel whose presence is not an interaction state; a track axe
 * accepts; and labels that survive a right-to-left locale.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernStepper from '../engines/modern';
import { StepperContent, StepperStep } from '../compound';

const ITEMS = [
  { title: 'Account', description: 'Create it' },
  { title: 'Profile', subTitle: 'Optional' },
  { title: 'Billing', status: 'error' as const },
  { title: 'Done', disabled: true },
];

const STRUCTURE_RULES = ['nested-interactive', 'aria-required-children', 'aria-required-parent', 'aria-allowed-role', 'aria-allowed-attr', 'list', 'listitem'];

async function violationIds(container: HTMLElement, values: string[]): Promise<string[]> {
  const results = await axe.run(container, { runOnly: { type: 'rule', values } });
  return results.violations.map((v) => v.id);
}

afterEach(() => {
  document.documentElement.dir = '';
});

describe('one namespace', () => {
  it('emits ds-stepper classes only, on the engine track and on the compounds', () => {
    const { container } = render(
      <>
        <ModernStepper items={ITEMS} current={1} clickable onChange={vi.fn()} />
        <StepperStep title="Standalone" status="finish" stepNumber={1} onClick={vi.fn()} />
        <StepperContent stepIndex={0} currentStep={0}>
          Panel
        </StepperContent>
      </>,
    );
    const classes = new Set(Array.from(container.querySelectorAll('[class]')).flatMap((el) => Array.from(el.classList)));
    const own = [...classes].filter((token) => /(^|-)step(per|s)?(-|$)/.test(token));
    expect(own.length).toBeGreaterThan(0);
    expect(own.every((token) => token.startsWith('ds-stepper'))).toBe(true);
    expect(container.querySelector('[class*="rottay-step"]')).toBeNull();
  });

  it('paints nothing inline on any part', () => {
    const { container } = render(<ModernStepper items={ITEMS} current={1} clickable onChange={vi.fn()} size="lg" variant="circles" />);
    for (const el of container.querySelectorAll('[data-part]')) {
      expect((el as HTMLElement).getAttribute('style'), `${el.getAttribute('data-part')} carries inline style`).toBeNull();
    }
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-variant', 'circles');
  });
});

describe('the kernel decides state once', () => {
  it('stamps hover, press and focus on a clickable step trigger', () => {
    render(<ModernStepper items={ITEMS} current={1} clickable onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: /Account/ });
    expect(trigger).toHaveAttribute('data-part', 'trigger');
    expect(trigger).not.toHaveAttribute('data-state');
    fireEvent.pointerEnter(trigger);
    expect(trigger).toHaveAttribute('data-state', 'hovered');
    fireEvent.pointerDown(trigger);
    expect(trigger).toHaveAttribute('data-state', 'hovered pressed');
    fireEvent.pointerUp(trigger);
    fireEvent.pointerLeave(trigger);
    expect(trigger).not.toHaveAttribute('data-state');
    fireEvent.focus(trigger);
    expect(trigger).toHaveAttribute('data-state', 'focused focus-visible');
    fireEvent.blur(trigger);
    expect(trigger).not.toHaveAttribute('data-state');
  });

  it('keeps a disabled step inert and unmarked by the kernel', () => {
    const onChange = vi.fn();
    const { container } = render(<ModernStepper items={ITEMS} current={1} clickable onChange={onChange} />);
    const done = screen.getByText('Done').closest('[data-part="item"]') as HTMLElement;
    expect(done).toHaveAttribute('data-disabled', 'true');
    expect(done.querySelector('[data-part="trigger"]')).toBeNull();
    fireEvent.click(screen.getByText('Done'));
    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelectorAll('[data-part="trigger"]')).toHaveLength(3);
  });

  it('governs the standalone Step compound the same way and keeps its keyboard activation', () => {
    const onClick = vi.fn();
    render(<StepperStep title="Compound" stepNumber={2} onClick={onClick} />);
    const step = screen.getByRole('button', { name: /Compound/ });
    expect(step).toHaveAttribute('data-part', 'item');
    fireEvent.pointerEnter(step);
    expect(step).toHaveAttribute('data-state', 'hovered');
    fireEvent.pointerLeave(step);
    fireEvent.focus(step);
    expect(step).toHaveAttribute('data-state', 'focused focus-visible');
    fireEvent.keyDown(step, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('carries the content panel lifecycle as data-presence, never as the kernel state', () => {
    render(
      <StepperContent stepIndex={0} currentStep={0}>
        Panel
      </StepperContent>,
    );
    const panel = screen.getByText('Panel');
    expect(panel).toHaveAttribute('data-part', 'panel');
    expect(panel).toHaveAttribute('data-presence', 'visible');
    expect(panel).not.toHaveAttribute('data-state');
  });
});

describe('a track axe accepts', () => {
  it('reports no structural violation with clickable, errored and disabled steps', async () => {
    const { container } = render(<ModernStepper items={ITEMS} current={1} clickable onChange={vi.fn()} />);
    expect(await violationIds(container, STRUCTURE_RULES)).toEqual([]);
  });

  it('non-vacuity guard: a control nested in an option and a bare div in a list trip the same rules', async () => {
    const { container } = render(
      <div>
        <div role="listbox" aria-label="Rows">
          <div role="option" aria-selected="true">
            Row
            <button type="button" aria-label="Action" />
          </div>
        </div>
        <ul>
          <div>loose</div>
        </ul>
      </div>,
    );
    const ids = await violationIds(container, STRUCTURE_RULES);
    expect(ids).toContain('nested-interactive');
    expect(ids).toContain('list');
  });
});

describe('direction and locale', () => {
  it('keeps the current step marked and the order intact under RTL', () => {
    document.documentElement.dir = 'rtl';
    const { container } = render(<ModernStepper items={ITEMS} current={1} direction="vertical" />);
    const items = Array.from(container.querySelectorAll('[data-part="item"]'));
    expect(items.map((el) => el.getAttribute('data-status'))).toEqual(['finish', 'process', 'error', 'wait']);
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-direction', 'vertical');
  });

  it('keeps an Arabic title as the step name and the status name beside it', () => {
    const title = 'إنشاء الحساب';
    render(
      <div dir="rtl" lang="ar">
        <ModernStepper items={[{ title }, { title: 'الملف' }]} current={1} clickable onChange={vi.fn()} />
      </div>,
    );
    const trigger = screen.getByRole('button', { name: new RegExp(title) });
    expect(trigger.querySelector('[data-part="label"]')).toHaveTextContent(title);
    expect(trigger).toHaveTextContent('Completed');
  });
});
