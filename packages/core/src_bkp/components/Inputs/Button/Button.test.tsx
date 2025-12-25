import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies fullWidth style when fullWidth prop is true', () => {
    render(<Button fullWidth>Full Width Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ width: '100%' });
  });

  it('does not apply fullWidth style when fullWidth prop is false', () => {
    render(<Button fullWidth={false}>Normal Button</Button>);
    const button = screen.getByRole('button');
    expect(button).not.toHaveStyle({ width: '100%' });
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('passes through Ant Design Button props', () => {
    render(
      <Button type="primary" danger size="large">
        Primary Button
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('ant-btn-primary', 'ant-btn-dangerous', 'ant-btn-lg');
  });

  it('applies custom styles', () => {
    render(
      <Button style={{ color: 'white', padding: '10px' }}>
        Styled Button
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ color: 'rgb(255, 255, 255)' });
    expect(button).toHaveStyle({ padding: '10px' });
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders with icon', () => {
    render(
      <Button icon={<span data-testid="test-icon">🔥</span>}>
        Button with Icon
      </Button>
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});
