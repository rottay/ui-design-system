/**
 * @file Descriptions Tests
 * @description Unit tests for the Descriptions component.
 * Colocated with component following approved architecture.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Descriptions } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../core/engines/factory', () => ({
  createEngineComponent: (name: string) => {
    if (name === 'Descriptions') {
      const MockDescriptions = ({
        children,
        title,
        bordered,
        column,
        layout,
        size,
        colon,
        extra,
        className,
        ...props
      }: any) => (
        <div
          data-testid="descriptions"
          data-bordered={bordered}
          data-column={column}
          data-layout={layout}
          data-size={size}
          data-colon={colon}
          className={className}
          {...props}
        >
          {title && <div data-testid="descriptions-title">{title}</div>}
          {extra && <div data-testid="descriptions-extra">{extra}</div>}
          <div data-testid="descriptions-content">{children}</div>
        </div>
      );
      MockDescriptions.displayName = 'Descriptions';
      return MockDescriptions;
    }

    // Descriptions.Item mock
    const MockItem = ({ children, label, span, ...props }: any) => (
      <div
        data-testid="descriptions-item"
        data-label={typeof label === 'string' ? label : undefined}
        data-span={span}
        {...props}
      >
        <span data-testid="item-label">{label}</span>
        <span data-testid="item-content">{children}</span>
      </div>
    );
    MockItem.displayName = 'Descriptions.Item';
    return MockItem;
  },
}));

describe('Descriptions', () => {
  it('renders correctly with basic props', () => {
    render(
      <Descriptions title="Test Title">
        <Descriptions.Item label="Name">John</Descriptions.Item>
      </Descriptions>
    );

    expect(screen.getByTestId('descriptions')).toBeInTheDocument();
    expect(screen.getByTestId('descriptions-title')).toHaveTextContent('Test Title');
  });

  it('renders title when provided', () => {
    render(
      <Descriptions title="User Information">
        <Descriptions.Item label="Name">John</Descriptions.Item>
      </Descriptions>
    );

    expect(screen.getByTestId('descriptions-title')).toHaveTextContent('User Information');
  });

  it('renders extra content when provided', () => {
    render(
      <Descriptions title="Settings" extra={<button>Edit</button>}>
        <Descriptions.Item label="Name">John</Descriptions.Item>
      </Descriptions>
    );

    expect(screen.getByTestId('descriptions-extra')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('passes bordered prop correctly', () => {
    render(
      <Descriptions bordered>
        <Descriptions.Item label="Name">John</Descriptions.Item>
      </Descriptions>
    );

    expect(screen.getByTestId('descriptions')).toHaveAttribute('data-bordered', 'true');
  });

  it('passes column prop correctly', () => {
    render(
      <Descriptions column={2}>
        <Descriptions.Item label="Name">John</Descriptions.Item>
      </Descriptions>
    );

    expect(screen.getByTestId('descriptions')).toHaveAttribute('data-column', '2');
  });

  it('passes layout prop correctly', () => {
    render(
      <Descriptions layout="vertical">
        <Descriptions.Item label="Name">John</Descriptions.Item>
      </Descriptions>
    );

    expect(screen.getByTestId('descriptions')).toHaveAttribute('data-layout', 'vertical');
  });

  it('passes size prop correctly', () => {
    render(
      <Descriptions size="small">
        <Descriptions.Item label="Name">John</Descriptions.Item>
      </Descriptions>
    );

    expect(screen.getByTestId('descriptions')).toHaveAttribute('data-size', 'small');
  });

  it('passes colon prop correctly', () => {
    render(
      <Descriptions colon={false}>
        <Descriptions.Item label="Name">John</Descriptions.Item>
      </Descriptions>
    );

    expect(screen.getByTestId('descriptions')).toHaveAttribute('data-colon', 'false');
  });

  it('applies custom className', () => {
    render(
      <Descriptions className="custom-class">
        <Descriptions.Item label="Name">John</Descriptions.Item>
      </Descriptions>
    );

    expect(screen.getByTestId('descriptions')).toHaveClass('custom-class');
  });

  it('renders multiple items', () => {
    render(
      <Descriptions title="Profile">
        <Descriptions.Item label="Name">John</Descriptions.Item>
        <Descriptions.Item label="Email">john@example.com</Descriptions.Item>
        <Descriptions.Item label="Phone">123-456-7890</Descriptions.Item>
      </Descriptions>
    );

    const items = screen.getAllByTestId('descriptions-item');
    expect(items).toHaveLength(3);
  });
});

describe('Descriptions.Item', () => {
  it('renders label and content', () => {
    render(
      <Descriptions>
        <Descriptions.Item label="Username">johndoe</Descriptions.Item>
      </Descriptions>
    );

    expect(screen.getByTestId('item-label')).toHaveTextContent('Username');
    expect(screen.getByTestId('item-content')).toHaveTextContent('johndoe');
  });

  it('passes span prop correctly', () => {
    render(
      <Descriptions>
        <Descriptions.Item label="Address" span={2}>
          123 Main St
        </Descriptions.Item>
      </Descriptions>
    );

    expect(screen.getByTestId('descriptions-item')).toHaveAttribute('data-span', '2');
  });

  it('renders with ReactNode label', () => {
    render(
      <Descriptions>
        <Descriptions.Item label={<strong>Bold Label</strong>}>Value</Descriptions.Item>
      </Descriptions>
    );

    expect(screen.getByTestId('item-label')).toContainHTML('<strong>Bold Label</strong>');
  });

  it('renders with ReactNode content', () => {
    render(
      <Descriptions>
        <Descriptions.Item label="Status">
          <span style={{ color: 'green' }}>Active</span>
        </Descriptions.Item>
      </Descriptions>
    );

    expect(screen.getByTestId('item-content')).toContainHTML('Active');
  });
});

describe('Descriptions layout variations', () => {
  it.each(['horizontal', 'vertical'] as const)(
    'supports %s layout',
    (layout) => {
      render(
        <Descriptions layout={layout}>
          <Descriptions.Item label="Name">John</Descriptions.Item>
        </Descriptions>
      );

      expect(screen.getByTestId('descriptions')).toHaveAttribute('data-layout', layout);
    }
  );
});

describe('Descriptions size variations', () => {
  it.each(['default', 'small', 'middle'] as const)(
    'supports %s size',
    (size) => {
      render(
        <Descriptions size={size}>
          <Descriptions.Item label="Name">John</Descriptions.Item>
        </Descriptions>
      );

      expect(screen.getByTestId('descriptions')).toHaveAttribute('data-size', size);
    }
  );
});

describe('Descriptions with different column counts', () => {
  it.each([1, 2, 3, 4, 5])('supports %d columns', (column) => {
    render(
      <Descriptions column={column}>
        <Descriptions.Item label="Name">John</Descriptions.Item>
      </Descriptions>
    );

    expect(screen.getByTestId('descriptions')).toHaveAttribute(
      'data-column',
      String(column)
    );
  });
});

describe('Descriptions accessibility', () => {
  it('renders with accessible structure', () => {
    render(
      <Descriptions title="User Info">
        <Descriptions.Item label="Name">John Doe</Descriptions.Item>
        <Descriptions.Item label="Email">john@example.com</Descriptions.Item>
      </Descriptions>
    );

    // Verify basic structure exists
    expect(screen.getByTestId('descriptions')).toBeInTheDocument();
    expect(screen.getByTestId('descriptions-content')).toBeInTheDocument();
  });
});

describe('Descriptions engines', () => {
  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(
      <Descriptions engine={engine}>
        <Descriptions.Item label="Name">John</Descriptions.Item>
      </Descriptions>
    );
    expect(screen.getByTestId('descriptions')).toBeInTheDocument();
  });
});

describe('Descriptions tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(
      <Descriptions>
        <Descriptions.Item label="Name">John</Descriptions.Item>
      </Descriptions>
    );
    expect(screen.getByTestId('descriptions')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
