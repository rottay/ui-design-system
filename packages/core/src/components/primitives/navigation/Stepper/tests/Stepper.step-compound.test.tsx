import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { StepperStep } from '../compound/Step';

describe('StepperStep compound coverage', () => {
  it('covers finish and error status icons, subtitles, children, and horizontal connectors', () => {
    const { container } = render(
      <div>
        <StepperStep
          title="Finished"
          description="Done"
          subTitle="Optional"
          status="finish"
          stepNumber={1}
          onClick={vi.fn()}
        >
          <span>Extra child</span>
        </StepperStep>
        <StepperStep
          title="Broken"
          status="error"
          stepNumber={2}
          onClick={vi.fn()}
        />
      </div>
    );

    expect(screen.getByText('Optional')).toBeInTheDocument();
    expect(screen.getByText('Extra child')).toBeInTheDocument();
    expect(container.querySelectorAll('.rottay-stepper-connector').length).toBe(2);
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(2);
  });

  it('covers custom icons, disabled keyboard guards, vertical layout, and last-step connector suppression', () => {
    const handleClick = vi.fn();
    render(
      <div>
        <StepperStep
          title="Custom"
          icon={<span data-testid="custom-icon">C</span>}
          direction="vertical"
          labelPlacement="vertical"
          variant="simple"
          isLast
        />
        <StepperStep
          title="Disabled"
          disabled
          stepNumber={3}
          onClick={handleClick}
        />
      </div>
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    const customStep = screen.getByText('Custom').closest('.rottay-stepper-step');
    expect(customStep?.nextElementSibling).not.toHaveClass('rottay-stepper-connector');

    const disabledStep = screen.getByText('Disabled').closest('[aria-disabled=\"true\"]');
    expect(disabledStep).toHaveAttribute('role', 'button');
    expect(disabledStep).not.toHaveAttribute('tabindex');

    fireEvent.keyDown(disabledStep!, { key: 'Enter' });
    fireEvent.keyDown(disabledStep!, { key: ' ' });
    fireEvent.click(disabledStep!);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
