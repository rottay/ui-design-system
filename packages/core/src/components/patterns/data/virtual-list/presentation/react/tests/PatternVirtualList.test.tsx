import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PatternVirtualList } from '..';

interface Row {
  id: string;
  label: string;
}

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `row-${index}`,
    label: `Item ${index}`,
  }));
}

describe('PatternVirtualList', () => {
  it('renders only the windowed rows, not the whole dataset', () => {
    const { container } = render(
      <PatternVirtualList<Row>
        items={makeRows(1000)}
        estimateSize={40}
        overscan={4}
        getItemKey={(row) => row.id}
        renderItem={(row) => <span>{row.label}</span>}
      />,
    );

    const rendered = container.querySelectorAll('[data-part="item"]');
    // Window collapses to the overscan band at the top (viewport is 0 in the
    // test DOM): far fewer nodes than the 1000-item dataset.
    expect(rendered.length).toBeLessThan(20);
    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.queryByText('Item 500')).not.toBeInTheDocument();
  });

  it('sizes the spacer to the full estimated height', () => {
    const { container } = render(
      <PatternVirtualList<Row>
        items={makeRows(100)}
        estimateSize={40}
        renderItem={(row) => <span>{row.label}</span>}
      />,
    );
    const spacer = container.querySelector('[data-part="spacer"]') as HTMLElement;
    expect(spacer).not.toBeNull();
    // 100 rows x 40px estimate. The measured total rides the family channel the
    // skin consumes (`block-size`), so the TSX paints nothing itself.
    expect(spacer.style.getPropertyValue('--ds-virtual-list-spacer-block-size')).toBe('4000px');
    expect(spacer.style.height).toBe('');
  });

  it('stamps the viewport bound only when the caller states a height', () => {
    const rows = makeRows(10);
    const stated = render(
      <PatternVirtualList<Row>
        items={rows}
        estimateSize={40}
        height={480}
        renderItem={(row) => <span>{row.label}</span>}
      />,
    );
    const statedRoot = stated.container.querySelector('[data-part="root"]') as HTMLElement;
    expect(statedRoot.style.getPropertyValue('--ds-virtual-list-block-size')).toBe('480px');

    // Negative control: a list that states nothing leaves the bound to the
    // skin's resting declaration rather than forcing it on every render.
    const omitted = render(
      <PatternVirtualList<Row>
        items={rows}
        estimateSize={40}
        renderItem={(row) => <span>{row.label}</span>}
      />,
    );
    const omittedRoot = omitted.container.querySelector('[data-part="root"]') as HTMLElement;
    expect(omittedRoot.style.getPropertyValue('--ds-virtual-list-block-size')).toBe('');
  });

  it('parks each windowed row on its own measured offset channel', () => {
    const { container } = render(
      <PatternVirtualList<Row>
        items={makeRows(100)}
        estimateSize={40}
        renderItem={(row) => <span>{row.label}</span>}
      />,
    );
    const rows = container.querySelectorAll('[data-part="item"]');
    const second = rows[1] as HTMLElement;
    expect(second.style.getPropertyValue('--ds-virtual-list-item-inset-block-start')).toBe('40px');
    // Nothing else travels inline: the anchoring itself is the skin's.
    expect(second.style.position).toBe('');
    expect(second.style.top).toBe('');
  });

  it('exposes list semantics with position metadata', () => {
    const { container } = render(
      <PatternVirtualList<Row>
        items={makeRows(50)}
        estimateSize={40}
        aria-label="Messages"
        renderItem={(row) => <span>{row.label}</span>}
      />,
    );
    expect(container.querySelector('[role="list"]')).toHaveAttribute('aria-label', 'Messages');
    const firstItem = container.querySelector('[data-part="item"]') as HTMLElement;
    expect(firstItem).toHaveAttribute('role', 'listitem');
    expect(firstItem).toHaveAttribute('aria-setsize', '50');
    expect(firstItem).toHaveAttribute('aria-posinset', '1');
  });

  it('renders the empty state when there are no items', () => {
    render(
      <PatternVirtualList<Row>
        items={[]}
        renderItem={(row) => <span>{row.label}</span>}
        emptyState={<span>No messages yet</span>}
      />,
    );
    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });

  it('fires onEndReached through the sentinel when hasMore is set', () => {
    const onEndReached = vi.fn();
    render(
      <PatternVirtualList<Row>
        items={makeRows(10)}
        estimateSize={40}
        hasMore
        onEndReached={onEndReached}
        renderItem={(row) => <span>{row.label}</span>}
      />,
    );
    expect(onEndReached).toHaveBeenCalled();
  });

  it('does not render a sentinel when hasMore is false', () => {
    const { container } = render(
      <PatternVirtualList<Row>
        items={makeRows(10)}
        estimateSize={40}
        hasMore={false}
        onEndReached={vi.fn()}
        renderItem={(row) => <span>{row.label}</span>}
      />,
    );
    expect(container.querySelector('[data-part="sentinel"]')).toBeNull();
  });
});
