/**
 * What assistive technology can reach in the pill strip: every option is a
 * named control, the selected one says so, and activating one reports its own
 * value. Behaviour, never the text of a rule.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StatusFilterPills } from '..';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';

/** DS primitives read the engine from context, and context absence is refused. */
const mount = (ui: React.ReactElement) =>
  render(<EngineProvider defaultEngine="modern">{ui}</EngineProvider>);

const OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open', count: 4 },
  { value: 'closed', label: 'Closed', count: 2 },
];

describe('StatusFilterPills accessibility', () => {
  it('names every option and marks the selected one', async () => {
    mount(<StatusFilterPills options={OPTIONS} value="open" onChange={() => {}} showCounts />);

    // The engine resolves its primitives lazily; the first paint is empty.
    for (const option of OPTIONS) {
      expect(await screen.findByRole('button', { name: new RegExp(option.label) })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: /Open/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Closed/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('reports the activated option by its own value', async () => {
    const onChange = vi.fn();
    mount(<StatusFilterPills options={OPTIONS} value="all" onChange={onChange} />);

    await userEvent.click(await screen.findByRole('button', { name: /Closed/ }));
    expect(onChange).toHaveBeenCalledWith('closed');
  });
});
