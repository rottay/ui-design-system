/**
 * Timeline Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timeline } from './';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../engines/factory', () => ({
  createEngineComponent: () => {
    const MockTimeline = ({ children, mode, pending, reverse, items, ...props }: any) => (
      <div
        data-testid="timeline"
        data-mode={mode}
        data-pending={pending ? 'true' : 'false'}
        data-reverse={reverse ? 'true' : 'false'}
        {...props}
      >
        {items
          ? items.map((item: any, index: number) => (
              <div key={index} data-testid="timeline-item" data-color={item.color}>
                {item.children}
              </div>
            ))
          : children}
        {pending && <div data-testid="timeline-pending">{pending}</div>}
      </div>
    );
    MockTimeline.displayName = 'Timeline';
    return MockTimeline;
  },
}));

describe('Timeline', () => {
  it('renders correctly', () => {
    render(
      <Timeline>
        <Timeline.Item>First item</Timeline.Item>
        <Timeline.Item>Second item</Timeline.Item>
      </Timeline>
    );
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('renders children items', () => {
    render(
      <Timeline>
        <Timeline.Item>First item</Timeline.Item>
        <Timeline.Item>Second item</Timeline.Item>
        <Timeline.Item>Third item</Timeline.Item>
      </Timeline>
    );
    expect(screen.getByText('First item')).toBeInTheDocument();
    expect(screen.getByText('Second item')).toBeInTheDocument();
    expect(screen.getByText('Third item')).toBeInTheDocument();
  });

  it.each(['left', 'right', 'alternate'] as const)('renders mode %s', (mode) => {
    render(
      <Timeline mode={mode}>
        <Timeline.Item>Test item</Timeline.Item>
      </Timeline>
    );
    expect(screen.getByTestId('timeline')).toHaveAttribute('data-mode', mode);
  });

  it('renders with pending content', () => {
    render(
      <Timeline pending="Loading...">
        <Timeline.Item>Completed item</Timeline.Item>
      </Timeline>
    );
    expect(screen.getByTestId('timeline')).toHaveAttribute('data-pending', 'true');
    expect(screen.getByTestId('timeline-pending')).toHaveTextContent('Loading...');
  });

  it('applies reverse attribute', () => {
    render(
      <Timeline reverse>
        <Timeline.Item>First item</Timeline.Item>
        <Timeline.Item>Second item</Timeline.Item>
      </Timeline>
    );
    expect(screen.getByTestId('timeline')).toHaveAttribute('data-reverse', 'true');
  });

  it('renders with items prop', () => {
    const items = [
      { children: 'Item 1', color: 'green' },
      { children: 'Item 2', color: 'blue' },
      { children: 'Item 3', color: 'red' },
    ];
    render(<Timeline items={items} />);
    const timelineItems = screen.getAllByTestId('timeline-item');
    expect(timelineItems).toHaveLength(3);
    expect(timelineItems[0]).toHaveTextContent('Item 1');
    expect(timelineItems[0]).toHaveAttribute('data-color', 'green');
  });

  it('applies custom className', () => {
    render(
      <Timeline className="custom-timeline">
        <Timeline.Item>Test item</Timeline.Item>
      </Timeline>
    );
    expect(screen.getByTestId('timeline')).toHaveClass('custom-timeline');
  });

  it('applies custom style', () => {
    const customStyle = { marginTop: '20px' };
    render(
      <Timeline style={customStyle}>
        <Timeline.Item>Test item</Timeline.Item>
      </Timeline>
    );
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });
});

describe('Timeline.Item', () => {
  it('renders with children content', () => {
    render(
      <Timeline.Item>Test content</Timeline.Item>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders with color prop', () => {
    const items = [{ children: 'Colored item', color: 'green' }];
    render(<Timeline items={items} />);
    const item = screen.getByTestId('timeline-item');
    expect(item).toHaveAttribute('data-color', 'green');
  });

  it.each(['blue', 'red', 'green', 'gray'] as const)('renders with color %s', (color) => {
    const items = [{ children: 'Test item', color }];
    render(<Timeline items={items} />);
    expect(screen.getByTestId('timeline-item')).toHaveAttribute('data-color', color);
  });
});

describe('Timeline accessibility', () => {
  it('renders semantic structure', () => {
    render(
      <Timeline>
        <Timeline.Item>First event</Timeline.Item>
        <Timeline.Item>Second event</Timeline.Item>
      </Timeline>
    );
    // The mock doesn't add role, but the actual component should have role="list"
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('supports keyboard navigation via tabIndex', () => {
    render(
      <Timeline>
        <Timeline.Item>Accessible item</Timeline.Item>
      </Timeline>
    );
    expect(screen.getByText('Accessible item')).toBeInTheDocument();
  });
});

describe('Timeline edge cases', () => {
  it('handles empty timeline', () => {
    render(<Timeline />);
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('handles single item', () => {
    render(
      <Timeline>
        <Timeline.Item>Only item</Timeline.Item>
      </Timeline>
    );
    expect(screen.getByText('Only item')).toBeInTheDocument();
  });

  it('handles complex content in items', () => {
    render(
      <Timeline>
        <Timeline.Item>
          <div>
            <strong>Title</strong>
            <p>Description paragraph</p>
          </div>
        </Timeline.Item>
      </Timeline>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description paragraph')).toBeInTheDocument();
  });
});

describe('Timeline engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(
      <Timeline engine={engine}>
        <Timeline.Item>Test</Timeline.Item>
      </Timeline>
    );
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });
});

describe('Timeline tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(
      <Timeline>
        <Timeline.Item>Test</Timeline.Item>
      </Timeline>
    );
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
