/**
 * Splitter Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Splitter } from '../';

// Mock the engine factory
vi.mock('../../../../../core/engines/factory', () => ({
  createEngineComponent: (name: string) => {
    if (name === 'Splitter') {
      const MockSplitter = ({
        children,
        layout,
        onResize,
        onResizeStart,
        onResizeEnd,
        className,
        style,
      }: any) => (
        <div
          data-testid="splitter"
          data-layout={layout}
          data-has-resize={!!onResize}
          data-has-resize-start={!!onResizeStart}
          data-has-resize-end={!!onResizeEnd}
          className={className}
          style={style}
        >
          {children}
        </div>
      );
      MockSplitter.displayName = 'Splitter';
      return MockSplitter;
    }
    if (name === 'Splitter.Panel') {
      const MockPanel = ({
        children,
        defaultSize,
        min,
        max,
        collapsible,
        resizable,
        className,
        style,
      }: any) => (
        <div
          data-testid="splitter-panel"
          data-default-size={defaultSize}
          data-min={min}
          data-max={max}
          data-collapsible={collapsible}
          data-resizable={resizable}
          className={className}
          style={style}
        >
          {children}
        </div>
      );
      MockPanel.displayName = 'Splitter.Panel';
      return MockPanel;
    }
    return () => null;
  },
}));

describe('Splitter', () => {
  it('renders correctly', () => {
    render(
      <Splitter>
        <Splitter.Panel>Panel 1</Splitter.Panel>
        <Splitter.Panel>Panel 2</Splitter.Panel>
      </Splitter>
    );
    expect(screen.getByTestId('splitter')).toBeInTheDocument();
    expect(screen.getByText('Panel 1')).toBeInTheDocument();
    expect(screen.getByText('Panel 2')).toBeInTheDocument();
  });

  describe('layout prop', () => {
    it('renders horizontal layout', () => {
      render(
        <Splitter layout="horizontal">
          <Splitter.Panel>Left</Splitter.Panel>
          <Splitter.Panel>Right</Splitter.Panel>
        </Splitter>
      );
      expect(screen.getByTestId('splitter')).toHaveAttribute('data-layout', 'horizontal');
    });

    it('renders vertical layout', () => {
      render(
        <Splitter layout="vertical">
          <Splitter.Panel>Top</Splitter.Panel>
          <Splitter.Panel>Bottom</Splitter.Panel>
        </Splitter>
      );
      expect(screen.getByTestId('splitter')).toHaveAttribute('data-layout', 'vertical');
    });
  });

  describe('callbacks', () => {
    it('accepts onResize callback', () => {
      const onResize = vi.fn();
      render(
        <Splitter onResize={onResize}>
          <Splitter.Panel>Panel 1</Splitter.Panel>
          <Splitter.Panel>Panel 2</Splitter.Panel>
        </Splitter>
      );
      expect(screen.getByTestId('splitter')).toHaveAttribute('data-has-resize', 'true');
    });

    it('accepts onResizeStart callback', () => {
      const onResizeStart = vi.fn();
      render(
        <Splitter onResizeStart={onResizeStart}>
          <Splitter.Panel>Panel 1</Splitter.Panel>
          <Splitter.Panel>Panel 2</Splitter.Panel>
        </Splitter>
      );
      expect(screen.getByTestId('splitter')).toHaveAttribute('data-has-resize-start', 'true');
    });

    it('accepts onResizeEnd callback', () => {
      const onResizeEnd = vi.fn();
      render(
        <Splitter onResizeEnd={onResizeEnd}>
          <Splitter.Panel>Panel 1</Splitter.Panel>
          <Splitter.Panel>Panel 2</Splitter.Panel>
        </Splitter>
      );
      expect(screen.getByTestId('splitter')).toHaveAttribute('data-has-resize-end', 'true');
    });
  });

  it('applies custom className', () => {
    render(
      <Splitter className="custom-splitter">
        <Splitter.Panel>Panel</Splitter.Panel>
      </Splitter>
    );
    expect(screen.getByTestId('splitter')).toHaveClass('custom-splitter');
  });

  it('applies custom style', () => {
    render(
      <Splitter style={{ height: '400px' }}>
        <Splitter.Panel>Panel</Splitter.Panel>
      </Splitter>
    );
    expect(screen.getByTestId('splitter')).toHaveStyle({ height: '400px' });
  });
});

describe('Splitter.Panel', () => {
  it('renders correctly', () => {
    render(<Splitter.Panel>Panel Content</Splitter.Panel>);
    expect(screen.getByTestId('splitter-panel')).toBeInTheDocument();
    expect(screen.getByText('Panel Content')).toBeInTheDocument();
  });

  it('renders with defaultSize', () => {
    render(<Splitter.Panel defaultSize={30}>Panel</Splitter.Panel>);
    expect(screen.getByTestId('splitter-panel')).toHaveAttribute('data-default-size', '30');
  });

  it('renders with min size', () => {
    render(<Splitter.Panel min={100}>Panel</Splitter.Panel>);
    expect(screen.getByTestId('splitter-panel')).toHaveAttribute('data-min', '100');
  });

  it('renders with max size', () => {
    render(<Splitter.Panel max={500}>Panel</Splitter.Panel>);
    expect(screen.getByTestId('splitter-panel')).toHaveAttribute('data-max', '500');
  });

  it('renders as collapsible', () => {
    render(<Splitter.Panel collapsible>Panel</Splitter.Panel>);
    expect(screen.getByTestId('splitter-panel')).toHaveAttribute('data-collapsible', 'true');
  });

  it('renders as resizable', () => {
    render(<Splitter.Panel resizable>Panel</Splitter.Panel>);
    expect(screen.getByTestId('splitter-panel')).toHaveAttribute('data-resizable', 'true');
  });

  it('applies custom className', () => {
    render(<Splitter.Panel className="custom-panel">Panel</Splitter.Panel>);
    expect(screen.getByTestId('splitter-panel')).toHaveClass('custom-panel');
  });

  it('applies custom style', () => {
    render(<Splitter.Panel style={{ backgroundColor: 'red' }}>Panel</Splitter.Panel>);
    expect(screen.getByTestId('splitter-panel')).toHaveStyle({ backgroundColor: 'red' });
  });
});

describe('Splitter composition', () => {
  it('renders multiple panels', () => {
    render(
      <Splitter layout="horizontal">
        <Splitter.Panel defaultSize={25} min={100}>
          Panel 1
        </Splitter.Panel>
        <Splitter.Panel defaultSize={50}>Panel 2</Splitter.Panel>
        <Splitter.Panel defaultSize={25} collapsible>
          Panel 3
        </Splitter.Panel>
      </Splitter>
    );

    const panels = screen.getAllByTestId('splitter-panel');
    expect(panels).toHaveLength(3);
  });

  it('renders nested splitters', () => {
    render(
      <Splitter layout="horizontal">
        <Splitter.Panel>Left</Splitter.Panel>
        <Splitter.Panel>
          <Splitter layout="vertical">
            <Splitter.Panel>Top Right</Splitter.Panel>
            <Splitter.Panel>Bottom Right</Splitter.Panel>
          </Splitter>
        </Splitter.Panel>
      </Splitter>
    );

    const splitters = screen.getAllByTestId('splitter');
    expect(splitters).toHaveLength(2);
  });
});

describe('Splitter engines', () => {
  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(
      <Splitter engine={engine}>
        <Splitter.Panel>Test</Splitter.Panel>
      </Splitter>
    );
    expect(screen.getByTestId('splitter')).toBeInTheDocument();
  });
});

describe('Splitter tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(
      <Splitter>
        <Splitter.Panel>Test</Splitter.Panel>
      </Splitter>
    );
    expect(screen.getByTestId('splitter')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
