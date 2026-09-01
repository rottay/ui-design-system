import React from 'react';
import { within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { BulkSelectToggle } from '../index';

describe('BulkSelectToggle selection announcement', () => {
  it('keeps one polite region mounted so a changing count is announced', async () => {
    const { container, rerender } = renderWithEngine(
      <BulkSelectToggle active onToggle={vi.fn()} selectedCount={3} />,
      'modern',
    );

    const region = await within(container).findByRole('status');
    expect(region).toHaveTextContent('3 selected');

    rerender(<BulkSelectToggle active onToggle={vi.fn()} selectedCount={5} />);

    // Same node, new text: a live region only reports changes it was already
    // mounted for, so remounting it per count would announce nothing.
    expect(within(container).getByRole('status')).toBe(region);
    expect(region).toHaveTextContent('5 selected');
  });

  it('mounts the region before there is any selection to announce', async () => {
    const { container, rerender } = renderWithEngine(
      <BulkSelectToggle active={false} onToggle={vi.fn()} selectedCount={0} />,
      'modern',
    );

    const region = await within(container).findByRole('status');
    expect(region).toHaveTextContent('');

    rerender(<BulkSelectToggle active onToggle={vi.fn()} selectedCount={1} />);

    expect(within(container).getByRole('status')).toBe(region);
    expect(region).toHaveTextContent('1 selected');
  });

  it('hides the visual badge from assistive tech so the count is read once', async () => {
    const { container } = renderWithEngine(
      <BulkSelectToggle active onToggle={vi.fn()} selectedCount={2} />,
      'modern',
    );

    await within(container).findByRole('status');

    const badge = container.querySelector('.ds-bulk-select-toggle__count');
    expect(badge).not.toBeNull();
    expect(badge).toHaveAttribute('aria-hidden', 'true');
    expect(badge).toHaveTextContent('2 selected');
  });
});

describe('BulkSelectToggle label foreground', () => {
  it('lets the trigger label inherit the button foreground instead of painting its own', () => {
    const { container } = renderWithEngine(
      <BulkSelectToggle active onToggle={vi.fn()} selectedCount={3} />,
      'modern',
    );

    // The Text typography node is the innermost data-part="label": the Button
    // wraps its children in one of its own.
    const labels = container.querySelectorAll('button [data-part="label"]');
    const text = labels[labels.length - 1];

    // data-color is what the modern typography skin resolves; an omitted color
    // lands on "default", which painted 1.06:1 on the active fill.
    expect(text).toBeTruthy();
    expect(text.getAttribute('data-color')).toBe('inherit');
    expect(text.textContent?.trim()).toBe('Done');
  });
});
