import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import * as navigation from '../..';
import { Stepper } from '..';

// @ts-expect-error the package root publishes no `Steps`
import type { Steps as RetiredSteps } from '@/index';
// @ts-expect-error the package root publishes no `StepsProps`
import type { StepsProps as RetiredStepsProps } from '@/index';
// @ts-expect-error the package root publishes no `ProgressDotInfo`
import type { ProgressDotInfo as RetiredProgressDotInfo } from '@/index';

const ITEMS = [
  { title: 'Account', description: 'Create it' },
  { title: 'Profile', subTitle: 'Optional' },
  { title: 'Done' },
];

describe('Stepper as a display track and as a navigable one', () => {
  it('renders the family anatomy with the stated size step and the status of each item', async () => {
    const { container } = renderWithEngine(<Stepper items={ITEMS} current={1} size="sm" />, 'modern');
    const root = await screen.findByRole('navigation', { name: 'Progress steps' });
    expect(root.querySelector('.ds-stepper--modern')).not.toBeNull();
    expect(container.querySelector('[class*="steps"]')).toBeNull();
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-size', 'sm');
    const items = container.querySelectorAll('[data-part="item"]');
    expect(items[0]).toHaveAttribute('data-status', 'finish');
    expect(items[1]).toHaveAttribute('data-status', 'process');
    expect(items[2]).toHaveAttribute('data-status', 'wait');
    expect(screen.getByText('Optional')).toHaveAttribute('data-part', 'subtitle');
  });

  it('is inert without clickable, even when onChange is stated, and seeds the uncontrolled position from defaultCurrent', async () => {
    const onChange = vi.fn();
    const { container } = renderWithEngine(<Stepper items={ITEMS} defaultCurrent={2} onChange={onChange} />, 'modern');
    await screen.findByRole('navigation');
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelectorAll('[data-part="item"]')[2]).toHaveAttribute('data-status', 'process');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('makes the steps buttons with clickable and reports the step with one argument', async () => {
    const onChange = vi.fn();
    renderWithEngine(<Stepper items={ITEMS} current={0} clickable onChange={onChange} />, 'modern');
    const profile = await screen.findByRole('button', { name: /Profile/ });
    fireEvent.click(profile);
    expect(onChange).toHaveBeenCalledWith(1);
    expect(onChange.mock.calls[0]).toHaveLength(1);
  });

  it('hands the render-function progressDot the default dot and the step information', async () => {
    const { container } = renderWithEngine(
      <Stepper
        items={ITEMS}
        current={1}
        progressDot={(_dot, info) => <span data-testid={`dot-${info.index}`}>{info.status}</span>}
      />,
      'modern',
    );
    await screen.findByRole('navigation');
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-progress-dot', 'true');
    expect(container.querySelectorAll('[data-part="dot-slot"]')).toHaveLength(3);
    expect(screen.getByTestId('dot-1')).toHaveTextContent('process');
  });
});

describe('the step-progress family publishes one name', () => {
  it('exports Stepper and no Steps from the navigation barrel', () => {
    expect(Object.keys(navigation)).toContain('Stepper');
    expect(Object.keys(navigation)).not.toContain('Steps');
  });

  it('refuses the members only the retired name took', () => {
    const refused = [
      // @ts-expect-error `type` was discarded by the retired name and is not a Stepper prop
      <Stepper key="type" items={ITEMS} type="navigation" />,
      // @ts-expect-error `initial` is `defaultCurrent`
      <Stepper key="initial" items={ITEMS} initial={1} />,
      // @ts-expect-error the size steps are `sm | md | lg`
      <Stepper key="size" items={ITEMS} size="small" />,
      // @ts-expect-error the render function receives the dot first, then the step information
      <Stepper key="dot" items={ITEMS} progressDot={(info: { index: number }) => info.index} />,
    ];
    expect(refused).toHaveLength(4);
  });
});
