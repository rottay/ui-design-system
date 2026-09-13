import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { Switch } from '..';

describe('Switch is the deprecated name of Toggle', () => {
  it('renders the Toggle family anatomy and maps the legacy state labels', async () => {
    const { container } = renderWithEngine(
      <Switch aria-label="Visibility" checkedChildren="On" unCheckedChildren="Off" />,
      'modern',
    );
    const control = await screen.findByRole('switch', { name: 'Visibility' });
    expect(container.querySelector('.ds-toggle--modern')).not.toBeNull();
    expect(container.querySelector('.ds-switch')).toBeNull();
    expect(screen.getByText('Off')).toHaveAttribute('data-part', 'state-label');
    fireEvent.click(control);
    await waitFor(() => expect(screen.getByText('On')).toBeInTheDocument());
  });

  it('maps legacy sizes onto the canonical scale and keeps the one-argument onChange', async () => {
    const onChange = vi.fn();
    const { container } = renderWithEngine(
      <Switch aria-label="Sync" size="small" onChange={onChange} />,
      'modern',
    );
    const control = await screen.findByRole('switch', { name: 'Sync' });
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-size', 'sm');
    fireEvent.click(control);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(onChange.mock.calls[0]).toHaveLength(1);
  });

  it('keeps the legacy click callback: the requested value, before the change', async () => {
    const seen: Array<[string, boolean]> = [];
    renderWithEngine(
      <Switch
        aria-label="Alerts"
        checked={false}
        onClick={(checked) => seen.push(['click', checked])}
        onChange={(checked) => seen.push(['change', checked])}
      />,
      'modern',
    );
    fireEvent.click(await screen.findByRole('switch', { name: 'Alerts' }));
    expect(seen).toEqual([
      ['click', true],
      ['change', true],
    ]);
  });

  it('forwards its ref to the native switch', async () => {
    const ref = React.createRef<HTMLInputElement>();
    renderWithEngine(<Switch ref={ref} aria-label="Sync" />, 'modern');
    const control = await screen.findByRole('switch', { name: 'Sync' });
    expect(ref.current).toBe(control);
  });
});
