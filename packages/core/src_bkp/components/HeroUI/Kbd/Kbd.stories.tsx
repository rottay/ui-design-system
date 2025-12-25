import type { Meta, StoryObj } from '@storybook/react';
import { Kbd } from './Kbd';

const meta: Meta<typeof Kbd> = {
  title: 'HeroUI/Kbd',
  component: Kbd,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Kbd Component** - Theme-aware keyboard key display

Displays keyboard keys visually as styled buttons/keys. Perfect for showing shortcuts, hotkeys, and keyboard commands in your UI.

### Features
- ✅ Single key display
- ✅ Multiple keys with automatic separators
- ✅ 3 sizes (sm, md, lg)
- ✅ 4 variants (solid, bordered, flat, shadow)
- ✅ Fully theme-aware (adapts to all 8 themes)
- ✅ Accessibility support with abbr attribute

### Use Cases
- Keyboard shortcuts in tooltips
- Documentation of hotkeys
- Command palettes
- Tutorial overlays
- Menu items with shortcuts
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'The key to display',
    },
    keys: {
      control: 'object',
      description: 'Array of keys for combinations (e.g., ["Ctrl", "K"])',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the kbd element',
    },
    variant: {
      control: 'select',
      options: ['solid', 'bordered', 'flat', 'shadow'],
      description: 'Visual style variant',
    },
    abbr: {
      control: 'text',
      description: 'Accessible title attribute',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

/**
 * Default kbd component with a single key
 */
export const Default: Story = {
  args: {
    children: 'K',
  },
};

/**
 * Key combination with Ctrl modifier
 */
export const Combination: Story = {
  args: {
    keys: ['Ctrl', 'K'],
  },
};

/**
 * Common keyboard shortcuts examples
 */
export const CommonShortcuts: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Search:</span>
        <Kbd keys={['Ctrl', 'K']} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Save:</span>
        <Kbd keys={['Ctrl', 'S']} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Copy:</span>
        <Kbd keys={['Ctrl', 'C']} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Paste:</span>
        <Kbd keys={['Ctrl', 'V']} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Undo:</span>
        <Kbd keys={['Ctrl', 'Z']} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Close:</span>
        <Kbd>Esc</Kbd>
      </div>
    </div>
  ),
};

/**
 * Different sizes: small, medium, large
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Kbd size="sm">K</Kbd>
      <Kbd size="md">K</Kbd>
      <Kbd size="lg">K</Kbd>
    </div>
  ),
};

/**
 * Different variants: solid, bordered, flat, shadow
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '80px' }}>Solid:</span>
        <Kbd variant="solid" keys={['Ctrl', 'K']} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '80px' }}>Bordered:</span>
        <Kbd variant="bordered" keys={['Ctrl', 'K']} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '80px' }}>Flat:</span>
        <Kbd variant="flat" keys={['Ctrl', 'K']} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '80px' }}>Shadow:</span>
        <Kbd variant="shadow" keys={['Ctrl', 'K']} />
      </div>
    </div>
  ),
};

/**
 * Special keys and symbols
 */
export const SpecialKeys: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>⌥</Kbd>
      <Kbd>⌃</Kbd>
      <Kbd>←</Kbd>
      <Kbd>→</Kbd>
      <Kbd>↑</Kbd>
      <Kbd>↓</Kbd>
      <Kbd>Enter</Kbd>
      <Kbd>Tab</Kbd>
      <Kbd>Space</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>Delete</Kbd>
      <Kbd>Backspace</Kbd>
    </div>
  ),
};

/**
 * Mac-style shortcuts with Command key
 */
export const MacShortcuts: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Search:</span>
        <Kbd keys={['⌘', 'K']} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Save:</span>
        <Kbd keys={['⌘', 'S']} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>New Tab:</span>
        <Kbd keys={['⌘', 'T']} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Close Tab:</span>
        <Kbd keys={['⌘', 'W']} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Screenshot:</span>
        <Kbd keys={['⌘', '⇧', '4']} />
      </div>
    </div>
  ),
};

/**
 * Inline usage within text
 */
export const InlineText: Story = {
  render: () => (
    <div style={{ maxWidth: '400px', lineHeight: '1.8' }}>
      <p>
        Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to quickly search through the
        application. You can also use <Kbd>Esc</Kbd> to close any open modal.
      </p>
      <p>
        Use arrow keys <Kbd>↑</Kbd> <Kbd>↓</Kbd> to navigate through the list,
        and press <Kbd>Enter</Kbd> to select an item.
      </p>
    </div>
  ),
};

/**
 * Navigation shortcuts grid
 */
export const NavigationGrid: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        padding: '20px',
        background: '#f5f5f5',
        borderRadius: '8px',
      }}
    >
      <div>
        <strong>Navigation</strong>
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <Kbd keys={['Ctrl', 'K']} /> Search
          </div>
          <div>
            <Kbd keys={['Ctrl', 'H']} /> Home
          </div>
          <div>
            <Kbd keys={['Ctrl', 'P']} /> Profile
          </div>
        </div>
      </div>
      <div>
        <strong>Actions</strong>
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <Kbd keys={['Ctrl', 'N']} /> New
          </div>
          <div>
            <Kbd keys={['Ctrl', 'S']} /> Save
          </div>
          <div>
            <Kbd keys={['Ctrl', 'D']} /> Delete
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Accessibility with abbr attribute
 */
export const WithAbbr: Story = {
  args: {
    keys: ['Ctrl', 'K'],
    abbr: 'Control + K: Open search',
  },
};
