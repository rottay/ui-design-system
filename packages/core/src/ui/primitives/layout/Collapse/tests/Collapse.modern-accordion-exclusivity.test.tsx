/** Exclusivity must hold on the incoming open set, not only on the toggle path. */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Collapse as ModernCollapse, Panel as ModernPanel } from '../engines/modern';

function renderAccordion(collapseProps: Record<string, unknown>) {
  return render(
    <ModernCollapse accordion {...collapseProps}>
      <ModernPanel panelKey="one" header="One">
        One body
      </ModernPanel>
      <ModernPanel panelKey="two" header="Two">
        Two body
      </ModernPanel>
    </ModernCollapse>
  );
}

function expandedStates(): string[] {
  return screen
    .getAllByRole('button')
    .map((header) => header.getAttribute('aria-expanded') ?? 'missing');
}

describe('Collapse modern: accordion exclusivity of the open set', () => {
  it('opens only the first panel when defaultActiveKey lists several keys', () => {
    renderAccordion({ defaultActiveKey: ['one', 'two'] });

    expect(expandedStates()).toEqual(['true', 'false']);
  });

  it('opens only the first panel when a controlled activeKey lists several keys', () => {
    renderAccordion({ activeKey: ['one', 'two'] });

    expect(expandedStates()).toEqual(['true', 'false']);
  });

  it('still toggles normally from a multi-key default and reports a single key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderAccordion({ defaultActiveKey: ['one', 'two'], onChange });

    await user.click(screen.getByText('Two'));

    expect(expandedStates()).toEqual(['false', 'true']);
    expect(onChange).toHaveBeenCalledWith('two');
  });

  it('leaves the multi-panel (non-accordion) open set untouched', () => {
    render(
      <ModernCollapse defaultActiveKey={['one', 'two']}>
        <ModernPanel panelKey="one" header="One">
          One body
        </ModernPanel>
        <ModernPanel panelKey="two" header="Two">
          Two body
        </ModernPanel>
      </ModernCollapse>
    );

    expect(expandedStates()).toEqual(['true', 'true']);
  });
});
