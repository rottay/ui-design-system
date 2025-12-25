import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders correctly with count', () => {
    render(
      <Badge count={5}>
        <span>Notifications</span>
      </Badge>
    );
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders without children (standalone)', () => {
    const { container } = render(<Badge count={10} />);
    // Badge splits numbers into individual digits for animation
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(container.querySelector('.ant-badge')).toBeInTheDocument();
  });

  it('shows dot when dot prop is true', () => {
    const { container } = render(
      <Badge dot>
        <span>Messages</span>
      </Badge>
    );
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(container.querySelector('.ant-badge-dot')).toBeInTheDocument();
  });

  it('applies color prop', () => {
    const { container } = render(
      <Badge count={5} color="red">
        <span>Alerts</span>
      </Badge>
    );
    expect(container.querySelector('.ant-badge')).toBeInTheDocument();
  });

  it('shows overflow count correctly', () => {
    render(
      <Badge count={100} overflowCount={99}>
        <span>Items</span>
      </Badge>
    );
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('renders with status', () => {
    const { container } = render(
      <Badge status="success" text="Success" />
    );
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(container.querySelector('.ant-badge-status-success')).toBeInTheDocument();
  });

  it('hides badge when showZero is false and count is 0', () => {
    const { container } = render(
      <Badge count={0} showZero={false}>
        <span>No items</span>
      </Badge>
    );
    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows badge when showZero is true and count is 0', () => {
    render(
      <Badge count={0} showZero>
        <span>Empty</span>
      </Badge>
    );
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
