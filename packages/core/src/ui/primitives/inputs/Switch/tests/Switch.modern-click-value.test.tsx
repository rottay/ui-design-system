import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernSwitch from '../engines/modern';
import ClassicSwitch from '../engines/classic';

describe('Switch modern contract: onClick reports the post-activation value', () => {
  it('uncontrolled: the first click reports true, not the previous false', () => {
    const onClick = vi.fn();
    const { container } = render(<ModernSwitch onClick={onClick} />);

    fireEvent.click(container.querySelector('input[role="switch"]') as HTMLInputElement);

    expect(onClick).toHaveBeenCalledWith(true, expect.anything());
  });

  it('uncontrolled: starting checked, clicks report false then true (no off-by-one drift)', () => {
    const onClick = vi.fn();
    const { container } = render(<ModernSwitch defaultChecked onClick={onClick} />);
    const input = container.querySelector('input[role="switch"]') as HTMLInputElement;

    fireEvent.click(input);
    expect(onClick).toHaveBeenNthCalledWith(1, false, expect.anything());

    fireEvent.click(input);
    expect(onClick).toHaveBeenNthCalledWith(2, true, expect.anything());
  });

  it('controlled: reports the value the activation asked for even when the parent refuses it', () => {
    const onClick = vi.fn();
    const { container } = render(<ModernSwitch checked={false} onClick={onClick} />);

    fireEvent.click(container.querySelector('input[role="switch"]') as HTMLInputElement);

    expect(onClick).toHaveBeenCalledWith(true, expect.anything());
  });

  it('agrees with onChange within a single activation', () => {
    const seen: Array<[string, boolean]> = [];
    const { container } = render(
      <ModernSwitch
        onClick={(checked) => seen.push(['click', checked])}
        onChange={(checked) => seen.push(['change', checked])}
      />
    );

    fireEvent.click(container.querySelector('input[role="switch"]') as HTMLInputElement);

    expect(seen).toEqual([
      ['click', true],
      ['change', true],
    ]);
  });
});

describe('Switch cross-engine witness: classic (rc-switch) already reports post-activation', () => {
  it('classic reports true on the first click', () => {
    const onClick = vi.fn();
    render(<ClassicSwitch onClick={onClick} />);

    fireEvent.click(screen.getByRole('switch'));

    expect(onClick).toHaveBeenCalledWith(true, expect.anything());
  });
});
