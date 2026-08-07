// Status must reach the DOM as text: a pseudo-element dingbat plus tint leaves finished
// and failed steps indistinguishable, and collapses entirely under forced-colors.
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Steps } from '../engines/modern';

const ITEMS = [
  { title: 'Details' },
  { title: 'Payment' },
  { title: 'Review' },
];

function itemFor(container: HTMLElement, title: string): HTMLElement {
  const node = Array.from(container.querySelectorAll<HTMLElement>("[data-part='item']")).find(
    (candidate) => candidate.textContent?.includes(title),
  );
  if (!node) throw new Error(`no step item for ${title}`);
  return node;
}

describe('Steps modern: status carries a name, not only a hue and a dingbat', () => {
  it('names a finished step in the accessibility tree', () => {
    const { container } = render(<Steps items={ITEMS} current={2} />);

    const finished = itemFor(container, 'Details');
    expect(finished.getAttribute('data-status')).toBe('finish');
    expect(finished.textContent).toContain('Completed');
  });

  it('names a failed step distinctly from a finished one', () => {
    const { container } = render(
      <Steps
        items={[
          { title: 'Details' },
          { title: 'Payment', status: 'error' as const },
          { title: 'Review' },
        ]}
        current={2}
      />,
    );

    const failed = itemFor(container, 'Payment');
    const finished = itemFor(container, 'Details');
    expect(failed.getAttribute('data-status')).toBe('error');
    expect(failed.textContent).toContain('Error');
    expect(finished.textContent).toContain('Completed');
    // The whole point: the two statuses are no longer indistinguishable text.
    expect(failed.textContent).not.toBe(finished.textContent);
  });

  it('leaves waiting steps unannounced and the current step to aria-current', () => {
    const { container } = render(<Steps items={ITEMS} current={1} />);

    const waiting = itemFor(container, 'Review');
    expect(waiting.getAttribute('data-status')).toBe('wait');
    expect(waiting.textContent).toBe('Review');

    const active = itemFor(container, 'Payment');
    expect(active.getAttribute('aria-current')).toBe('step');
    expect(active.textContent).toBe('Payment');
  });

  it('clips the name from paint instead of drawing new text', () => {
    const { container } = render(<Steps items={ITEMS} current={2} />);

    const name = container.querySelector<HTMLElement>("[data-part='status-name']");
    expect(name).toBeTruthy();
    // The canonical screen-reader-only rule: absolutely positioned, so it
    // consumes no grid or flex slot in the step's layout.
    expect(name?.classList.contains('ds-visually-hidden')).toBe(true);
  });

  it('reaches the accessible name of a clickable step trigger', () => {
    const { container } = render(<Steps items={ITEMS} current={2} onChange={() => {}} />);

    const finished = itemFor(container, 'Details');
    const trigger = within(finished).getByRole('button');
    expect(trigger.textContent).toContain('Completed');
    expect(screen.getByRole('button', { name: /Details.*Completed/s })).toBe(trigger);
  });
});
