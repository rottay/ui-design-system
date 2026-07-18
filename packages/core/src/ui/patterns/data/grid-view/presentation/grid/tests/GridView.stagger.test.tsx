import React from 'react';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MotionProvider } from '@/infrastructure/runtime/motion';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';
import { PatternGridView } from '..';

interface Row {
  id: string;
  name: string;
}

function makeData(count: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({ id: String(index), name: `Row ${index}` }));
}

const renderCard = (item: Row): React.ReactElement => <div data-testid="card">{item.name}</div>;

async function gridRoot(container: HTMLElement): Promise<HTMLElement> {
  return (await waitFor(() => {
    const root = container.querySelector('.ds-pattern-grid-view[data-part="root"]');
    if (!root) throw new Error('grid root not found');
    return root;
  })) as HTMLElement;
}

describe('PatternGridView collection stagger', () => {
  it('stamps the stagger preset and per-item index under a motion-permitting policy', async () => {
    const { container } = renderWithEngine(
      <PatternGridView data={makeData(5)} renderCard={renderCard} rowKey="id" />,
      'modern',
    );

    const root = await gridRoot(container);
    expect(root.classList.contains('ds-collection-stagger')).toBe(true);

    const items = container.querySelectorAll('[data-ds-stagger-item]');
    expect(items.length).toBe(5);
    expect((items[4] as HTMLElement).style.getPropertyValue('--ds-stagger-index')).toBe('4');
    expect(container.querySelectorAll('[data-testid="card"]').length).toBe(5);
  });

  it('caps the container stagger window for a large batch', async () => {
    const { container } = renderWithEngine(
      <PatternGridView data={makeData(200)} renderCard={renderCard} rowKey="id" />,
      'modern',
    );

    const root = await gridRoot(container);
    // 200 * 30ms would be 6s; the recipe caps the window at 240ms.
    expect(root.style.getPropertyValue('--ds-stagger-max')).toBe('240ms');
    expect(root.style.getPropertyValue('--ds-stagger-step')).toBe('30ms');
  });

  it('renders every card at its final state under reduced motion', async () => {
    const { container } = renderWithEngine(
      <MotionProvider reducedMotion>
        <PatternGridView data={makeData(5)} renderCard={renderCard} rowKey="id" />
      </MotionProvider>,
      'modern',
    );

    const root = await gridRoot(container);
    expect(root.classList.contains('ds-collection-stagger')).toBe(false);
    expect(container.querySelectorAll('[data-ds-stagger-item]').length).toBe(0);
    // cards paint in place -- no wrapper, no hidden state
    expect(container.querySelectorAll('[data-testid="card"]').length).toBe(5);
  });

  it('keeps selectable cards staggered while preserving selection wiring', async () => {
    const { container } = renderWithEngine(
      <PatternGridView data={makeData(3)} renderCard={renderCard} rowKey="id" selectable />,
      'modern',
    );

    await gridRoot(container);
    await waitFor(() => {
      expect(
        container.querySelectorAll('[data-part="card-shell"][data-ds-stagger-item]').length,
      ).toBe(3);
    });
    // the checkbox overlay still exists on each selectable card
    expect(container.querySelectorAll('[data-part="checkbox-overlay"]').length).toBe(3);
  });
});
