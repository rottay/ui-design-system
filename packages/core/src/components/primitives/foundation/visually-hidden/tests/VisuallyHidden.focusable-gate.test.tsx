import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { VisuallyHidden } from '..';

describe('VisuallyHidden focusable gate', () => {
  it('suppresses a caller tabIndex={0} behind the gate', () => {
    render(
      <VisuallyHidden data-testid="sr" tabIndex={0}>
        Skip to content
      </VisuallyHidden>
    );

    expect(screen.getByTestId('sr').hasAttribute('tabindex')).toBe(false);
  });

  it('suppresses a positive caller tabIndex behind the gate', () => {
    render(
      <VisuallyHidden data-testid="sr" tabIndex={3}>
        Skip to content
      </VisuallyHidden>
    );

    expect(screen.getByTestId('sr').hasAttribute('tabindex')).toBe(false);
  });

  it('keeps a negative tabIndex, which adds no tab stop', () => {
    render(
      <VisuallyHidden data-testid="sr" tabIndex={-1}>
        Route announcement
      </VisuallyHidden>
    );

    expect(screen.getByTestId('sr').getAttribute('tabindex')).toBe('-1');
  });

  it('honors a sequential tabIndex once the gate is open', () => {
    render(
      <VisuallyHidden data-testid="sr" focusable tabIndex={0}>
        Skip to content
      </VisuallyHidden>
    );

    expect(screen.getByTestId('sr').getAttribute('tabindex')).toBe('0');
  });

  it('leaves unrelated passthrough untouched', () => {
    render(
      <VisuallyHidden data-testid="sr" role="status" id="live-region">
        Loading
      </VisuallyHidden>
    );

    const node = screen.getByTestId('sr');
    expect(node.getAttribute('role')).toBe('status');
    expect(node.getAttribute('id')).toBe('live-region');
  });
});
