/**
 * Result modern engine -- focused real-engine coverage (K1 Lane C).
 *
 * After the premium pass: raw utility paint is gone from the engine (the
 * unlayered skin owns layout/typography/well geometry), built-in glyphs are
 * the governed semantic icon roles wrapped in `data-part='status-icon'`
 * (consumer icons in the same slot stay unpainted), and HTTP statuses render
 * display status codes.
 */
import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernResult from '../engines/modern';
import { Button } from '@/ui/primitives/inputs/Button';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

describe('Result modern engine', () => {
  it('renders the completion grammar: glyph well, title, guidance, action row', () => {
    const { container } = renderWithEngine(
      <ModernResult
        status="success"
        title="Payment complete"
        subTitle="Your order was processed successfully."
        extra={<button type="button">View order</button>}
      />,
      'modern',
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-tone', 'success');
    // No raw utility paint remains on the tree.
    for (const drained of ['flex', 'flex-col', 'py-12', 'px-6', 'text-2xl', 'font-bold', 'text-center', 'h-24', 'w-24', 'mb-6', 'mb-2']) {
      expect(root.className.split(/\s+/)).not.toContain(drained);
    }
    expect(container.querySelector('[data-part="status-icon"]')).not.toBeNull();
    expect(container.querySelector('[data-icon-name="status.success"]')).not.toBeNull();
    expect(container.querySelector('[data-part="title"]')?.textContent).toBe('Payment complete');
    expect(container.querySelector('[data-part="description"]')).not.toBeNull();
    expect(container.querySelector('[data-part="extra"]')).not.toBeNull();
  });

  it('keeps a consumer-supplied icon free of the built-in well part', () => {
    const { container } = renderWithEngine(
      <ModernResult status="info" icon={<span data-testid="custom-glyph">★</span>} title="Custom" />,
      'modern',
    );

    expect(container.querySelector('[data-testid="custom-glyph"]')).not.toBeNull();
    expect(container.querySelector('[data-part="status-icon"]')).toBeNull();
  });

  it('renders HTTP statuses as display status codes with tone', () => {
    const { container } = renderWithEngine(
      <ModernResult status="404" title="Page not found" />,
      'modern',
    );

    const root = container.querySelector('[data-part="root"]');
    expect(root).toHaveAttribute('data-tone', '404');
    expect(container.querySelector('[data-part="status-code"]')?.textContent).toBe('404');
    expect(container.querySelector('[data-part="status-icon"]')).toBeNull();
  });

  it('renders every semantic tone with its governed icon role', () => {
    const tones = [
      ['success', 'status.success'],
      ['error', 'status.error'],
      ['info', 'status.info'],
      ['warning', 'status.warning'],
    ] as const;

    for (const [status, iconName] of tones) {
      const { container, unmount } = renderWithEngine(
        <ModernResult status={status} title={status} />,
        'modern',
      );
      expect(container.querySelector(`[data-icon-name="${iconName}"]`)).not.toBeNull();
      unmount();
    }
  });

  it('omits optional parts when their props are absent', () => {
    const { container } = renderWithEngine(<ModernResult status="success" />, 'modern');

    expect(container.querySelector('[data-part="title"]')).toBeNull();
    expect(container.querySelector('[data-part="description"]')).toBeNull();
    expect(container.querySelector('[data-part="extra"]')).toBeNull();
    expect(container.querySelector('[data-part="content"]')).toBeNull();
    // The status glyph always renders: never an empty indicator slot.
    expect(container.querySelector('[data-part="status-icon"]')).not.toBeNull();
  });

  it('documents the slot-collision surface: slotted Button stamps its own data-part=content', async () => {
    // The modern Button wraps its label in <span data-part="content"> -- the
    // part name that used to collide with the skin's descendant selector and
    // repaint the action label dark on the primary fill (TMM illegibility).
    // The skin now child-scopes every part rule to the Result root
    // (Result.skin-confinement.test.ts guards the CSS side).
    const { container } = renderWithEngine(
      <ModernResult
        status="success"
        title="Payment complete"
        extra={<Button size="sm">View package</Button>}
      />,
      'modern',
    );

    // The slotted Button loads through the lazy engine boundary; awaiting its
    // label keeps the Suspense resolution inside act() (integration-suite
    // pattern) instead of letting it land after the assertions.
    await screen.findByText('View package');

    const extra = container.querySelector('[data-part="extra"]');
    expect(extra).not.toBeNull();
    const slottedContent = extra!.querySelector('[data-part="content"]');
    expect(slottedContent).not.toBeNull();
    // The colliding content span belongs to the Button, not to the Result:
    // the root has NO direct-child [data-part='content'] (icon/title/extra only),
    // which is exactly what the child-scoped skin selectors now require.
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root.querySelector(':scope > [data-part="content"]')).toBeNull();
    expect(slottedContent!.closest('button')).not.toBeNull();
  });
});
