import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ClassicStepWizard from '../engines/classic';
import ModernStepWizard from '../engines/modern';
import RusticStepWizard from '../engines/rustic';
import type { StepWizardProps } from '../StepWizard.types';

const ENGINE_COMPONENTS = [
  ['classic', ClassicStepWizard],
  ['modern', ModernStepWizard],
  ['rustic', RusticStepWizard],
] as const;

function buildProps(overrides: Partial<StepWizardProps> = {}): StepWizardProps {
  return {
    steps: [
      {
        key: 'details',
        title: 'Details',
        description: 'Fill the basics',
        optional: true,
        content: <div>Details content</div>,
      },
      {
        key: 'review',
        title: 'Review',
        content: <div>Review content</div>,
        validate: () => false,
      },
    ],
    footer: <span>Footer slot</span>,
    ...overrides,
  };
}

describe('StepWizard advanced engine coverage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(ENGINE_COMPONENTS)(
    'covers loading and vertical progress branches in the %s engine',
    (engine, Component) => {
      const { rerender, container } = render(
        <Component {...buildProps({ loading: true })} />
      );

      if (engine === 'classic') {
        expect(container.querySelector('.ant-skeleton')).toBeTruthy();
      } else if (engine === 'modern') {
        expect(container.querySelector('.ds-step-wizard-skeleton')).toBeTruthy();
      } else {
        expect(container.querySelector('style')).toBeTruthy();
      }

      rerender(
        <Component
          {...buildProps({
            orientation: 'vertical',
            currentStep: 1,
          })}
        />
      );

      expect(screen.getByText('Review content')).toBeInTheDocument();
      expect(screen.getByText('Footer slot')).toBeInTheDocument();
    }
  );

  it.each(ENGINE_COMPONENTS)(
    'covers skip, previous, disabled actions, and validation fallback branches in the %s engine',
    async (_engine, Component) => {
      const onStepChange = vi.fn();

      const { rerender } = render(
        <Component
          {...buildProps({
            allowSkip: true,
            onStepChange,
          })}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
      expect(onStepChange).toHaveBeenCalledWith(1);

      rerender(
        <Component
          {...buildProps({
            currentStep: 1,
            onStepChange,
            actionsDisabled: true,
          })}
        />
      );

      expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();

      rerender(
        <Component
          {...buildProps({
            currentStep: 1,
            completeDisabled: true,
            showProgress: false,
          })}
        />
      );

      const completeButton = screen.getByRole('button', { name: 'Complete' });
      expect(completeButton).toBeDisabled();

      rerender(
        <Component
          {...buildProps({
            currentStep: 1,
            completeDisabled: false,
          })}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Complete' }));

      await waitFor(() => {
        expect(screen.getByText('Please complete this step before continuing.')).toBeInTheDocument();
      });
    }
  );

  it.each(ENGINE_COMPONENTS)(
    'covers successful completion and hidden complete action branches in the %s engine',
    async (_engine, Component) => {
      const onComplete = vi.fn();

      const { rerender } = render(
        <Component
          steps={[
            {
              key: 'review',
              title: 'Review',
              content: <div>Only step</div>,
              validate: async () => true,
            },
          ]}
          onComplete={onComplete}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Complete' }));

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1);
      });

      rerender(
        <Component
          steps={[
            {
              key: 'review',
              title: 'Review',
              content: <div>Only step</div>,
            },
          ]}
          showCompleteAction={false}
        />
      );

      expect(screen.queryByRole('button', { name: 'Complete' })).not.toBeInTheDocument();
      expect(screen.getByText('Only step')).toBeInTheDocument();
    }
  );
});
