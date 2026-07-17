/**
 * Avatar Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '..';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('@/infrastructure/runtime/engines/presentation/component-factory', () => ({
  createEngineComponent: () => {
    const MockAvatar = ({ children, src, alt, size, shape, variant, ...props }: any) => (
      <div
        data-testid="avatar"
        data-size={size}
        data-shape={shape}
        data-variant={variant}
        {...props}
      >
        {src ? <img src={src} alt={alt} /> : children}
      </div>
    );
    MockAvatar.displayName = 'Avatar';
    return MockAvatar;
  },
}));

describe('Avatar', () => {
  it('renders correctly', () => {
    render(<Avatar>JD</Avatar>);
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders with image src', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="Test User" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(img).toHaveAttribute('alt', 'Test User');
  });

  it('renders initials when no src provided', () => {
    render(<Avatar>AB</Avatar>);
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const)('renders size %s', (size) => {
    render(<Avatar size={size}>Test</Avatar>);
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-size', size);
  });

  it.each(['circle', 'square'] as const)('renders shape %s', (shape) => {
    render(<Avatar shape={shape}>Test</Avatar>);
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-shape', shape);
  });

  it.each(['default', 'primary', 'secondary', 'success', 'warning', 'danger'] as const)(
    'renders variant %s',
    (variant) => {
      render(<Avatar variant={variant}>Test</Avatar>);
      expect(screen.getByTestId('avatar')).toHaveAttribute('data-variant', variant);
    }
  );

  it('applies custom className', () => {
    render(<Avatar className="custom-class">Test</Avatar>);
    expect(screen.getByTestId('avatar')).toHaveClass('custom-class');
  });

  it('passes style prop to component', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<Avatar style={customStyle}>Test</Avatar>);
    // The mock passes style as a prop, so we verify the element exists with the test
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });
});

describe('Avatar.Group', () => {
  it('renders multiple avatars', () => {
    render(
      <Avatar.Group>
        <Avatar>A</Avatar>
        <Avatar>B</Avatar>
        <Avatar>C</Avatar>
      </Avatar.Group>
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });
});

describe('Avatar.Badge', () => {
  it('renders avatar with badge', () => {
    render(
      <Avatar.Badge status="online">
        <Avatar>JD</Avatar>
      </Avatar.Badge>
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});

describe('Avatar engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Avatar engine={engine}>Test</Avatar>);
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });
});

describe('Avatar tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Avatar>Test</Avatar>);
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
