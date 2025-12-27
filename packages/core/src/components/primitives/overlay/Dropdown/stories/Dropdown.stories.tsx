/**
 * Dropdown Stories
 * Colocated with component following approved architecture.
 *
 * @module Dropdown/stories
 * @description Storybook stories for the Dropdown component demonstrating
 * all features, variants, placements, and engine implementations.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Dropdown } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

/**
 * Dropdown component metadata for Storybook.
 * Configures controls, decorators, and documentation.
 */
const meta: Meta<typeof Dropdown> = {
  title: 'Primitives/Overlay/Dropdown',
  component: Dropdown,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ padding: '100px', display: 'flex', justifyContent: 'center' }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
Dropdown component for displaying a menu of actions or options.
Supports multiple placement positions, trigger types, and menu configurations.

**Features:**
- 6 placement positions
- Multiple trigger types (hover, click, contextMenu)
- Menu items with icons, disabled state, and danger styling
- Selectable menu support
- Controlled and uncontrolled modes
- Arrow indicator support
- Three engine implementations (Titan, Hermes, Apollo)
        `,
      },
    },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight'],
      description: 'Position of the dropdown relative to the trigger element',
    },
    trigger: {
      control: 'select',
      options: ['hover', 'click', 'contextMenu'],
      description: 'How the dropdown is triggered',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'Rendering engine to use',
    },
    arrow: {
      control: 'boolean',
      description: 'Whether to show the arrow indicator',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the dropdown is disabled',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

const defaultMenu = {
  items: [
    { key: '1', label: 'Action 1' },
    { key: '2', label: 'Action 2' },
    { key: '3', label: 'Action 3' },
  ],
};

/**
 * Default dropdown with basic configuration.
 */
export const Default: Story = {
  args: {
    menu: defaultMenu,
    children: <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Hover me</button>,
    placement: 'bottomLeft',
  },
};

/**
 * Dropdown placements demonstration.
 * Shows all 6 available placement positions.
 */
export const Placements: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
      {(['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight'] as const).map((placement) => (
        <Dropdown key={placement} menu={defaultMenu} placement={placement}>
          <button style={{ padding: '8px 16px', minWidth: '120px' }}>{placement}</button>
        </Dropdown>
      ))}
    </div>
  ),
};

/**
 * Trigger types demonstration.
 * Shows hover, click, and context menu triggers.
 */
export const TriggerTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Dropdown menu={defaultMenu} trigger={['hover']}>
        <button style={{ padding: '8px 16px' }}>Hover</button>
      </Dropdown>
      <Dropdown menu={defaultMenu} trigger={['click']}>
        <button style={{ padding: '8px 16px' }}>Click</button>
      </Dropdown>
      <Dropdown menu={defaultMenu} trigger={['contextMenu']}>
        <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          Right Click Here
        </div>
      </Dropdown>
    </div>
  ),
};

/**
 * Menu with icons demonstration.
 */
export const WithIcons: Story = {
  render: () => {
    const menuWithIcons = {
      items: [
        { key: 'edit', label: 'Edit', icon: <span>✏️</span> },
        { key: 'copy', label: 'Copy', icon: <span>📋</span> },
        { key: 'delete', label: 'Delete', icon: <span>🗑️</span>, danger: true },
      ],
    };
    return (
      <Dropdown menu={menuWithIcons}>
        <button style={{ padding: '8px 16px' }}>Actions</button>
      </Dropdown>
    );
  },
};

/**
 * Menu with disabled items demonstration.
 */
export const WithDisabledItems: Story = {
  render: () => {
    const menuWithDisabled = {
      items: [
        { key: '1', label: 'Available Action' },
        { key: '2', label: 'Disabled Action', disabled: true },
        { key: '3', label: 'Another Action' },
      ],
    };
    return (
      <Dropdown menu={menuWithDisabled}>
        <button style={{ padding: '8px 16px' }}>Menu with Disabled</button>
      </Dropdown>
    );
  },
};

/**
 * Menu with danger items demonstration.
 */
export const WithDangerItems: Story = {
  render: () => {
    const menuWithDanger = {
      items: [
        { key: 'view', label: 'View Details' },
        { key: 'edit', label: 'Edit' },
        { key: 'divider', type: 'divider' as const },
        { key: 'delete', label: 'Delete', danger: true },
      ],
    };
    return (
      <Dropdown menu={menuWithDanger}>
        <button style={{ padding: '8px 16px' }}>Actions</button>
      </Dropdown>
    );
  },
};

/**
 * Selectable menu demonstration.
 */
export const SelectableMenu: Story = {
  render: () => {
    const selectableMenu = {
      items: [
        { key: 'option1', label: 'Option 1' },
        { key: 'option2', label: 'Option 2' },
        { key: 'option3', label: 'Option 3' },
      ],
      selectable: true,
      selectedKeys: ['option1'],
    };
    return (
      <Dropdown menu={selectableMenu}>
        <button style={{ padding: '8px 16px' }}>Select Option</button>
      </Dropdown>
    );
  },
};

/**
 * Disabled dropdown demonstration.
 */
export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Dropdown menu={defaultMenu} disabled={false}>
        <button style={{ padding: '8px 16px' }}>Enabled</button>
      </Dropdown>
      <Dropdown menu={defaultMenu} disabled={true}>
        <button style={{ padding: '8px 16px', opacity: 0.5 }}>Disabled</button>
      </Dropdown>
    </div>
  ),
};

/**
 * Arrow options demonstration.
 */
export const ArrowOptions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Dropdown menu={defaultMenu} arrow={true}>
        <button style={{ padding: '8px 16px' }}>With Arrow</button>
      </Dropdown>
      <Dropdown menu={defaultMenu} arrow={false}>
        <button style={{ padding: '8px 16px' }}>No Arrow</button>
      </Dropdown>
    </div>
  ),
};

/**
 * Engine comparison demonstration.
 */
export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{engine} Engine</h4>
          <Dropdown engine={engine} menu={defaultMenu}>
            <button style={{ padding: '8px 16px' }}>Open Menu</button>
          </Dropdown>
        </div>
      ))}
    </div>
  ),
};

/**
 * With onClick handler demonstration.
 */
export const WithOnClick: Story = {
  render: () => {
    const menuWithClick = {
      items: [
        { key: 'profile', label: 'View Profile' },
        { key: 'settings', label: 'Settings' },
        { key: 'logout', label: 'Logout' },
      ],
      onClick: ({ key }: { key: string }) => {
        alert(`Clicked: ${key}`);
      },
    };
    return (
      <Dropdown menu={menuWithClick}>
        <button style={{ padding: '8px 16px' }}>User Menu</button>
      </Dropdown>
    );
  },
};
