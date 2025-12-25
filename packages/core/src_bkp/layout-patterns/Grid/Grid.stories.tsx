import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from './Grid';
import { Card } from 'antd';

const meta = {
  title: 'Layout Patterns/Grid',
  component: Grid,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'number',
      description: 'Number of columns (can be number, object, or string template)',
    },
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Gap between grid items',
    },
    minChildWidth: {
      control: 'text',
      description: 'Minimum width for auto-fit columns',
    },
    autoFlow: {
      control: 'select',
      options: ['row', 'column', 'dense', 'row dense', 'column dense'],
      description: 'Grid auto flow',
    },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

const GridItem = ({
  children,
  color = '#1890ff',
  style
}: {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      backgroundColor: color,
      color: 'white',
      padding: '2rem',
      borderRadius: '8px',
      textAlign: 'center',
      fontWeight: 600,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Default: Story = {
  args: {
    columns: 3,
    gap: 'md',
    children: (
      <>
        <GridItem>1</GridItem>
        <GridItem>2</GridItem>
        <GridItem>3</GridItem>
        <GridItem>4</GridItem>
        <GridItem>5</GridItem>
        <GridItem>6</GridItem>
      </>
    ),
  },
};

export const ResponsiveColumns: Story = {
  args: {
    columns: { mobile: 1, tablet: 2, desktop: 3 },
    gap: 'md',
    children: (
      <>
        <Card>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Feature 1</h3>
          <p style={{ margin: 0, color: '#666' }}>
            Responsive grid that adapts to screen size
          </p>
        </Card>
        <Card>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Feature 2</h3>
          <p style={{ margin: 0, color: '#666' }}>
            1 column on mobile, 2 on tablet, 3 on desktop
          </p>
        </Card>
        <Card>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Feature 3</h3>
          <p style={{ margin: 0, color: '#666' }}>
            Automatically adjusts layout based on viewport
          </p>
        </Card>
        <Card>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Feature 4</h3>
          <p style={{ margin: 0, color: '#666' }}>
            Built-in responsive breakpoints
          </p>
        </Card>
        <Card>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Feature 5</h3>
          <p style={{ margin: 0, color: '#666' }}>
            No media queries needed
          </p>
        </Card>
        <Card>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Feature 6</h3>
          <p style={{ margin: 0, color: '#666' }}>
            Clean and declarative API
          </p>
        </Card>
      </>
    ),
  },
};

export const AutoFit: Story = {
  args: {
    minChildWidth: '200px',
    gap: 'md',
    children: (
      <>
        <GridItem color="#1890ff">Auto 1</GridItem>
        <GridItem color="#1890ff">Auto 2</GridItem>
        <GridItem color="#1890ff">Auto 3</GridItem>
        <GridItem color="#1890ff">Auto 4</GridItem>
        <GridItem color="#1890ff">Auto 5</GridItem>
        <GridItem color="#1890ff">Auto 6</GridItem>
        <GridItem color="#1890ff">Auto 7</GridItem>
        <GridItem color="#1890ff">Auto 8</GridItem>
      </>
    ),
  },
};

export const DifferentGaps: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div>
        <h3 style={{ marginTop: 0 }}>Gap: xs (4px)</h3>
        <Grid columns={4} gap="xs">
          <GridItem color="#f0f0f0" style={{ color: '#333' }}>1</GridItem>
          <GridItem color="#f0f0f0" style={{ color: '#333' }}>2</GridItem>
          <GridItem color="#f0f0f0" style={{ color: '#333' }}>3</GridItem>
          <GridItem color="#f0f0f0" style={{ color: '#333' }}>4</GridItem>
        </Grid>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: sm (8px)</h3>
        <Grid columns={4} gap="sm">
          <GridItem color="#e6f7ff" style={{ color: '#333' }}>1</GridItem>
          <GridItem color="#e6f7ff" style={{ color: '#333' }}>2</GridItem>
          <GridItem color="#e6f7ff" style={{ color: '#333' }}>3</GridItem>
          <GridItem color="#e6f7ff" style={{ color: '#333' }}>4</GridItem>
        </Grid>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: md (16px)</h3>
        <Grid columns={4} gap="md">
          <GridItem color="#f6ffed" style={{ color: '#333' }}>1</GridItem>
          <GridItem color="#f6ffed" style={{ color: '#333' }}>2</GridItem>
          <GridItem color="#f6ffed" style={{ color: '#333' }}>3</GridItem>
          <GridItem color="#f6ffed" style={{ color: '#333' }}>4</GridItem>
        </Grid>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: lg (24px)</h3>
        <Grid columns={4} gap="lg">
          <GridItem color="#fff7e6" style={{ color: '#333' }}>1</GridItem>
          <GridItem color="#fff7e6" style={{ color: '#333' }}>2</GridItem>
          <GridItem color="#fff7e6" style={{ color: '#333' }}>3</GridItem>
          <GridItem color="#fff7e6" style={{ color: '#333' }}>4</GridItem>
        </Grid>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: xl (32px)</h3>
        <Grid columns={3} gap="xl">
          <GridItem color="#fff0f6" style={{ color: '#333' }}>1</GridItem>
          <GridItem color="#fff0f6" style={{ color: '#333' }}>2</GridItem>
          <GridItem color="#fff0f6" style={{ color: '#333' }}>3</GridItem>
        </Grid>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: 2xl (48px)</h3>
        <Grid columns={2} gap="2xl">
          <GridItem color="#f9f0ff" style={{ color: '#333' }}>1</GridItem>
          <GridItem color="#f9f0ff" style={{ color: '#333' }}>2</GridItem>
        </Grid>
      </div>
    </div>
  ),
};

export const CustomColumns: Story = {
  args: {
    columns: '1fr 2fr 1fr',
    gap: 'md',
    children: (
      <>
        <GridItem color="#1890ff">1fr</GridItem>
        <GridItem color="#52c41a">2fr (wider)</GridItem>
        <GridItem color="#1890ff">1fr</GridItem>
      </>
    ),
  },
};

export const Dashboard: Story = {
  render: () => (
    <Grid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap="lg">
      <div style={{ gridColumn: { mobile: 'span 1', desktop: 'span 2' } as any }}>
        <Card style={{ height: '100%' }}>
          <h3 style={{ margin: 0, marginBottom: '1rem' }}>Revenue</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>$45,231</div>
          <p style={{ margin: 0, marginTop: '0.5rem', color: '#666' }}>+20.1% from last month</p>
        </Card>
      </div>
      <Card>
        <h3 style={{ margin: 0, marginBottom: '1rem' }}>Users</h3>
        <div style={{ fontSize: '32px', fontWeight: 'bold' }}>2,350</div>
        <p style={{ margin: 0, marginTop: '0.5rem', color: '#666' }}>+180 today</p>
      </Card>
      <Card>
        <h3 style={{ margin: 0, marginBottom: '1rem' }}>Orders</h3>
        <div style={{ fontSize: '32px', fontWeight: 'bold' }}>1,234</div>
        <p style={{ margin: 0, marginTop: '0.5rem', color: '#666' }}>+15% this week</p>
      </Card>
      <div style={{ gridColumn: { mobile: 'span 1', desktop: 'span 3' } as any }}>
        <Card style={{ height: '100%' }}>
          <h3 style={{ margin: 0, marginBottom: '1rem' }}>Recent Activity</h3>
          <div style={{ height: '200px', backgroundColor: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            Chart placeholder
          </div>
        </Card>
      </div>
      <Card>
        <h3 style={{ margin: 0, marginBottom: '1rem' }}>Conversion</h3>
        <div style={{ fontSize: '32px', fontWeight: 'bold' }}>3.2%</div>
        <p style={{ margin: 0, marginTop: '0.5rem', color: '#666' }}>+0.5% this week</p>
      </Card>
    </Grid>
  ),
};
