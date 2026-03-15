/**
 * HoverCard Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard } from '../';
import { DesignSystemProvider } from '../../../../../core/providers/root';

const meta: Meta<typeof HoverCard> = {
  title: 'Primitives/Overlay/HoverCard',
  component: HoverCard,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ padding: 100, display: 'flex', justifyContent: 'center' }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  args: {
    content: (
      <div>
        <strong>John Doe</strong>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#666' }}>
          Software Engineer at Rottay
        </p>
      </div>
    ),
    trigger: <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>@johndoe</span>,
  },
};

export const Sides: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 40 }}>
      {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
        <HoverCard
          key={side}
          side={side}
          content={<div>Card on {side}</div>}
          trigger={<span style={{ textDecoration: 'underline', cursor: 'pointer' }}>{side}</span>}
        />
      ))}
    </div>
  ),
};

export const CustomDelay: Story = {
  args: {
    openDelay: 500,
    closeDelay: 100,
    content: <div>Slower open, faster close</div>,
    trigger: <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Hover (slow)</span>,
  },
};
