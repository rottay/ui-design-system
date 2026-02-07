/**
 * Layout Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Layout } from '../';

// Mock the engine factory
vi.mock('../../../../../core/engines/factory', () => ({
  createEngineComponent: (name: string) => {
    if (name === 'Layout') {
      const MockLayout = ({ children, hasSider, className, style }: any) => (
        <div
          data-testid="layout"
          data-has-sider={hasSider}
          className={className}
          style={style}
        >
          {children}
        </div>
      );
      MockLayout.displayName = 'Layout';
      return MockLayout;
    }
    if (name === 'Layout.Header') {
      const MockHeader = ({ children, height, className, style }: any) => (
        <header
          data-testid="layout-header"
          data-height={height}
          className={className}
          style={style}
        >
          {children}
        </header>
      );
      MockHeader.displayName = 'Layout.Header';
      return MockHeader;
    }
    if (name === 'Layout.Sider') {
      const MockSider = ({
        children,
        width,
        collapsedWidth,
        collapsed,
        collapsible,
        onCollapse,
        theme,
        className,
        style,
      }: any) => (
        <aside
          data-testid="layout-sider"
          data-width={width}
          data-collapsed-width={collapsedWidth}
          data-collapsed={collapsed}
          data-collapsible={collapsible}
          data-theme={theme}
          className={className}
          style={style}
          onClick={() => collapsible && onCollapse?.(!collapsed)}
        >
          {children}
        </aside>
      );
      MockSider.displayName = 'Layout.Sider';
      return MockSider;
    }
    if (name === 'Layout.Content') {
      const MockContent = ({ children, className, style }: any) => (
        <main data-testid="layout-content" className={className} style={style}>
          {children}
        </main>
      );
      MockContent.displayName = 'Layout.Content';
      return MockContent;
    }
    if (name === 'Layout.Footer') {
      const MockFooter = ({ children, className, style }: any) => (
        <footer data-testid="layout-footer" className={className} style={style}>
          {children}
        </footer>
      );
      MockFooter.displayName = 'Layout.Footer';
      return MockFooter;
    }
    return () => null;
  },
}));

describe('Layout', () => {
  it('renders correctly', () => {
    render(<Layout>Content</Layout>);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with hasSider prop', () => {
    render(<Layout hasSider>Content</Layout>);
    expect(screen.getByTestId('layout')).toHaveAttribute('data-has-sider', 'true');
  });

  it('applies custom className', () => {
    render(<Layout className="custom-layout">Content</Layout>);
    expect(screen.getByTestId('layout')).toHaveClass('custom-layout');
  });

  it('applies custom style', () => {
    render(<Layout style={{ minHeight: '100vh' }}>Content</Layout>);
    expect(screen.getByTestId('layout')).toHaveStyle({ minHeight: '100vh' });
  });
});

describe('Layout.Header', () => {
  it('renders correctly', () => {
    render(<Layout.Header>Header Content</Layout.Header>);
    expect(screen.getByTestId('layout-header')).toBeInTheDocument();
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    render(<Layout.Header height={80}>Header</Layout.Header>);
    expect(screen.getByTestId('layout-header')).toHaveAttribute('data-height', '80');
  });

  it('applies custom className', () => {
    render(<Layout.Header className="custom-header">Header</Layout.Header>);
    expect(screen.getByTestId('layout-header')).toHaveClass('custom-header');
  });
});

describe('Layout.Sider', () => {
  it('renders correctly', () => {
    render(<Layout.Sider>Sider Content</Layout.Sider>);
    expect(screen.getByTestId('layout-sider')).toBeInTheDocument();
    expect(screen.getByText('Sider Content')).toBeInTheDocument();
  });

  it('renders with custom width', () => {
    render(<Layout.Sider width={250}>Sider</Layout.Sider>);
    expect(screen.getByTestId('layout-sider')).toHaveAttribute('data-width', '250');
  });

  it('renders with collapsed state', () => {
    render(<Layout.Sider collapsed>Sider</Layout.Sider>);
    expect(screen.getByTestId('layout-sider')).toHaveAttribute('data-collapsed', 'true');
  });

  it('renders with collapsedWidth', () => {
    render(<Layout.Sider collapsedWidth={60}>Sider</Layout.Sider>);
    expect(screen.getByTestId('layout-sider')).toHaveAttribute('data-collapsed-width', '60');
  });

  it('renders with theme', () => {
    render(<Layout.Sider theme="dark">Sider</Layout.Sider>);
    expect(screen.getByTestId('layout-sider')).toHaveAttribute('data-theme', 'dark');
  });

  it('handles collapse callback', () => {
    const onCollapse = vi.fn();
    render(
      <Layout.Sider collapsible collapsed={false} onCollapse={onCollapse}>
        Sider
      </Layout.Sider>
    );
    fireEvent.click(screen.getByTestId('layout-sider'));
    expect(onCollapse).toHaveBeenCalledWith(true);
  });
});

describe('Layout.Content', () => {
  it('renders correctly', () => {
    render(<Layout.Content>Main Content</Layout.Content>);
    expect(screen.getByTestId('layout-content')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Layout.Content className="custom-content">Content</Layout.Content>);
    expect(screen.getByTestId('layout-content')).toHaveClass('custom-content');
  });
});

describe('Layout.Footer', () => {
  it('renders correctly', () => {
    render(<Layout.Footer>Footer Content</Layout.Footer>);
    expect(screen.getByTestId('layout-footer')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Layout.Footer className="custom-footer">Footer</Layout.Footer>);
    expect(screen.getByTestId('layout-footer')).toHaveClass('custom-footer');
  });
});

describe('Layout composition', () => {
  it('renders full layout structure', () => {
    render(
      <Layout hasSider>
        <Layout.Header>Header</Layout.Header>
        <Layout>
          <Layout.Sider width={200}>Sider</Layout.Sider>
          <Layout.Content>Content</Layout.Content>
        </Layout>
        <Layout.Footer>Footer</Layout.Footer>
      </Layout>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Sider')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});

describe('Layout engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Layout engine={engine}>Test</Layout>);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });
});

describe('Layout tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Layout>Test</Layout>);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
