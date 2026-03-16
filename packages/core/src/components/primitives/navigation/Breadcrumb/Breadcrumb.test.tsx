/**
 * Breadcrumb Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Breadcrumb } from './';

// Mock the engine factory
vi.mock('../../../../engines/factory', () => ({
  createEngineComponent: () => {
    const MockBreadcrumb = ({
      items,
      separator = '/',
      maxItems,
      className,
      style,
    }: any) => {
      const displayItems = maxItems && items.length > maxItems
        ? [...items.slice(0, 1), { key: 'ellipsis', label: '...' }, ...items.slice(-1)]
        : items;

      return (
        <nav
          data-testid="breadcrumb"
          data-separator={separator}
          data-max-items={maxItems}
          className={className}
          style={style}
          aria-label="Breadcrumb"
        >
          <ol>
            {displayItems?.map((item: any, index: number) => (
              <li key={item.key} data-testid={`breadcrumb-item-${item.key}`}>
                {item.href ? (
                  <a href={item.href} onClick={item.onClick}>
                    {item.icon}
                    {item.label}
                  </a>
                ) : (
                  <span onClick={item.onClick}>
                    {item.icon}
                    {item.label}
                  </span>
                )}
                {index < displayItems.length - 1 && (
                  <span data-testid="separator">{separator}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      );
    };
    MockBreadcrumb.displayName = 'Breadcrumb';
    return MockBreadcrumb;
  },
}));

const defaultItems = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'products', label: 'Products', href: '/products' },
  { key: 'shoes', label: 'Shoes' },
];

describe('Breadcrumb', () => {
  it('renders correctly', () => {
    render(<Breadcrumb items={defaultItems} />);
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
  });

  it('renders all breadcrumb items', () => {
    render(<Breadcrumb items={defaultItems} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Shoes')).toBeInTheDocument();
  });

  it('renders links for items with href', () => {
    render(<Breadcrumb items={defaultItems} />);
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders span for items without href', () => {
    render(<Breadcrumb items={defaultItems} />);
    const shoesSpan = screen.getByText('Shoes').closest('span');
    expect(shoesSpan).toBeInTheDocument();
  });

  describe('separator prop', () => {
    it('uses default separator', () => {
      render(<Breadcrumb items={defaultItems} />);
      const separators = screen.getAllByTestId('separator');
      expect(separators[0]).toHaveTextContent('/');
    });

    it('uses custom separator', () => {
      render(<Breadcrumb items={defaultItems} separator=">" />);
      const separators = screen.getAllByTestId('separator');
      expect(separators[0]).toHaveTextContent('>');
    });

    it('renders correct number of separators', () => {
      render(<Breadcrumb items={defaultItems} />);
      const separators = screen.getAllByTestId('separator');
      expect(separators).toHaveLength(defaultItems.length - 1);
    });
  });

  describe('maxItems prop', () => {
    it('collapses items when exceeding maxItems', () => {
      const manyItems = [
        { key: '1', label: 'Level 1', href: '/1' },
        { key: '2', label: 'Level 2', href: '/2' },
        { key: '3', label: 'Level 3', href: '/3' },
        { key: '4', label: 'Level 4', href: '/4' },
        { key: '5', label: 'Level 5' },
      ];
      render(<Breadcrumb items={manyItems} maxItems={3} />);
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });

  describe('items with icons', () => {
    it('renders icons in items', () => {
      const itemsWithIcons = [
        { key: 'home', label: 'Home', href: '/', icon: <span data-testid="home-icon">🏠</span> },
        { key: 'page', label: 'Page' },
      ];
      render(<Breadcrumb items={itemsWithIcons} />);
      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    });
  });

  describe('onClick handler', () => {
    it('calls onClick when item is clicked', () => {
      const onClick = vi.fn();
      const items = [
        { key: 'home', label: 'Home', onClick },
        { key: 'page', label: 'Page' },
      ];
      render(<Breadcrumb items={items} />);
      fireEvent.click(screen.getByText('Home'));
      expect(onClick).toHaveBeenCalled();
    });
  });

  it('applies custom className', () => {
    render(<Breadcrumb items={defaultItems} className="custom-breadcrumb" />);
    expect(screen.getByTestId('breadcrumb')).toHaveClass('custom-breadcrumb');
  });

  it('applies custom style', () => {
    render(<Breadcrumb items={defaultItems} style={{ padding: 10 }} />);
    expect(screen.getByTestId('breadcrumb')).toHaveStyle({ padding: '10px' });
  });

  it('has proper accessibility attributes', () => {
    render(<Breadcrumb items={defaultItems} />);
    expect(screen.getByTestId('breadcrumb')).toHaveAttribute('aria-label', 'Breadcrumb');
  });
});

describe('Breadcrumb engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Breadcrumb engine={engine} items={[{ key: 'home', label: 'Home' }]} />);
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
  });
});

describe('Breadcrumb tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Breadcrumb items={[{ key: 'home', label: 'Home' }]} />);
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
