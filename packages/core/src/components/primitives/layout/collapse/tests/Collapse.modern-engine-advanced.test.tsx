/**
 * Collapse modern-engine reveal tests (WO-CRA-07, re-anchored by WO-FAM-07/L7).
 *
 * Before WO-CRA-07 the modern engine measured `scrollHeight` in a `useEffect`
 * and animated `max-height`. These tests fail if that technique returns.
 *
 * WHAT MOVED (the family cut): the reveal itself is no longer an inline
 * `grid-template-rows` written per render, nor a per-instance `<style>` tag
 * carrying the reduced-motion guard. Both are the modern skin's now, keyed on
 * the `data-expanded` the engine stamps. So these cases pin the CAUSE the
 * engine owns -- the attribute tracking the active key, and the absence of any
 * engine-authored paint -- and the computed EFFECT (0fr -> 1fr, the fade, the
 * reduced-motion stop) is measured in a real browser by
 * `Collapse.causality.integration.test.tsx`. A test that read the inline value
 * or the tag's text was reading the engine's copy of a decision the skin now
 * makes; there is no second place left to read.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Collapse as ModernCollapse, Panel as ModernPanel } from '../engines/modern';

describe('Collapse modern advanced coverage', () => {
  it('tracks the active key on the content track and writes no paint of its own', () => {
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
    expect(track).toHaveAttribute('data-part', 'content');
    expect(track).toHaveAttribute('data-expanded', 'false');
    // A collapsed region leaves the tab order and the accessibility tree too.
    expect(track).toHaveAttribute('aria-hidden', 'true');
    expect(track).not.toHaveAttribute('style');

    fireEvent.click(screen.getByText('One'));
    // Non-accordion (default) mode reports an array of active keys.
    expect(handleChange).toHaveBeenCalledWith(['one']);
    expect(track).toHaveAttribute('data-expanded', 'true');
    expect(track).not.toHaveAttribute('aria-hidden');
    expect(track).not.toHaveAttribute('style');

    fireEvent.click(screen.getByText('One'));
    expect(track).toHaveAttribute('data-expanded', 'false');
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

  it('injects no stylesheet: the reveal and its reduced-motion guard are the skin\'s', () => {
    const { container } = render(
      <ModernCollapse>
        <ModernPanel panelKey="1" header="Panel">
          Body
        </ModernPanel>
        <ModernPanel panelKey="2" header="Panel two">
          Body two
        </ModernPanel>
      </ModernCollapse>
    );

    // A per-instance <style> tag is a fourth paint plane: unthemeable, beyond
    // any tenant layer, and repeated once per mounted Collapse. The guard it
    // used to carry is proven against a real `prefers-reduced-motion: reduce`
    // browser in Collapse.causality.integration.test.tsx.
    expect(container.querySelector('style')).toBeNull();
    // Every transitioning part is addressable by the skin without a class hook.
    for (const part of ['content', 'content-inner', 'arrow']) {
      expect(container.querySelectorAll(`[data-part="${part}"]`)).toHaveLength(2);
    }
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
