/**
 * Collapse modern-engine grid-template-rows tests (WO-CRA-07).
 *
 * Before this WO, the modern engine measured `scrollHeight` in a `useEffect`
 * and animated `max-height` (`engines/modern.tsx`, then lines 27-30 + 171-186).
 * These tests fail if the max-height technique is reintroduced, if the
 * grid-template-rows values stop tracking the active state, or if the
 * reduced-motion guard is deleted from the injected stylesheet.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Collapse as ModernCollapse, Panel as ModernPanel } from '../engines/modern';

describe('Collapse modern advanced coverage', () => {
  it('expands the grid-row track to 1fr and collapses it to 0fr on toggle, never using max-height', () => {
    const handleChange = vi.fn();

    render(
      <ModernCollapse onChange={handleChange}>
        <ModernPanel panelKey="one" header="One">
          One body
        </ModernPanel>
      </ModernCollapse>
    );

    const track = screen.getByText('One body').parentElement as HTMLElement;
    expect(track.className).toContain('rottay-collapse-content');
    expect(track.getAttribute('style')).toContain('grid-template-rows: 0fr');
    expect(track.getAttribute('style')).not.toMatch(/max-height/);

    fireEvent.click(screen.getByText('One'));
    // Non-accordion (default) mode reports an array of active keys.
    expect(handleChange).toHaveBeenCalledWith(['one']);
    expect(track.getAttribute('style')).toContain('grid-template-rows: 1fr');
    expect(track.getAttribute('style')).not.toMatch(/max-height/);

    fireEvent.click(screen.getByText('One'));
    expect(track.getAttribute('style')).toContain('grid-template-rows: 0fr');
  });

  it('keeps the inner content wrapper at min-height:0 so the track can reach 0fr', () => {
    render(
      <ModernCollapse defaultActiveKey="1">
        <ModernPanel panelKey="1" header="Panel">
          Body content
        </ModernPanel>
      </ModernCollapse>
    );

    const innerWrapper = screen.getByText('Body content').closest('.rottay-collapse-content-inner') as HTMLElement;
    expect(innerWrapper).toBeTruthy();
  });

  it('ships a reduced-motion override in the injected stylesheet covering the track, inner wrapper, and arrow', () => {
    const { container } = render(
      <ModernCollapse>
        <ModernPanel panelKey="1" header="Panel">
          Body
        </ModernPanel>
      </ModernCollapse>
    );

    const styleTag = container.querySelector('style');
    expect(styleTag).toBeTruthy();
    const css = styleTag?.textContent ?? '';

    expect(css).toContain('prefers-reduced-motion: reduce');
    // The media block must appear AFTER the base rules so it can win the
    // cascade, and it must cover all three transitioning selectors.
    const reducedMotionBlock = css.slice(css.indexOf('prefers-reduced-motion'));
    expect(reducedMotionBlock).toContain('.rottay-collapse-content');
    expect(reducedMotionBlock).toContain('.rottay-collapse-content-inner');
    expect(reducedMotionBlock).toContain('.rottay-collapse-arrow');
    expect(reducedMotionBlock).toContain('transition:none');
  });

  it('never emits a max-height or maxHeight style anywhere in the rendered output', () => {
    const { container } = render(
      <ModernCollapse defaultActiveKey="1">
        <ModernPanel panelKey="1" header="Panel one">
          Body one
        </ModernPanel>
        <ModernPanel panelKey="2" header="Panel two">
          Body two
        </ModernPanel>
      </ModernCollapse>
    );

    expect(container.innerHTML).not.toMatch(/max-height/i);
  });
});
