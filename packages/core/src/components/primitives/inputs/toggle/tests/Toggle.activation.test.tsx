import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ModernToggle from '../engines/modern';

describe('Modern Toggle busy state', () => {
  it('stays reachable by keyboard after it enters the busy state', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <>
        <button type="button">before</button>
        <ModernToggle aria-label="Sync" />
      </>,
    );
    await act(async () => {
      screen.getByRole('button', { name: 'before' }).focus();
    });
    rerender(
      <>
        <button type="button">before</button>
        <ModernToggle aria-label="Sync" loading />
      </>,
    );
    await user.tab();
    expect(screen.getByRole('switch', { name: 'Sync' })).toHaveFocus();
  });

  it('refuses to commit a new value while busy, and still hard-disables when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<ModernToggle aria-label="Sync" loading onChange={onChange} />);
    const control = screen.getByRole('switch', { name: 'Sync' });
    await user.click(control);
    expect(onChange).not.toHaveBeenCalled();
    expect(control).not.toBeChecked();

    rerender(<ModernToggle aria-label="Sync" disabled />);
    expect(screen.getByRole('switch', { name: 'Sync' })).toBeDisabled();
  });
});

describe('Modern Toggle change reports the value the activation asked for', () => {
  it('reports true then false for an uncontrolled toggle', () => {
    const onChange = vi.fn();
    const { container } = render(<ModernToggle aria-label="Alerts" onChange={onChange} />);
    const input = container.querySelector('input[role="switch"]') as HTMLInputElement;
    fireEvent.click(input);
    fireEvent.click(input);
    expect(onChange.mock.calls.map(([checked]) => checked)).toEqual([true, false]);
  });

  it('reports the requested value even when a controlled parent refuses it', () => {
    const onChange = vi.fn();
    const { container } = render(<ModernToggle aria-label="Alerts" checked={false} onChange={onChange} />);
    fireEvent.click(container.querySelector('input[role="switch"]') as HTMLInputElement);
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });
});

describe('Modern Toggle interaction state', () => {
  it('stamps the kernel state on the root: hover, press and keyboard focus', () => {
    const { container } = render(<ModernToggle label="Alerts" />);
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    const input = container.querySelector('input[role="switch"]') as HTMLInputElement;

    fireEvent.pointerEnter(root);
    expect(root).toHaveAttribute('data-state', expect.stringContaining('hovered'));
    fireEvent.pointerDown(root);
    expect(root.getAttribute('data-state')).toContain('pressed');
    fireEvent.pointerUp(root);
    fireEvent.pointerLeave(root);
    expect(root).not.toHaveAttribute('data-state');

    fireEvent.focus(input);
    expect(root.getAttribute('data-state')).toContain('focus-visible');
  });

  it('never lets the state label become the accessible name', async () => {
    const user = userEvent.setup();
    render(<ModernToggle checkedLabel="On" uncheckedLabel="Off" />);
    const control = screen.getByRole('switch');
    expect(control).not.toHaveAccessibleName('Off');
    await user.click(control);
    expect(control).toBeChecked();
    expect(control).not.toHaveAccessibleName('On');
    expect(screen.getByText('On')).toBeInTheDocument();
  });

  it('forwards its ref to the native switch', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<ModernToggle ref={ref} aria-label="Alerts" />);
    expect(ref.current).toBe(screen.getByRole('switch', { name: 'Alerts' }));
  });
});
