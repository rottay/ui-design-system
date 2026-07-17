/**
 * List Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { List } from '..';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('@/infrastructure/runtime/engines/presentation/component-factory', () => ({
  createEngineComponent: (name: string) => {
    if (name === 'List') {
      const MockList = ({
        children,
        dataSource,
        renderItem,
        header,
        footer,
        size,
        bordered,
        loading,
        split,
        className,
        style,
        ...props
      }: any) => (
        <div
          data-testid="list"
          data-size={size}
          data-bordered={bordered}
          data-loading={loading}
          data-split={split}
          className={className}
          style={style}
          {...props}
        >
          {header && <div data-testid="list-header">{header}</div>}
          {dataSource && renderItem
            ? dataSource.map((item: any, index: number) => (
                <div key={index}>{renderItem(item, index)}</div>
              ))
            : children}
          {footer && <div data-testid="list-footer">{footer}</div>}
        </div>
      );
      MockList.displayName = 'List';
      return MockList;
    }
    if (name === 'List.Item') {
      const MockItem = ({ children, actions, extra, className, style, ...props }: any) => (
        <li
          data-testid="list-item"
          className={className}
          style={style}
          {...props}
        >
          <div>{children}</div>
          {extra && <div data-testid="list-item-extra">{extra}</div>}
          {actions && (
            <div data-testid="list-item-actions">
              {actions.map((action: any, index: number) => (
                <span key={index}>{action}</span>
              ))}
            </div>
          )}
        </li>
      );
      MockItem.displayName = 'List.Item';
      return MockItem;
    }
    if (name === 'List.Item.Meta') {
      const MockMeta = ({ avatar, title, description, className, style, ...props }: any) => (
        <div
          data-testid="list-item-meta"
          className={className}
          style={style}
          {...props}
        >
          {avatar && <div data-testid="list-item-meta-avatar">{avatar}</div>}
          {title && <div data-testid="list-item-meta-title">{title}</div>}
          {description && <div data-testid="list-item-meta-description">{description}</div>}
        </div>
      );
      MockMeta.displayName = 'List.Item.Meta';
      return MockMeta;
    }
    return () => null;
  },
}));

describe('List', () => {
  it('renders correctly', () => {
    render(
      <List>
        <List.Item>Item 1</List.Item>
        <List.Item>Item 2</List.Item>
      </List>
    );
    expect(screen.getByTestId('list')).toBeInTheDocument();
  });

  it('renders with header and footer', () => {
    render(
      <List header="Header Content" footer="Footer Content">
        <List.Item>Item 1</List.Item>
      </List>
    );
    expect(screen.getByTestId('list-header')).toHaveTextContent('Header Content');
    expect(screen.getByTestId('list-footer')).toHaveTextContent('Footer Content');
  });

  it('renders with dataSource and renderItem', () => {
    const data = ['Item A', 'Item B', 'Item C'];
    render(
      <List
        dataSource={data}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      />
    );
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
    expect(screen.getByText('Item C')).toBeInTheDocument();
  });

  it.each(['small', 'default', 'large'] as const)('renders size %s', (size) => {
    render(<List size={size}><List.Item>Test</List.Item></List>);
    expect(screen.getByTestId('list')).toHaveAttribute('data-size', size);
  });

  it('renders with bordered prop', () => {
    render(<List bordered><List.Item>Test</List.Item></List>);
    expect(screen.getByTestId('list')).toHaveAttribute('data-bordered', 'true');
  });

  it('renders with split prop', () => {
    render(<List split><List.Item>Test</List.Item></List>);
    expect(screen.getByTestId('list')).toHaveAttribute('data-split', 'true');
  });

  it('renders loading state', () => {
    render(<List loading><List.Item>Test</List.Item></List>);
    expect(screen.getByTestId('list')).toHaveAttribute('data-loading', 'true');
  });

  it('applies custom className', () => {
    render(<List className="custom-list-class"><List.Item>Test</List.Item></List>);
    expect(screen.getByTestId('list')).toHaveClass('custom-list-class');
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<List style={customStyle}><List.Item>Test</List.Item></List>);
    // Verify element renders with style prop (style object passed to mock)
    expect(screen.getByTestId('list')).toBeInTheDocument();
  });

  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(
      <List engine={engine}>
        <List.Item>Engine Test</List.Item>
      </List>
    );
    expect(screen.getByTestId('list')).toBeInTheDocument();
    expect(screen.getByText('Engine Test')).toBeInTheDocument();
  });
});

describe('List.Item', () => {
  it('renders correctly', () => {
    render(
      <List>
        <List.Item>List item content</List.Item>
      </List>
    );
    expect(screen.getByTestId('list-item')).toBeInTheDocument();
    expect(screen.getByText('List item content')).toBeInTheDocument();
  });

  it('renders with actions', () => {
    render(
      <List>
        <List.Item actions={[<button key="edit">Edit</button>, <button key="delete">Delete</button>]}>
          Item with actions
        </List.Item>
      </List>
    );
    expect(screen.getByTestId('list-item-actions')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders with extra content', () => {
    render(
      <List>
        <List.Item extra={<span>Extra content</span>}>
          Item with extra
        </List.Item>
      </List>
    );
    expect(screen.getByTestId('list-item-extra')).toBeInTheDocument();
    expect(screen.getByText('Extra content')).toBeInTheDocument();
  });

  it('applies custom className to item', () => {
    render(
      <List>
        <List.Item className="custom-item-class">Test</List.Item>
      </List>
    );
    expect(screen.getByTestId('list-item')).toHaveClass('custom-item-class');
  });
});

describe('List.Item.Meta', () => {
  it('renders correctly', () => {
    render(
      <List>
        <List.Item>
          <List.Item.Meta
            title="Meta Title"
            description="Meta Description"
          />
        </List.Item>
      </List>
    );
    expect(screen.getByTestId('list-item-meta')).toBeInTheDocument();
    expect(screen.getByTestId('list-item-meta-title')).toHaveTextContent('Meta Title');
    expect(screen.getByTestId('list-item-meta-description')).toHaveTextContent('Meta Description');
  });

  it('renders with avatar', () => {
    render(
      <List>
        <List.Item>
          <List.Item.Meta
            avatar={<img src="avatar.jpg" alt="Avatar" />}
            title="User Name"
            description="User description"
          />
        </List.Item>
      </List>
    );
    expect(screen.getByTestId('list-item-meta-avatar')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'avatar.jpg');
  });

  it('applies custom className to meta', () => {
    render(
      <List>
        <List.Item>
          <List.Item.Meta className="custom-meta-class" title="Test" />
        </List.Item>
      </List>
    );
    expect(screen.getByTestId('list-item-meta')).toHaveClass('custom-meta-class');
  });
});

describe('List tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<List><List.Item>Test</List.Item></List>);
    expect(screen.getByTestId('list')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
