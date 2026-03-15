import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import RusticSwitch from './engines/rustic';

describe('RusticSwitch integration', () => {
  it('supports uncontrolled toggling, checked labels, and click callbacks', () => {
    const onChange = vi.fn();
    const onClick = vi.fn();

    render(
      <RusticSwitch
        defaultChecked
        checkedChildren="On"
        unCheckedChildren="Off"
        onChange={onChange}
        onClick={onClick}
      />
    );

    const input = screen.getByRole('switch');
    expect(screen.getByText('On')).toBeInTheDocument();

    fireEvent.click(screen.getByText('On').closest('label') as HTMLElement);
    fireEvent.change(input, { target: { checked: false } });

    expect(onClick).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('handles focus, disabled, loading, controlled, and sizing branches', () => {
    const onChange = vi.fn();
    const onClick = vi.fn();

    const { rerender } = render(
      <RusticSwitch checked size="large" onChange={onChange} onClick={onClick} autoFocus />
    );

    const input = screen.getByRole('switch');
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(input).toHaveAttribute('aria-checked', 'true');

    rerender(
      <RusticSwitch
        checked={false}
        disabled
        loading
        size="small"
        checkedChildren="Yes"
        unCheckedChildren="No"
        onChange={onChange}
        onClick={onClick}
      />
    );

    fireEvent.click(screen.getByText('No').closest('label') as HTMLElement);
    fireEvent.change(screen.getByRole('switch'), { target: { checked: true } });

    expect(onClick).toHaveBeenCalledTimes(0);
    expect(onChange).toHaveBeenCalledTimes(0);
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});
