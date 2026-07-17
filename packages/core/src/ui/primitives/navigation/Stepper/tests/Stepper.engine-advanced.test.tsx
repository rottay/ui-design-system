import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import type { StepperProps } from '../contracts';
import ClassicStepper from '../engines/classic';
import ModernStepper from '../engines/modern';
import RusticStepper from '../engines/rustic';
import { StepperStep } from '../compound/Step';

const COMPONENTS = {
  classic: ClassicStepper,
  modern: ModernStepper,
  rustic: RusticStepper,
} as const;

function buildItems() {
  return [
    { title: 'Draft', description: 'Write content' },
    { title: 'Review', description: 'Check details', subTitle: 'Optional' },
    { title: 'Publish', description: 'Go live', disabled: true, status: 'error' as const },
  ];
}

describe('Stepper advanced engine coverage', () => {
  it('covers classic children rendering, progress options, and click guards', () => {
    const onChange = vi.fn();

    render(
      <ClassicStepper
        defaultCurrent={1}
        size="sm"
        status="process"
        percent={55}
        progressDot
        clickable={false}
        onChange={onChange}
      >
        <StepperStep title="Draft" description="Write content" />
        <StepperStep title="Review" description="Check details" />
      </ClassicStepper>
    );

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Review'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('covers modern item statuses, disabled steps, vertical layout, and controlled changes', () => {
    const onChange = vi.fn();

    render(
      <ModernStepper
        items={buildItems()}
        current={1}
        direction="vertical"
        clickable
        onChange={onChange}
      />
    );

    const draft = screen.getByText('Draft').closest('li');
    const review = screen.getByText('Review').closest('li');
    const publish = screen.getByText('Publish').closest('li');

    expect(draft?.className).toContain('step-primary');
    expect(review?.className).toContain('step-primary');
    expect(publish?.className).toContain('step-error');

    fireEvent.click(screen.getByText('Draft'));
    expect(onChange).toHaveBeenCalledWith(0);

    fireEvent.click(screen.getByText('Publish'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('covers rustic keyboard navigation, child conversion, and controlled vs uncontrolled branches', () => {
    const onChange = vi.fn();

    render(
      <RusticStepper clickable onChange={onChange} defaultCurrent={0} variant="circles">
        <StepperStep title="Draft" description="Write content" />
        <StepperStep title="Review" description="Check details" subTitle="Optional" />
        <StepperStep title="Publish" description="Go live" />
      </RusticStepper>
    );

    const stepButtons = screen.getAllByRole('button');
    const firstStep = stepButtons.find((node) => node.getAttribute('data-step') === '0');

    expect(firstStep).toBeTruthy();

    fireEvent.focus(firstStep!);
    fireEvent.keyDown(firstStep!, { key: 'ArrowRight' });
    fireEvent.keyDown(firstStep!, { key: 'End' });
    fireEvent.keyDown(firstStep!, { key: 'Home' });
    fireEvent.keyDown(firstStep!, { key: 'Enter' });
    fireEvent.keyDown(firstStep!, { key: ' ' });

    expect(onChange).toHaveBeenCalled();
  });

  it('covers rustic focus reset, reverse keyboard navigation, disabled skipping, and controlled current branches', () => {
    const onChange = vi.fn();

    render(
      <RusticStepper
        items={[
          { title: 'One' },
          { title: 'Two', disabled: true },
          { title: 'Three' },
          { title: 'Four' },
        ]}
        current={2}
        clickable
        direction="vertical"
        labelPlacement="horizontal"
        onChange={onChange}
      />
    );

    const navigation = screen.getByRole('navigation');
    fireEvent.focus(navigation);
    fireEvent.keyDown(navigation, { key: 'ArrowLeft' });
    fireEvent.keyDown(navigation, { key: 'ArrowUp' });
    fireEvent.keyDown(navigation, { key: 'End' });
    fireEvent.keyDown(navigation, { key: 'Home' });
    fireEvent.keyDown(navigation, { key: 'Enter' });
    fireEvent.blur(navigation, { relatedTarget: document.body });

    expect(onChange).toHaveBeenCalled();
  });

  it.each([
    ['classic', ClassicStepper],
    ['modern', ModernStepper],
    ['rustic', RusticStepper],
  ] as const)('covers custom item status and styling branches in the %s engine', (_engine, Component) => {
    const props: StepperProps = {
      items: [
        { title: 'Done', status: 'finish', icon: <span data-testid="done-icon">D</span> },
        { title: 'Now', status: 'process' },
        { title: 'Broken', status: 'error' },
        { title: 'Later', status: 'wait' },
      ],
      current: 1,
      className: 'qa-stepper',
      style: { width: '100%' },
      clickable: true,
      onChange: vi.fn(),
    };

    render(<Component {...props} />);

    expect(screen.getByText('Broken')).toBeInTheDocument();
    expect(document.querySelector('.qa-stepper')).not.toBeNull();
  });

  it('covers rustic simple-variant icons, child filtering, non-clickable steps, and global status branches', () => {
    const onChange = vi.fn();

    const { container } = render(
      <RusticStepper
        defaultCurrent={1}
        status="error"
        clickable={false}
        variant="simple"
        className="qa-rustic-stepper"
      >
        <div>Ignore me</div>
        <StepperStep title="Done" status="finish" />
        <StepperStep title="Current" />
        <StepperStep title="Later" />
      </RusticStepper>
    );

    const navigation = screen.getByRole('navigation');
    expect(navigation).toHaveAttribute('tabindex', '-1');
    expect(container.querySelector('.qa-rustic-stepper')).toBeTruthy();

    const stepNodes = screen
      .getAllByText(/Done|Current|Later/)
      .map((node) => node.closest('[data-step]'))
      .filter(Boolean) as HTMLElement[];

    expect(stepNodes).toHaveLength(3);
    expect(stepNodes[0]).not.toHaveAttribute('role', 'button');
    expect(stepNodes[0]).toHaveTextContent('1');
    expect(stepNodes[1]).not.toHaveAttribute('aria-current');

    fireEvent.click(stepNodes[2]);
    fireEvent.keyDown(navigation, { key: 'ArrowRight' });
    expect(onChange).not.toHaveBeenCalled();

    expect(container.querySelectorAll('svg').length).toBe(1);
  });
});
