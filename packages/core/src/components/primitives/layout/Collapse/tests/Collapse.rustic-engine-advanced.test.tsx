import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Collapse as RusticCollapse, Panel as RusticPanel } from '../engines/rustic';

describe('Collapse rustic advanced coverage', () => {
  it('covers multi-panel toggling, disabled guards, and end-position icons', () => {
    const handleChange = vi.fn();

    render(
      <RusticCollapse expandIconPosition="end" onChange={handleChange}>
        <RusticPanel panelKey="first" header="First panel">
          First body
        </RusticPanel>
        <RusticPanel panelKey="second" header="Second panel" disabled>
          Second body
        </RusticPanel>
      </RusticCollapse>
    );

    const headers = screen.getAllByText(/panel/i);
    fireEvent.click(headers[0]);
    expect(handleChange).toHaveBeenCalledWith(['first']);
    expect(screen.getByText('First body').getAttribute('style')).toContain('max-height: 1000');

    fireEvent.click(headers[1]);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('covers accordion mode, ghost styling, and controlled activeKey updates', () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <RusticCollapse accordion ghost activeKey="one" onChange={handleChange}>
        <RusticPanel panelKey="one" header="One">
          One body
        </RusticPanel>
        <RusticPanel panelKey="two" header="Two" extra={<button type="button">Extra</button>}>
          Two body
        </RusticPanel>
      </RusticCollapse>
    );

    const oneBody = screen.getByText('One body') as HTMLDivElement;
    expect(oneBody.getAttribute('style')).toContain('max-height: 1000');
    expect(screen.getByText('Extra')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Two'));
    expect(handleChange).toHaveBeenCalledWith('two');

    rerender(
      <RusticCollapse accordion ghost activeKey="two">
        <RusticPanel panelKey="one" header="One">
          One body
        </RusticPanel>
        <RusticPanel panelKey="two" header="Two">
          Two body
        </RusticPanel>
      </RusticCollapse>
    );

    expect(screen.getByText('Two body').getAttribute('style')).toContain('max-height: 1000');
  });
});
