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
    // 'First body' is the contentInner div's direct text; its parent is the
    // grid-row track (contentTrack), which expands via grid-template-rows.
    const firstTrack = screen.getByText('First body').parentElement as HTMLElement;
    expect(firstTrack.getAttribute('style')).toContain('grid-template-rows: 1fr');

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
    const oneTrack = oneBody.parentElement as HTMLElement;
    expect(oneTrack.getAttribute('style')).toContain('grid-template-rows: 1fr');
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

    const twoTrack = screen.getByText('Two body').parentElement as HTMLElement;
    expect(twoTrack.getAttribute('style')).toContain('grid-template-rows: 1fr');
  });

  it('toggles the grid-row track between 1fr and 0fr and never emits a max-height style', () => {
    render(
      <RusticCollapse defaultActiveKey="one">
        <RusticPanel panelKey="one" header="One">
          One body
        </RusticPanel>
      </RusticCollapse>
    );

    const track = screen.getByText('One body').parentElement as HTMLElement;
    expect(track.className).toContain('rottay-collapse-content-track');
    expect(track.getAttribute('style')).toContain('grid-template-rows: 1fr');
    expect(track.getAttribute('style')).not.toMatch(/max-height/);

    fireEvent.click(screen.getByText('One'));
    expect(track.getAttribute('style')).toContain('grid-template-rows: 0fr');
    expect(track.getAttribute('style')).not.toMatch(/max-height/);
  });

  it('ships a reduced-motion override in the injected stylesheet covering the track and arrow', () => {
    const { container } = render(
      <RusticCollapse>
        <RusticPanel panelKey="1" header="Panel">
          Body
        </RusticPanel>
      </RusticCollapse>
    );

    const styleTag = container.querySelector('style');
    expect(styleTag).toBeTruthy();
    const css = styleTag?.textContent ?? '';

    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain('.rottay-collapse-content-track');
    expect(css).toContain('.rottay-collapse-arrow');
    expect(css).toContain('transition:none');
  });
});
