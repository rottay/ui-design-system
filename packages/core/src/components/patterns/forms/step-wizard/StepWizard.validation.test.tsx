import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import RusticStepWizard from './engines/rustic';

describe('StepWizard validation', () => {
  it('blocks progression when the current step validation fails', async () => {
    const onStepChange = vi.fn();

    render(
      <RusticStepWizard
        steps={[
          {
            key: 'details',
            title: 'Details',
            content: <div>Step one</div>,
            validate: () => 'Please fill the required fields.',
          },
          {
            key: 'review',
            title: 'Review',
            content: <div>Step two</div>,
          },
        ]}
        onStepChange={onStepChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(screen.getByText('Please fill the required fields.')).toBeInTheDocument();
    });

    expect(onStepChange).not.toHaveBeenCalled();
  });

  it('completes when the last step validation passes', async () => {
    const onComplete = vi.fn();

    render(
      <RusticStepWizard
        steps={[
          {
            key: 'review',
            title: 'Review',
            content: <div>Final step</div>,
            validate: () => true,
          },
        ]}
        onComplete={onComplete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('can hide the complete action without breaking the rest of the wizard', () => {
    render(
      <RusticStepWizard
        steps={[
          {
            key: 'review',
            title: 'Review',
            content: <div>Final step</div>,
          },
        ]}
        showCompleteAction={false}
      />
    );

    expect(screen.queryByRole('button', { name: 'Complete' })).not.toBeInTheDocument();
    expect(screen.getByText('Final step')).toBeInTheDocument();
  });
});
