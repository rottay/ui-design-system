import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Stepper, StepperContent, StepperStep } from '..';
import { renderWithEngine, STABLE_ENGINES } from '../../../../../tooling/testing/helpers/engine';

describe('Stepper compound integration', () => {
  it('renders the standalone Step compound with keyboard activation and disabled guards', () => {
    const handleStepClick = vi.fn();

    render(
      <div>
        <StepperStep
          title="Review"
          description="Review details"
          status="finish"
          stepIndex={1}
          stepNumber={2}
          active
          onClick={handleStepClick}
        />
        <StepperStep
          title="Locked"
          stepIndex={2}
          stepNumber={3}
          disabled
          onClick={handleStepClick}
        />
      </div>
    );

    const review = screen.getByRole('button', { name: /review/i });
    fireEvent.keyDown(review, { key: 'Enter' });
    fireEvent.keyDown(review, { key: ' ' });

    expect(handleStepClick).toHaveBeenCalledTimes(2);

    const locked = screen.getByText('Locked').closest('[aria-disabled="true"]');
    expect(locked).toBeTruthy();
    fireEvent.click(locked!);
    expect(handleStepClick).toHaveBeenCalledTimes(2);
  });

  it('renders content transitions, hide/unmount logic, and keepMounted behavior', async () => {
    const { rerender } = render(
      <div>
        <StepperContent stepIndex={0} currentStep={0}>
          First panel
        </StepperContent>
        <StepperContent stepIndex={1} currentStep={0} keepMounted animation="slide">
          Second panel
        </StepperContent>
      </div>
    );

    expect(screen.getByText('First panel')).toBeInTheDocument();
    expect(screen.getByText('Second panel')).toBeInTheDocument();

    rerender(
      <div>
        <StepperContent stepIndex={0} currentStep={1}>
          First panel
        </StepperContent>
        <StepperContent stepIndex={1} currentStep={1} keepMounted animation="slide" previousStep={0}>
          Second panel
        </StepperContent>
      </div>
    );

    await waitFor(() => {
      expect(screen.queryByText('First panel')).not.toBeInTheDocument();
      expect(screen.getByText('Second panel')).toBeInTheDocument();
    });
  });
});

describe('Stepper live engines', () => {
  it.each(STABLE_ENGINES)(
    'renders the live stepper and exposes clickable step changes through the %s engine',
    async (engine) => {
      const handleChange = vi.fn();

      renderWithEngine(
        <Stepper
          engine={engine}
          current={1}
          clickable
          onChange={handleChange}
          items={[
            { title: 'Draft', description: 'Create event' },
            { title: 'Review', description: 'Validate data' },
            { title: 'Publish', description: 'Go live' },
          ]}
        >
          <Stepper.Content stepIndex={0}>Draft panel</Stepper.Content>
          <Stepper.Content stepIndex={1}>Review panel</Stepper.Content>
        </Stepper>,
        engine
      );

      expect(await screen.findByText('Draft', {}, { timeout: 15000 })).toBeInTheDocument();

      // Clicking a non-disabled step should flow back through the live engine contract.
      act(() => {
        fireEvent.click(screen.getByText('Publish'));
      });

      expect(handleChange).toHaveBeenCalledWith(2);
    },
    45000
  );
});
