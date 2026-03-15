import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import ClassicSteps from './engines/classic';
import ModernSteps from './engines/modern';
import RusticSteps from './engines/rustic';

describe('Steps real engine coverage', () => {
  it('covers the classic engine with percent, navigation mode, and explicit statuses', () => {
    const onChange = vi.fn();

    render(
      <ClassicSteps
        current={1}
        percent={60}
        type="navigation"
        status="error"
        onChange={onChange}
        items={[
          { title: 'Draft', description: 'Start here' },
          { title: 'Review', subTitle: 'Optional' },
          { title: 'Publish', status: 'wait' },
        ]}
      />
    );

    fireEvent.click(screen.getByText('Draft'));
    expect(onChange).toHaveBeenCalledWith(0);
    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('covers modern direction, progressDot, custom icon, disabled, and clickable branches', () => {
    const onChange = vi.fn();

    const { rerender } = render(
      <ModernSteps
        current={1}
        direction="vertical"
        size="small"
        progressDot
        onChange={onChange}
        items={[
          { title: 'Draft', description: 'Write content' },
          { title: 'Review', subTitle: 'Optional' },
          { title: 'Broken', status: 'error', disabled: true, icon: <span data-testid="broken-icon">!</span> },
        ]}
      />
    );

    const list = screen.getByRole('list');
    expect(list.className).toContain('steps-vertical');
    expect(list.className).toContain('text-sm');

    const draft = screen.getByText('Draft').closest('li');
    const review = screen.getByText('Review').closest('li');
    const broken = screen.getByText('Broken').closest('li');

    expect(draft?.className).toContain('step-primary');
    expect(review?.className).toContain('step-primary');
    expect(broken?.className).toContain('step-error');
    expect(broken?.className).toContain('opacity-50');

    fireEvent.click(screen.getByText('Draft'));
    fireEvent.click(screen.getByText('Broken'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(0);

    rerender(
      <ModernSteps
        current={0}
        items={[
          { title: 'Icon step', icon: <span data-testid="broken-icon">!</span> },
          { title: 'Next step' },
        ]}
      />
    );

    expect(screen.getByTestId('broken-icon')).toBeInTheDocument();
  });

  it('covers rustic progress-dot function, custom icon, status fallbacks, and disabled click guards', () => {
    const onChange = vi.fn();

    const { rerender } = render(
      <RusticSteps
        current={1}
        direction="vertical"
        size="small"
        status="error"
        progressDot={(info) => <span data-testid={`dot-${info.index}`}>{info.status}</span>}
        onChange={onChange}
        items={[
          { title: 'Draft', description: 'Prepare' },
          { title: 'Review', subTitle: 'Optional' },
          { title: 'Locked', disabled: true },
        ]}
      />
    );

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByTestId('dot-0')).toHaveTextContent('finish');
    expect(screen.getByTestId('dot-1')).toHaveTextContent('error');
    expect(screen.getByText('Optional')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Draft'));
    fireEvent.click(screen.getByText('Locked'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(0);

    rerender(
      <RusticSteps
        current={0}
        items={[
          { title: 'Custom', icon: <span data-testid="custom-step-icon">C</span> },
          { title: 'Done', status: 'finish' },
        ]}
      />
    );

    expect(screen.getByTestId('custom-step-icon')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});
