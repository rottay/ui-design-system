/**
 * Collapse Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Collapse } from '../';

// Mock the engine factory
vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: (name: string) => {
    if (name === 'Collapse') {
      const MockCollapse = ({
        children,
        activeKey,
        defaultActiveKey,
        accordion,
        bordered,
        ghost,
        expandIconPosition,
        onChange,
        collapsible,
        size,
        className,
        style,
      }: any) => (
        <div
          data-testid="collapse"
          data-active-key={Array.isArray(activeKey) ? activeKey.join(',') : activeKey}
          data-default-active-key={Array.isArray(defaultActiveKey) ? defaultActiveKey.join(',') : defaultActiveKey}
          data-accordion={accordion}
          data-bordered={bordered}
          data-ghost={ghost}
          data-expand-icon-position={expandIconPosition}
          data-collapsible={collapsible}
          data-size={size}
          data-has-on-change={!!onChange}
          className={className}
          style={style}
        >
          {children}
        </div>
      );
      MockCollapse.displayName = 'Collapse';
      return MockCollapse;
    }
    if (name === 'Collapse.Panel') {
      const MockPanel = ({
        children,
        panelKey,
        header,
        disabled,
        showArrow,
        extra,
        forceRender,
        className,
        style,
      }: any) => (
        <div
          data-testid="collapse-panel"
          data-panel-key={panelKey}
          data-disabled={disabled}
          data-show-arrow={showArrow}
          data-has-extra={!!extra}
          data-force-render={forceRender}
          className={className}
          style={style}
        >
          {header && <div data-testid="panel-header">{header}</div>}
          {extra && <div data-testid="panel-extra">{extra}</div>}
          <div data-testid="panel-content">{children}</div>
        </div>
      );
      MockPanel.displayName = 'Collapse.Panel';
      return MockPanel;
    }
    return () => null;
  },
}));

describe('Collapse', () => {
  it('renders correctly', () => {
    render(
      <Collapse>
        <Collapse.Panel header="Panel 1" panelKey="1">
          Content 1
        </Collapse.Panel>
      </Collapse>
    );
    expect(screen.getByTestId('collapse')).toBeInTheDocument();
    expect(screen.getByText('Panel 1')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  describe('activeKey prop', () => {
    it('renders with single activeKey', () => {
      render(
        <Collapse activeKey="1">
          <Collapse.Panel header="Panel 1" panelKey="1">
            Content 1
          </Collapse.Panel>
        </Collapse>
      );
      expect(screen.getByTestId('collapse')).toHaveAttribute('data-active-key', '1');
    });

    it('renders with multiple activeKeys', () => {
      render(
        <Collapse activeKey={['1', '2']}>
          <Collapse.Panel header="Panel 1" panelKey="1">
            Content 1
          </Collapse.Panel>
          <Collapse.Panel header="Panel 2" panelKey="2">
            Content 2
          </Collapse.Panel>
        </Collapse>
      );
      expect(screen.getByTestId('collapse')).toHaveAttribute('data-active-key', '1,2');
    });
  });

  describe('defaultActiveKey prop', () => {
    it('renders with defaultActiveKey', () => {
      render(
        <Collapse defaultActiveKey="1">
          <Collapse.Panel header="Panel 1" panelKey="1">
            Content 1
          </Collapse.Panel>
        </Collapse>
      );
      expect(screen.getByTestId('collapse')).toHaveAttribute('data-default-active-key', '1');
    });
  });

  describe('accordion prop', () => {
    it('renders in accordion mode', () => {
      render(
        <Collapse accordion>
          <Collapse.Panel header="Panel 1" panelKey="1">
            Content 1
          </Collapse.Panel>
          <Collapse.Panel header="Panel 2" panelKey="2">
            Content 2
          </Collapse.Panel>
        </Collapse>
      );
      expect(screen.getByTestId('collapse')).toHaveAttribute('data-accordion', 'true');
    });
  });

  describe('bordered prop', () => {
    it('renders with borders', () => {
      render(
        <Collapse bordered>
          <Collapse.Panel header="Panel 1" panelKey="1">
            Content 1
          </Collapse.Panel>
        </Collapse>
      );
      expect(screen.getByTestId('collapse')).toHaveAttribute('data-bordered', 'true');
    });

    it('renders without borders', () => {
      render(
        <Collapse bordered={false}>
          <Collapse.Panel header="Panel 1" panelKey="1">
            Content 1
          </Collapse.Panel>
        </Collapse>
      );
      expect(screen.getByTestId('collapse')).toHaveAttribute('data-bordered', 'false');
    });
  });

  describe('ghost prop', () => {
    it('renders in ghost mode', () => {
      render(
        <Collapse ghost>
          <Collapse.Panel header="Panel 1" panelKey="1">
            Content 1
          </Collapse.Panel>
        </Collapse>
      );
      expect(screen.getByTestId('collapse')).toHaveAttribute('data-ghost', 'true');
    });
  });

  describe('expandIconPosition prop', () => {
    it.each(['start', 'end'] as const)('renders icon at %s', (position) => {
      render(
        <Collapse expandIconPosition={position}>
          <Collapse.Panel header="Panel 1" panelKey="1">
            Content 1
          </Collapse.Panel>
        </Collapse>
      );
      expect(screen.getByTestId('collapse')).toHaveAttribute('data-expand-icon-position', position);
    });
  });

  describe('size prop', () => {
    it.each(['small', 'middle', 'large'] as const)('renders size %s', (size) => {
      render(
        <Collapse size={size}>
          <Collapse.Panel header="Panel 1" panelKey="1">
            Content 1
          </Collapse.Panel>
        </Collapse>
      );
      expect(screen.getByTestId('collapse')).toHaveAttribute('data-size', size);
    });
  });

  describe('collapsible prop', () => {
    it.each(['header', 'icon', 'disabled'] as const)('renders collapsible %s', (collapsible) => {
      render(
        <Collapse collapsible={collapsible}>
          <Collapse.Panel header="Panel 1" panelKey="1">
            Content 1
          </Collapse.Panel>
        </Collapse>
      );
      expect(screen.getByTestId('collapse')).toHaveAttribute('data-collapsible', collapsible);
    });
  });

  it('accepts onChange callback', () => {
    const onChange = vi.fn();
    render(
      <Collapse onChange={onChange}>
        <Collapse.Panel header="Panel 1" panelKey="1">
          Content 1
        </Collapse.Panel>
      </Collapse>
    );
    expect(screen.getByTestId('collapse')).toHaveAttribute('data-has-on-change', 'true');
  });

  it('applies custom className', () => {
    render(
      <Collapse className="custom-collapse">
        <Collapse.Panel header="Panel" panelKey="1">
          Content
        </Collapse.Panel>
      </Collapse>
    );
    expect(screen.getByTestId('collapse')).toHaveClass('custom-collapse');
  });
});

describe('Collapse.Panel', () => {
  it('renders correctly', () => {
    render(
      <Collapse.Panel header="Panel Header" panelKey="1">
        Panel Content
      </Collapse.Panel>
    );
    expect(screen.getByTestId('collapse-panel')).toBeInTheDocument();
    expect(screen.getByText('Panel Header')).toBeInTheDocument();
    expect(screen.getByText('Panel Content')).toBeInTheDocument();
  });

  it('renders with panelKey', () => {
    render(
      <Collapse.Panel header="Panel" panelKey="unique-key">
        Content
      </Collapse.Panel>
    );
    expect(screen.getByTestId('collapse-panel')).toHaveAttribute('data-panel-key', 'unique-key');
  });

  it('renders as disabled', () => {
    render(
      <Collapse.Panel header="Disabled Panel" panelKey="1" disabled>
        Content
      </Collapse.Panel>
    );
    expect(screen.getByTestId('collapse-panel')).toHaveAttribute('data-disabled', 'true');
  });

  it('renders without arrow', () => {
    render(
      <Collapse.Panel header="No Arrow" panelKey="1" showArrow={false}>
        Content
      </Collapse.Panel>
    );
    expect(screen.getByTestId('collapse-panel')).toHaveAttribute('data-show-arrow', 'false');
  });

  it('renders with extra content', () => {
    render(
      <Collapse.Panel header="Panel" panelKey="1" extra={<button>Edit</button>}>
        Content
      </Collapse.Panel>
    );
    expect(screen.getByTestId('collapse-panel')).toHaveAttribute('data-has-extra', 'true');
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('renders with forceRender', () => {
    render(
      <Collapse.Panel header="Panel" panelKey="1" forceRender>
        Content
      </Collapse.Panel>
    );
    expect(screen.getByTestId('collapse-panel')).toHaveAttribute('data-force-render', 'true');
  });

  it('applies custom className', () => {
    render(
      <Collapse.Panel header="Panel" panelKey="1" className="custom-panel">
        Content
      </Collapse.Panel>
    );
    expect(screen.getByTestId('collapse-panel')).toHaveClass('custom-panel');
  });
});

describe('Collapse composition', () => {
  it('renders multiple panels', () => {
    render(
      <Collapse>
        <Collapse.Panel header="Panel 1" panelKey="1">
          Content 1
        </Collapse.Panel>
        <Collapse.Panel header="Panel 2" panelKey="2">
          Content 2
        </Collapse.Panel>
        <Collapse.Panel header="Panel 3" panelKey="3">
          Content 3
        </Collapse.Panel>
      </Collapse>
    );

    const panels = screen.getAllByTestId('collapse-panel');
    expect(panels).toHaveLength(3);
  });
});

describe('Collapse engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(
      <Collapse engine={engine}>
        <Collapse.Panel header="Panel" panelKey="1">Test</Collapse.Panel>
      </Collapse>
    );
    expect(screen.getByTestId('collapse')).toBeInTheDocument();
  });
});

describe('Collapse tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(
      <Collapse>
        <Collapse.Panel header="Panel" panelKey="1">Test</Collapse.Panel>
      </Collapse>
    );
    expect(screen.getByTestId('collapse')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
