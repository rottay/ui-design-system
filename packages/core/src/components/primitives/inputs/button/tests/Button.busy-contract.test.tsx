import React, { type ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button, type ButtonProps } from '..';
import { ButtonIcon } from '../compound';
import ModernButton from '../engines/modern';

type Declares<Props, Key extends string> = Key extends keyof Props ? true : false;

describe('Button public busy contract', () => {
  it('publishes pending and pendingLabel and none of loading, loadingText, asChild', () => {
    const retired: [
      Declares<ButtonProps, 'loading'>,
      Declares<ButtonProps, 'loadingText'>,
      Declares<ButtonProps, 'asChild'>,
      Declares<ComponentProps<typeof Button>, 'loading'>,
      Declares<ComponentProps<typeof Button>, 'loadingText'>,
      Declares<ComponentProps<typeof Button>, 'asChild'>,
      Declares<ComponentProps<typeof Button.Icon>, 'loading'>,
      Declares<ComponentProps<typeof ModernButton>, 'loading'>,
    ] = [false, false, false, false, false, false, false, false];
    const kept: [
      Declares<ButtonProps, 'pending'>,
      Declares<ButtonProps, 'pendingLabel'>,
      Declares<ComponentProps<typeof Button.Icon>, 'pending'>,
    ] = [true, true, true];

    expect(retired.every((declared) => declared === false)).toBe(true);
    expect(kept.every((declared) => declared === true)).toBe(true);
  });
});

describe('ModernButton busy stamps', () => {
  it('stamps data-pending and the pending class, never the loading names', () => {
    render(<ModernButton pending>Save</ModernButton>);
    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toHaveAttribute('data-pending', 'true');
    expect(button).not.toHaveAttribute('data-loading');
    expect(button.className).toContain('ds-button--pending');
    expect(button.className).not.toContain('ds-button--loading');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('keeps a caller data-loading attribute as the caller wrote it', () => {
    const { rerender } = render(<ModernButton data-loading="false">Confirm</ModernButton>);
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveAttribute('data-loading', 'false');

    rerender(<ModernButton data-loading="true" pending>Confirm</ModernButton>);
    const button = screen.getByRole('button', { name: 'Confirm' });
    expect(button).toHaveAttribute('data-loading', 'true');
    expect(button).toHaveAttribute('data-pending', 'true');
  });

  it('gives an icon-only busy button the reserved frame and keeps its name', () => {
    const { container } = render(
      <ModernButton pending icon={<svg data-testid="glyph" />} aria-label="Refresh" />
    );
    const button = screen.getByRole('button', { name: 'Refresh' });
    const frame = container.querySelector('[data-part="content-frame"]');

    expect(button).toHaveAttribute('data-icon-only', 'true');
    expect(frame).toBeInTheDocument();
    expect(screen.getByTestId('glyph').closest('[data-part="content"]')).toHaveAttribute('data-layer', 'reserve');
    expect(frame?.querySelector('[data-part="busy-content"] [data-part="spinner"]')).toBeInTheDocument();
    expect(container.querySelector('[data-state="hidden"]')).toBeNull();
  });

  it('renders the resting content outside any frame while idle', () => {
    const { container } = render(<ModernButton pendingLabel="Saving">Save</ModernButton>);

    expect(container.querySelector('[data-part="content-frame"]')).toBeNull();
    expect(container.querySelector('[data-part="content"]')).toHaveAttribute('data-state', 'visible');
    expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('aria-busy', 'true');
  });
});

describe('Button.Icon busy posture', () => {
  it('forwards pending to the Modern button with the reserved frame', () => {
    const { container } = render(<ButtonIcon pending icon={<svg />} aria-label="Add" />);
    const button = screen.getByRole('button', { name: 'Add' });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('data-pending', 'true');
    expect(container.querySelector('[data-part="content-frame"]')).toBeInTheDocument();
  });
});
