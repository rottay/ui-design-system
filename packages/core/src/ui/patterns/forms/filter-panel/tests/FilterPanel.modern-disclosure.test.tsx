import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import type { FilterDef } from '../contracts';
import ModernFilterPanel from '../engines/modern';

// The composed Button stamps its own `data-part="content"` label span, so the
// panel region must be addressed as the root's direct child.
const CONTENT = '[data-part="root"] > [data-part="content"]';

const FILTERS: FilterDef[] = [
  { key: 'query', label: 'Query', type: 'text', placeholder: 'Search' },
  { key: 'capacity', label: 'Capacity', type: 'number-range' },
  { key: 'window', label: 'Window', type: 'date-range' },
];

function renderPanel(props: Partial<React.ComponentProps<typeof ModernFilterPanel>> = {}) {
  return render(
    <ModernFilterPanel
      filters={FILTERS}
      values={{}}
      onChange={vi.fn()}
      {...props}
    />
  );
}

describe('ModernFilterPanel collapse disclosure', () => {
  it('wires the collapse toggle to the region it governs', () => {
    const { container } = renderPanel({ collapsible: true, title: 'Filters' });

    const toggle = screen.getByRole('button', { name: /collapse filters/i });
    const content = container.querySelector<HTMLElement>(CONTENT);

    expect(content).not.toBeNull();
    expect(content!.id).toBeTruthy();
    expect(toggle.getAttribute('aria-controls')).toBe(content!.id);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('takes the collapsed region out of the tab order and the AT tree', () => {
    const { container } = renderPanel({
      collapsible: true,
      defaultCollapsed: true,
      title: 'Filters',
    });

    const content = container.querySelector<HTMLElement>(CONTENT)!;

    // A collapsed region must be `inert`, not just visually clipped — CSS
    // alone leaves every filter inside focusable and exposed to assistive tech.
    expect(content.hasAttribute('inert')).toBe(true);
    expect(content.getAttribute('aria-hidden')).toBe('true');
  });

  it('returns the region to the tab order when expanded', () => {
    const { container } = renderPanel({
      collapsible: true,
      defaultCollapsed: true,
      title: 'Filters',
    });

    fireEvent.click(screen.getByRole('button', { name: /expand filters/i }));

    const content = container.querySelector<HTMLElement>(CONTENT)!;
    expect(content.hasAttribute('inert')).toBe(false);
    expect(content.getAttribute('aria-hidden')).toBeNull();
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('never marks the region inert when the panel is not collapsible', () => {
    const { container } = renderPanel({ defaultCollapsed: true, title: 'Filters' });

    const content = container.querySelector<HTMLElement>(CONTENT)!;
    expect(content.hasAttribute('inert')).toBe(false);
  });
});

describe('ModernFilterPanel range naming', () => {
  it('gives each date-range bound its own standalone name', () => {
    renderPanel();

    const group = screen.getByRole('group', { name: 'Window' });
    // Each date-range bound needs its own accessible name; the group label alone doesn't reach the inputs.
    expect(group).toContainElement(screen.getByLabelText('From'));
    expect(group).toContainElement(screen.getByLabelText('To'));
  });

  it('localizes the number-range separator instead of painting a bare hyphen', () => {
    const { container } = renderPanel();

    const separators = Array.from(
      container.querySelectorAll<HTMLElement>('[data-part="range-separator"]')
    ).map((node) => node.textContent);

    expect(separators).toHaveLength(2);
    expect(separators).not.toContain('-');
    for (const text of separators) expect(text).toBe('to');
  });
});

describe('ModernFilterPanel handler-less actions', () => {
  it('does not paint a reset button without an onReset handler', () => {
    const { container } = renderPanel({ showReset: true, title: 'Filters' });

    expect(container.querySelector('[data-part="reset-button"]')).toBeNull();
  });

  it('does not paint an apply button without an onApply handler', () => {
    const { container } = renderPanel({ showApply: true });

    expect(container.querySelector('[data-part="apply-button"]')).toBeNull();
  });

  it('paints both actions once their handlers arrive', () => {
    const onReset = vi.fn();
    const onApply = vi.fn();
    const { container } = renderPanel({
      showReset: true,
      showApply: true,
      onReset,
      onApply,
      title: 'Filters',
    });

    const reset = container.querySelector<HTMLElement>('[data-part="reset-button"]')!;
    const apply = container.querySelector<HTMLElement>('[data-part="apply-button"]')!;
    fireEvent.click(reset);
    fireEvent.click(apply);

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledTimes(1);
  });
});

describe('ModernFilterPanel active count', () => {
  it('names the active-count badge instead of announcing a bare numeral', () => {
    const { container } = renderPanel({ activeCount: 6, title: 'Filters' });

    const badge = container.querySelector<HTMLElement>('[data-part="active-count-badge"]')!;
    expect(badge.getAttribute('aria-label')).toBe('Active filters');
  });
});
