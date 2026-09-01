// Status must reach the DOM (pseudo-element text does not), and `Stepper.Content` panels
// must be collected by the parent that injects their internal props.
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernStepper from '../engines/modern';
import { StepperContent } from '../compound/content';
import { StepperStep } from '../compound/step';

const ITEMS = [
  { title: 'Details' },
  { title: 'Payment' },
  { title: 'Review' },
];

function itemFor(container: HTMLElement, title: string): HTMLElement {
  const node = Array.from(container.querySelectorAll<HTMLElement>("[data-part='item']")).find(
    (candidate) => candidate.textContent?.includes(title),
  );
  if (!node) throw new Error(`no step item for ${title}`);
  return node;
}

describe('Stepper modern: status carries a name, not only a hue and a dingbat', () => {
  it('distinguishes a finished step from a failed one in the accessibility tree', () => {
    const { container } = render(
      <ModernStepper
        items={[
          { title: 'Details' },
          { title: 'Payment', status: 'error' as const },
          { title: 'Review' },
        ]}
        current={2}
      />,
    );

    const finished = itemFor(container, 'Details');
    const failed = itemFor(container, 'Payment');
    expect(finished.getAttribute('data-status')).toBe('finish');
    expect(failed.getAttribute('data-status')).toBe('error');
    expect(finished.textContent).toContain('Completed');
    expect(failed.textContent).toContain('Error');
    expect(finished.textContent).not.toBe(failed.textContent);
  });

  it('leaves waiting steps unannounced and the current step to aria-current', () => {
    const { container } = render(<ModernStepper items={ITEMS} current={1} />);

    const waiting = itemFor(container, 'Review');
    expect(waiting.getAttribute('data-status')).toBe('wait');
    expect(waiting.textContent).toBe('Review');
    expect(itemFor(container, 'Payment').getAttribute('aria-current')).toBe('step');
  });

  it('clips the name from paint instead of drawing new text', () => {
    const { container } = render(<ModernStepper items={ITEMS} current={2} />);

    const name = container.querySelector<HTMLElement>("[data-part='status-name']");
    expect(name?.classList.contains('ds-visually-hidden')).toBe(true);
  });
});

describe('Stepper modern: declared content panels actually render', () => {
  it('renders the active Stepper.Content child alongside the track', () => {
    render(
      <ModernStepper current={0}>
        <StepperStep title="Account" />
        <StepperStep title="Billing" />
        <StepperContent stepIndex={0}>
          <p>Account form</p>
        </StepperContent>
        <StepperContent stepIndex={1}>
          <p>Billing form</p>
        </StepperContent>
      </ModernStepper>,
    );

    // The track still renders both steps...
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    // ...and the panel for the current step is no longer dropped.
    expect(screen.getByText('Account form')).toBeInTheDocument();
  });

  it('injects the current step so the right panel is the active one', () => {
    const { rerender } = render(
      <ModernStepper current={0}>
        <StepperStep title="Account" />
        <StepperStep title="Billing" />
        <StepperContent stepIndex={0}>
          <p>Account form</p>
        </StepperContent>
        <StepperContent stepIndex={1}>
          <p>Billing form</p>
        </StepperContent>
      </ModernStepper>,
    );

    const activePanel = () =>
      document.querySelector<HTMLElement>("[data-part='panel'][data-active]");
    expect(activePanel()?.textContent).toContain('Account form');

    rerender(
      <ModernStepper current={1}>
        <StepperStep title="Account" />
        <StepperStep title="Billing" />
        <StepperContent stepIndex={0}>
          <p>Account form</p>
        </StepperContent>
        <StepperContent stepIndex={1}>
          <p>Billing form</p>
        </StepperContent>
      </ModernStepper>,
    );

    expect(activePanel()?.textContent).toContain('Billing form');
    // Direction is derived from the position the panels left behind.
    expect(activePanel()?.getAttribute('data-direction')).toBe('forward');
  });

  it('keeps the panels outside the navigation landmark', () => {
    render(
      <ModernStepper current={0}>
        <StepperStep title="Account" />
        <StepperContent stepIndex={0}>
          <p>Account form</p>
        </StepperContent>
      </ModernStepper>,
    );

    const nav = screen.getByRole('navigation');
    expect(nav.querySelector("[data-part='panel']")).toBeNull();
    expect(document.querySelector("[data-part='panel']")).toBeTruthy();
  });

  it('leaves the items path tree untouched when no panels are declared', () => {
    const { container } = render(<ModernStepper items={ITEMS} current={0} />);
    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild?.tagName).toBe('NAV');
  });
});
