import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from './Chip';
import { X, Check, Star, Mail, User, Tag } from 'lucide-react';
import { Avatar } from '../../../components/Display/Avatar';

const meta: Meta<typeof Chip> = {
  title: 'HeroUI/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Chip Component** - Interactive theme-aware tags

Enhanced tag component with interactive features like close buttons, click actions, avatars, and multiple style variants. Perfect for filters, tags, labels, and user selections.

### Features
- ✅ 5 variants (solid, bordered, flat, dot, shadow)
- ✅ 5 color themes (default, primary, success, warning, danger)
- ✅ Closeable with X button and onClose callback
- ✅ Clickable with onClick callback
- ✅ Avatar and icon support (start/end content)
- ✅ 3 sizes (sm, md, lg)
- ✅ 5 border radius options
- ✅ Fully theme-aware
- ✅ Hover effects and animations
- ✅ Disabled state

### Use Cases
- Filter chips with remove functionality
- Tag system for categorization
- User badges with avatars
- Status indicators
- Multi-select displays
- Command suggestions
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Content of the chip',
    },
    variant: {
      control: 'select',
      options: ['solid', 'bordered', 'flat', 'dot', 'shadow'],
      description: 'Visual style variant',
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger'],
      description: 'Color theme',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the chip',
    },
    closeable: {
      control: 'boolean',
      description: 'Show close button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

/**
 * Default chip with primary color
 */
export const Default: Story = {
  args: {
    children: 'Label',
    color: 'primary',
  },
};

/**
 * All color variants
 */
export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Chip color="default">Default</Chip>
      <Chip color="primary">Primary</Chip>
      <Chip color="success">Success</Chip>
      <Chip color="warning">Warning</Chip>
      <Chip color="danger">Danger</Chip>
    </div>
  ),
};

/**
 * All style variants with primary color
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ width: '80px' }}>Solid:</span>
        <Chip variant="solid" color="primary">Solid</Chip>
        <Chip variant="solid" color="success">Success</Chip>
        <Chip variant="solid" color="danger">Danger</Chip>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ width: '80px' }}>Bordered:</span>
        <Chip variant="bordered" color="primary">Bordered</Chip>
        <Chip variant="bordered" color="success">Success</Chip>
        <Chip variant="bordered" color="danger">Danger</Chip>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ width: '80px' }}>Flat:</span>
        <Chip variant="flat" color="primary">Flat</Chip>
        <Chip variant="flat" color="success">Success</Chip>
        <Chip variant="flat" color="danger">Danger</Chip>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ width: '80px' }}>Dot:</span>
        <Chip variant="dot" color="primary">Dot</Chip>
        <Chip variant="dot" color="success">Success</Chip>
        <Chip variant="dot" color="danger">Danger</Chip>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ width: '80px' }}>Shadow:</span>
        <Chip variant="shadow" color="primary">Shadow</Chip>
        <Chip variant="shadow" color="success">Success</Chip>
        <Chip variant="shadow" color="danger">Danger</Chip>
      </div>
    </div>
  ),
};

/**
 * Different sizes: small, medium, large
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Chip size="sm" color="primary">Small</Chip>
      <Chip size="md" color="primary">Medium</Chip>
      <Chip size="lg" color="primary">Large</Chip>
    </div>
  ),
};

/**
 * Closeable chips with X button
 */
export const Closeable: Story = {
  render: () => {
    const [chips, setChips] = React.useState([
      { id: 1, label: 'React', color: 'primary' as const },
      { id: 2, label: 'TypeScript', color: 'success' as const },
      { id: 3, label: 'Next.js', color: 'warning' as const },
      { id: 4, label: 'Vite', color: 'danger' as const },
    ]);

    return (
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {chips.map((chip) => (
          <Chip
            key={chip.id}
            color={chip.color}
            closeable
            onClose={() => setChips(chips.filter((c) => c.id !== chip.id))}
          >
            {chip.label}
          </Chip>
        ))}
      </div>
    );
  },
};

/**
 * Clickable chips with onClick action
 */
export const Clickable: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<number | null>(null);

    return (
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {['All', 'Active', 'Pending', 'Completed', 'Archived'].map((label, index) => (
          <Chip
            key={index}
            color={selected === index ? 'primary' : 'default'}
            variant={selected === index ? 'solid' : 'bordered'}
            onClick={() => setSelected(index)}
            style={{ cursor: 'pointer' }}
          >
            {label}
          </Chip>
        ))}
      </div>
    );
  },
};

/**
 * Chips with avatars
 */
export const WithAvatars: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Chip
        avatar={<Avatar size="small" style={{ width: 20, height: 20 }}>JD</Avatar>}
        closeable
      >
        John Doe
      </Chip>
      <Chip
        avatar={<Avatar size="small" style={{ width: 20, height: 20 }}>AS</Avatar>}
        color="primary"
        closeable
      >
        Alice Smith
      </Chip>
      <Chip
        avatar={<Avatar size="small" style={{ width: 20, height: 20 }}>BJ</Avatar>}
        color="success"
        closeable
      >
        Bob Johnson
      </Chip>
    </div>
  ),
};

/**
 * Chips with start icons
 */
export const WithStartIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Chip startContent={<Check size={14} />} color="success">
        Verified
      </Chip>
      <Chip startContent={<Star size={14} />} color="warning">
        Featured
      </Chip>
      <Chip startContent={<Mail size={14} />} color="primary">
        Email
      </Chip>
      <Chip startContent={<User size={14} />} color="default">
        Profile
      </Chip>
      <Chip startContent={<Tag size={14} />} color="primary">
        Tagged
      </Chip>
    </div>
  ),
};

/**
 * Chips with end content
 */
export const WithEndContent: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Chip endContent={<Check size={14} />} color="success">
        Completed
      </Chip>
      <Chip endContent={<X size={14} />} color="danger">
        Failed
      </Chip>
      <Chip endContent={<span style={{ fontSize: '10px' }}>99+</span>} color="primary">
        Messages
      </Chip>
    </div>
  ),
};

/**
 * Dot variant for status indicators
 */
export const StatusDots: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Chip variant="dot" color="success">Online</Chip>
      <Chip variant="dot" color="warning">Away</Chip>
      <Chip variant="dot" color="danger">Busy</Chip>
      <Chip variant="dot" color="default">Offline</Chip>
    </div>
  ),
};

/**
 * Filter chips example (like in search UI)
 */
export const FilterExample: Story = {
  render: () => {
    const [filters, setFilters] = React.useState([
      { id: 1, label: 'Status: Active', field: 'status' },
      { id: 2, label: 'Type: Premium', field: 'type' },
      { id: 3, label: 'Date: Last 7 days', field: 'date' },
    ]);

    return (
      <div>
        <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
          Active Filters ({filters.length}):
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {filters.map((filter) => (
            <Chip
              key={filter.id}
              variant="flat"
              color="primary"
              size="sm"
              closeable
              onClose={() => setFilters(filters.filter((f) => f.id !== filter.id))}
            >
              {filter.label}
            </Chip>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Tags with different colors
 */
export const TagsExample: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Chip size="sm" color="primary">React</Chip>
      <Chip size="sm" color="success">TypeScript</Chip>
      <Chip size="sm" color="warning">JavaScript</Chip>
      <Chip size="sm" color="danger">HTML</Chip>
      <Chip size="sm" color="default">CSS</Chip>
      <Chip size="sm" color="primary" variant="bordered">Next.js</Chip>
      <Chip size="sm" color="success" variant="bordered">Node.js</Chip>
      <Chip size="sm" color="warning" variant="bordered">Vite</Chip>
    </div>
  ),
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Chip color="primary" disabled>Disabled</Chip>
      <Chip color="success" disabled closeable>Disabled Closeable</Chip>
      <Chip color="warning" disabled variant="bordered">Disabled Bordered</Chip>
    </div>
  ),
};

/**
 * Mixed example showing real-world usage
 */
export const RealWorldExample: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ marginBottom: '12px' }}>Project Members</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Chip
            avatar={<Avatar size="small" style={{ width: 20, height: 20 }}>JD</Avatar>}
            color="primary"
            closeable
          >
            John Doe
          </Chip>
          <Chip
            avatar={<Avatar size="small" style={{ width: 20, height: 20 }}>AS</Avatar>}
            color="primary"
            closeable
          >
            Alice Smith
          </Chip>
          <Chip
            avatar={<Avatar size="small" style={{ width: 20, height: 20 }}>BJ</Avatar>}
            color="primary"
            closeable
          >
            Bob Johnson
          </Chip>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ marginBottom: '12px' }}>Project Tags</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Chip size="sm" variant="flat" color="primary" closeable>frontend</Chip>
          <Chip size="sm" variant="flat" color="success" closeable>react</Chip>
          <Chip size="sm" variant="flat" color="warning" closeable>typescript</Chip>
          <Chip size="sm" variant="flat" color="default" closeable>ui-library</Chip>
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: '12px' }}>Status</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Chip variant="dot" color="success">Active</Chip>
          <Chip variant="dot" color="warning">2 Pending Reviews</Chip>
        </div>
      </div>
    </div>
  ),
};
