import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';

const meta = {
  title: 'Layout Patterns/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Divider orientation',
    },
    variant: {
      control: 'select',
      options: ['solid', 'dashed', 'dotted'],
      description: 'Border style',
    },
    spacing: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Margin spacing around divider',
    },
    label: {
      control: 'text',
      description: 'Optional text label',
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div>
      <p style={{ margin: 0 }}>
        This is some content above the divider. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </p>
      <Divider />
      <p style={{ margin: 0 }}>
        This is some content below the divider. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', minHeight: '60px' }}>
      <span>Item 1</span>
      <Divider orientation="vertical" />
      <span>Item 2</span>
      <Divider orientation="vertical" />
      <span>Item 3</span>
      <Divider orientation="vertical" />
      <span>Item 4</span>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div>
      <h3 style={{ marginTop: 0 }}>Section 1</h3>
      <p style={{ margin: 0 }}>Content for the first section goes here.</p>

      <Divider label="Section 2" />

      <p style={{ margin: 0, marginBottom: '1rem' }}>Content for the second section goes here.</p>

      <Divider label="Section 3" />

      <p style={{ margin: 0 }}>Content for the third section goes here.</p>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div>
      <div>
        <h3 style={{ marginTop: 0 }}>Solid (default)</h3>
        <p style={{ margin: 0 }}>This is the default solid line divider.</p>
        <Divider variant="solid" />
        <p style={{ margin: 0 }}>Content below the solid divider.</p>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ marginTop: 0 }}>Dashed</h3>
        <p style={{ margin: 0 }}>This uses a dashed border style.</p>
        <Divider variant="dashed" />
        <p style={{ margin: 0 }}>Content below the dashed divider.</p>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ marginTop: 0 }}>Dotted</h3>
        <p style={{ margin: 0 }}>This uses a dotted border style.</p>
        <Divider variant="dotted" />
        <p style={{ margin: 0 }}>Content below the dotted divider.</p>
      </div>
    </div>
  ),
};

export const DifferentSpacing: Story = {
  render: () => (
    <div>
      <div>
        <h3 style={{ marginTop: 0 }}>Spacing: sm (8px)</h3>
        <p style={{ margin: 0 }}>Small spacing above and below.</p>
        <Divider spacing="sm" />
        <p style={{ margin: 0 }}>Content continues here.</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Spacing: md (16px - default)</h3>
        <p style={{ margin: 0 }}>Medium spacing above and below.</p>
        <Divider spacing="md" />
        <p style={{ margin: 0 }}>Content continues here.</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Spacing: lg (24px)</h3>
        <p style={{ margin: 0 }}>Large spacing above and below.</p>
        <Divider spacing="lg" />
        <p style={{ margin: 0 }}>Content continues here.</p>
      </div>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div
      style={{
        maxWidth: '500px',
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        padding: '2rem',
      }}
    >
      <h2 style={{ margin: 0 }}>Profile Information</h2>
      <Divider />
      <div>
        <strong>Name:</strong> John Doe
      </div>
      <Divider spacing="sm" />
      <div>
        <strong>Email:</strong> john.doe@example.com
      </div>
      <Divider spacing="sm" />
      <div>
        <strong>Role:</strong> Administrator
      </div>
      <Divider spacing="sm" />
      <div>
        <strong>Member Since:</strong> January 2024
      </div>
    </div>
  ),
};

export const WithSections: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <section>
        <h2 style={{ margin: 0, marginBottom: '1rem' }}>Introduction</h2>
        <p style={{ margin: 0, color: '#666' }}>
          Welcome to our comprehensive guide on using layout patterns effectively in your applications.
          These patterns help create consistent and maintainable user interfaces.
        </p>
      </section>

      <Divider label="Getting Started" />

      <section>
        <h2 style={{ margin: 0, marginBottom: '1rem' }}>Basic Concepts</h2>
        <p style={{ margin: 0, color: '#666' }}>
          Layout patterns provide reusable solutions to common layout problems. They ensure consistency
          across your application while making your code more maintainable and scalable.
        </p>
      </section>

      <Divider label="Advanced Topics" />

      <section>
        <h2 style={{ margin: 0, marginBottom: '1rem' }}>Best Practices</h2>
        <p style={{ margin: 0, color: '#666' }}>
          Follow these best practices to get the most out of layout patterns: use semantic HTML,
          maintain consistent spacing, and leverage component composition for maximum reusability.
        </p>
      </section>
    </div>
  ),
};

export const InList: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <h3 style={{ marginTop: 0 }}>Recent Activity</h3>

      <div style={{ padding: '1rem 0' }}>
        <div style={{ fontWeight: 600 }}>Updated profile picture</div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '0.25rem' }}>2 hours ago</div>
      </div>

      <Divider spacing="sm" />

      <div style={{ padding: '1rem 0' }}>
        <div style={{ fontWeight: 600 }}>Changed password</div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '0.25rem' }}>1 day ago</div>
      </div>

      <Divider spacing="sm" />

      <div style={{ padding: '1rem 0' }}>
        <div style={{ fontWeight: 600 }}>Added new email address</div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '0.25rem' }}>3 days ago</div>
      </div>

      <Divider spacing="sm" />

      <div style={{ padding: '1rem 0' }}>
        <div style={{ fontWeight: 600 }}>Joined the platform</div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '0.25rem' }}>2 weeks ago</div>
      </div>
    </div>
  ),
};

export const VerticalNavigation: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        backgroundColor: '#001529',
        color: 'white',
        padding: '1rem 2rem',
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>MyApp</div>
      <Divider orientation="vertical" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Home</a>
      <Divider orientation="vertical" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Products</a>
      <Divider orientation="vertical" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      <a href="#" style={{ color: 'white', textDecoration: 'none' }}>About</a>
      <Divider orientation="vertical" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Contact</a>
    </div>
  ),
};
