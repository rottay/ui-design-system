import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders correctly', () => {
    const { container } = render(<Avatar />);
    const avatar = container.querySelector('.ant-avatar');
    expect(avatar).toBeInTheDocument();
  });

  it('renders with src prop', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User Avatar" />);
    const avatar = screen.getByRole('img', { hidden: true });
    expect(avatar).toBeInTheDocument();
  });

  it('renders with text', () => {
    render(<Avatar>JD</Avatar>);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('applies size prop', () => {
    const { container } = render(<Avatar size={64}>JD</Avatar>);
    const avatar = container.querySelector('.ant-avatar');
    expect(avatar).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(<Avatar icon={<span data-testid="user-icon">👤</span>} />);
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  it('applies shape prop', () => {
    const { container: circleContainer } = render(<Avatar shape="circle">C</Avatar>);
    const circleAvatar = circleContainer.querySelector('.ant-avatar-circle');
    expect(circleAvatar).toBeInTheDocument();

    const { container: squareContainer } = render(<Avatar shape="square">S</Avatar>);
    const squareAvatar = squareContainer.querySelector('.ant-avatar-square');
    expect(squareAvatar).toBeInTheDocument();
  });

  it('renders Avatar.Group', () => {
    const { container } = render(
      <Avatar.Group>
        <Avatar>A</Avatar>
        <Avatar>B</Avatar>
        <Avatar>C</Avatar>
      </Avatar.Group>
    );
    const group = container.querySelector('.ant-avatar-group');
    expect(group).toBeInTheDocument();
  });
});
