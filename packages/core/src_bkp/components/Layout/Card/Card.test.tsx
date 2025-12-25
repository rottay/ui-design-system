import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders correctly with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(
      <Card title="Card Title">
        <p>Content</p>
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with bordered prop', () => {
    const { container } = render(
      <Card bordered={true}>Bordered Card</Card>
    );
    const card = container.querySelector('.ant-card-bordered');
    expect(card).toBeInTheDocument();
  });

  it('renders without border when bordered is false', () => {
    const { container } = render(
      <Card bordered={false}>Borderless Card</Card>
    );
    const card = container.querySelector('.ant-card-bordered');
    expect(card).not.toBeInTheDocument();
  });

  it('applies size prop', () => {
    const { container: smallContainer } = render(
      <Card size="small">Small Card</Card>
    );
    expect(smallContainer.querySelector('.ant-card-small')).toBeInTheDocument();

    const { container: defaultContainer } = render(
      <Card size="default">Default Card</Card>
    );
    expect(defaultContainer.querySelector('.ant-card')).toBeInTheDocument();
  });

  it('renders Card.Meta', () => {
    render(
      <Card>
        <Card.Meta
          title="Meta Title"
          description="Meta description"
        />
      </Card>
    );
    expect(screen.getByText('Meta Title')).toBeInTheDocument();
    expect(screen.getByText('Meta description')).toBeInTheDocument();
  });

  it('renders Card.Grid', () => {
    const { container } = render(
      <Card>
        <Card.Grid>Grid Item 1</Card.Grid>
        <Card.Grid>Grid Item 2</Card.Grid>
      </Card>
    );
    expect(screen.getByText('Grid Item 1')).toBeInTheDocument();
    expect(screen.getByText('Grid Item 2')).toBeInTheDocument();
    const grids = container.querySelectorAll('.ant-card-grid');
    expect(grids).toHaveLength(2);
  });

  it('renders with extra actions', () => {
    render(
      <Card
        title="Card with Actions"
        extra={<button>More</button>}
      >
        Content
      </Card>
    );
    expect(screen.getByText('Card with Actions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument();
  });

  it('renders with actions', () => {
    render(
      <Card
        actions={[
          <button key="action1">Action 1</button>,
          <button key="action2">Action 2</button>,
        ]}
      >
        Content
      </Card>
    );
    expect(screen.getByRole('button', { name: 'Action 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action 2' })).toBeInTheDocument();
  });
});
