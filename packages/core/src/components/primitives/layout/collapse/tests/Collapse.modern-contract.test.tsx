/**
 * Collapse modern-engine contract tests (K3-C pass 1).
 *
 * Falsification-driven coverage for the gaps the K3-C inventory proved:
 * the `size` and `collapsible` props existed in the contract but the modern
 * engine ignored both, headers were `role="button"` divs with no tabIndex
 * and no key handler (the "keyboard accessible" docblock claim was false),
 * and the header/content padding rhythm was split between engine inline
 * styles and the skin. These tests pin:
 *
 *  - `data-size` normalization (canonical sm|md|lg + legacy antd aliases);
 *  - keyboard toggle semantics (Enter/Space, tabIndex, aria-expanded,
 *    aria-disabled) including the `collapsible='icon'` and
 *    `collapsible='disabled'` modes;
 *  - RTL-safe header extras (`margin-inline-start`, never `margin-left`);
 *  - padding ownership: the engine inlines NO padding on header or
 *    content-inner (the modern skin owns the rhythm via data-size/--ghost).
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  Collapse as ModernCollapse,
  Panel as ModernPanel,
  normalizeCollapseSize,
} from '../engines/modern';

function renderBasic(extraProps: Record<string, unknown> = {}, panelProps: Record<string, unknown> = {}) {
  return render(
    <ModernCollapse {...extraProps}>
      <ModernPanel panelKey="one" header="One" {...panelProps}>
        One body
      </ModernPanel>
    </ModernCollapse>
  );
}

function headerOf(text: string): HTMLElement {
  return screen.getByText(text).closest('[data-part="header"]') as HTMLElement;
}

function contentTrackOf(text: string): HTMLElement {
  return screen.getByText(text).closest('[data-part="content"]') as HTMLElement;
}

describe('Collapse modern contract: size', () => {
  it('normalizes the canonical and legacy size values', () => {
    expect(normalizeCollapseSize('sm')).toBe('sm');
    expect(normalizeCollapseSize('small')).toBe('sm');
    expect(normalizeCollapseSize('md')).toBe('md');
    expect(normalizeCollapseSize('middle')).toBe('md');
    expect(normalizeCollapseSize(undefined)).toBe('md');
    expect(normalizeCollapseSize('lg')).toBe('lg');
    expect(normalizeCollapseSize('large')).toBe('lg');
  });

  it.each([
    ['small', 'sm'],
    ['middle', 'md'],
    ['large', 'lg'],
    ['sm', 'sm'],
    ['lg', 'lg'],
  ] as const)('stamps data-size="%s" as "%s" on the root', (size, stamped) => {
    const { container } = renderBasic({ size });
    expect(container.querySelector('[data-part="root"]')?.getAttribute('data-size')).toBe(stamped);
  });

  it('defaults data-size to md when size is not provided', () => {
    const { container } = renderBasic();
    expect(container.querySelector('[data-part="root"]')?.getAttribute('data-size')).toBe('md');
  });
});

describe('Collapse modern contract: keyboard headers', () => {
  it('marks the header as a focusable button with expanded state', () => {
    renderBasic();
    const header = headerOf('One');
    expect(header.getAttribute('role')).toBe('button');
    expect(header.tabIndex).toBe(0);
    expect(header.getAttribute('aria-expanded')).toBe('false');
    expect(header.getAttribute('aria-disabled')).toBeNull();
  });

  it('toggles on Enter and on Space', () => {
    const handleChange = vi.fn();
    renderBasic({ onChange: handleChange });
    const header = headerOf('One');
    const track = contentTrackOf('One body');

    fireEvent.keyDown(header, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith(['one']);
    expect(track.getAttribute('style')).toContain('grid-template-rows: 1fr');

    fireEvent.keyDown(header, { key: ' ' });
    expect(track.getAttribute('style')).toContain('grid-template-rows: 0fr');
  });

  it('does not toggle on unrelated keys', () => {
    const handleChange = vi.fn();
    renderBasic({ onChange: handleChange });
    fireEvent.keyDown(headerOf('One'), { key: 'ArrowDown' });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('a disabled panel header is inert: tabIndex -1, aria-disabled, no click/key toggle', () => {
    const handleChange = vi.fn();
    renderBasic({ onChange: handleChange }, { disabled: true });
    const header = headerOf('One');
    expect(header.tabIndex).toBe(-1);
    expect(header.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(header);
    fireEvent.keyDown(header, { key: 'Enter' });
    expect(handleChange).not.toHaveBeenCalled();
    expect(contentTrackOf('One body').getAttribute('style')).toContain('grid-template-rows: 0fr');
  });
});

describe('Collapse modern contract: collapsible modes', () => {
  it("collapsible='disabled' renders every header inert", () => {
    const handleChange = vi.fn();
    renderBasic({ collapsible: 'disabled', onChange: handleChange });
    const header = headerOf('One');
    expect(header.getAttribute('data-collapsible')).toBe('disabled');
    expect(header.tabIndex).toBe(-1);
    expect(header.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(header);
    fireEvent.keyDown(header, { key: 'Enter' });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("collapsible='icon' moves the toggle role from the header to the arrow", () => {
    const handleChange = vi.fn();
    const { container } = renderBasic({ collapsible: 'icon', onChange: handleChange });
    const header = headerOf('One');
    const arrow = container.querySelector('[data-part="arrow"]') as HTMLElement;

    // The header is presentation-only in icon mode; the arrow is the control.
    expect(header.getAttribute('role')).toBeNull();
    expect(header.getAttribute('data-collapsible')).toBe('icon');
    expect(arrow.getAttribute('role')).toBe('button');
    expect(arrow.tabIndex).toBe(0);
    expect(arrow.getAttribute('aria-expanded')).toBe('false');

    // Clicking the header does nothing; clicking the arrow toggles.
    fireEvent.click(header);
    expect(handleChange).not.toHaveBeenCalled();
    fireEvent.click(arrow);
    expect(handleChange).toHaveBeenCalledWith(['one']);
    expect(arrow.getAttribute('aria-expanded')).toBe('true');

    // Keyboard on the arrow toggles as well.
    fireEvent.keyDown(arrow, { key: ' ' });
    expect(arrow.getAttribute('aria-expanded')).toBe('false');
  });

  it("collapsible='icon' still respects a disabled panel", () => {
    const handleChange = vi.fn();
    const { container } = renderBasic(
      { collapsible: 'icon', onChange: handleChange },
      { disabled: true }
    );
    const arrow = container.querySelector('[data-part="arrow"]') as HTMLElement;
    expect(arrow.getAttribute('role')).toBeNull();
    fireEvent.click(arrow);
    fireEvent.keyDown(arrow, { key: 'Enter' });
    expect(handleChange).not.toHaveBeenCalled();
  });
});

describe('Collapse modern contract: RTL + paint ownership', () => {
  it('the extra actions slot is the toggle\'s SIBLING, never nested in the button (axe nested-interactive)', () => {
    render(
      <ModernCollapse>
        <ModernPanel panelKey="one" header="One" extra={<button type="button">Edit</button>}>
          One body
        </ModernPanel>
      </ModernCollapse>
    );
    const extra = screen.getByText('Edit').closest('[data-part="extra"]') as HTMLElement;
    const header = headerOf('One');
    // The extra lives in the plain header row, OUTSIDE the role=button toggle.
    expect(header.getAttribute('role')).toBe('button');
    expect(header.contains(extra)).toBe(false);
    const row = extra.closest('[data-part="header-row"]') as HTMLElement;
    expect(row).toBeTruthy();
    expect(row.contains(header)).toBe(true);
    // No physical/logical margin is inlined; the gap is skin-owned.
    expect(extra.getAttribute('style')).toBeNull();
  });

  it('inlines no padding on the header row, header, or content-inner (skin-owned rhythm)', () => {
    renderBasic({ defaultActiveKey: 'one' });
    const header = headerOf('One');
    expect(header.style.getPropertyValue('padding')).toBe('');
    const row = header.closest('[data-part="header-row"]') as HTMLElement;
    expect(row.style.getPropertyValue('padding')).toBe('');
    const inner = screen.getByText('One body').closest('[data-part="content-inner"]') as HTMLElement;
    expect(inner.style.getPropertyValue('padding')).toBe('');
  });

  it('stamps the expanded state on the arrow for the skin rotation', () => {
    const { container } = renderBasic({ defaultActiveKey: 'one' });
    const arrow = container.querySelector('[data-part="arrow"]') as HTMLElement;
    expect(arrow.getAttribute('data-expanded')).toBe('true');
  });
});
