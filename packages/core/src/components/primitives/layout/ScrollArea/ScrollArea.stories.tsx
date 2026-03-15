/**
 * ScrollArea Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from './ScrollArea';
import { DesignSystemProvider } from '../../../../bootstrap';
import { EngineComparison } from '../../../../../.storybook/helpers';

const meta: Meta<typeof ScrollArea> = {
  title: 'Primitives/Layout/ScrollArea',
  component: ScrollArea,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <Story />
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
A container with custom styled scrollbar for overflow content.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|---------|--------|--------|
| Scrollbar | Custom CSS | Tailwind + CSS | Pure CSS |
| Firefox | scrollbar-width | scrollbar-width | scrollbar-width |
| Hover reveal | Supported | Supported | Supported |
`,
      },
    },
  },
  argTypes: {
    maxHeight: { control: 'text' },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal', 'both'],
    },
    scrollbarSize: {
      control: 'select',
      options: ['thin', 'normal', 'wide'],
    },
    hideScrollbar: { control: 'boolean' },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

const LongContent = () => (
  <div style={{ padding: '16px' }}>
    {Array.from({ length: 20 }, (_, i) => (
      <p key={i} style={{ marginBottom: '12px', color: 'var(--ds-color-text-primary, #1a1a1a)' }}>
        Item {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </p>
    ))}
  </div>
);

const WideContent = () => (
  <div style={{ display: 'flex', gap: '16px', padding: '16px', width: '1200px' }}>
    {Array.from({ length: 12 }, (_, i) => (
      <div
        key={i}
        style={{
          minWidth: '120px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--ds-color-primary-100, #e6f7ff)',
          borderRadius: '8px',
          fontWeight: 600,
        }}
      >
        Card {i + 1}
      </div>
    ))}
  </div>
);

export const Default: Story = {
  render: () => (
    <ScrollArea maxHeight="200px" style={{ border: '1px solid var(--ds-color-neutral-300, #d9d9d9)', borderRadius: '8px' }}>
      <LongContent />
    </ScrollArea>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea orientation="horizontal" maxWidth="400px" style={{ border: '1px solid var(--ds-color-neutral-300, #d9d9d9)', borderRadius: '8px' }}>
      <WideContent />
    </ScrollArea>
  ),
};

export const ThinScrollbar: Story = {
  render: () => (
    <ScrollArea maxHeight="200px" scrollbarSize="thin" style={{ border: '1px solid var(--ds-color-neutral-300, #d9d9d9)', borderRadius: '8px' }}>
      <LongContent />
    </ScrollArea>
  ),
};

export const HideUntilHover: Story = {
  render: () => (
    <ScrollArea maxHeight="200px" hideScrollbar style={{ border: '1px solid var(--ds-color-neutral-300, #d9d9d9)', borderRadius: '8px' }}>
      <LongContent />
    </ScrollArea>
  ),
};

export const CompareEngines: Story = {
  name: 'Engine Comparison',
  render: () => (
    <EngineComparison
      component={ScrollArea}
      props={{
        maxHeight: '150px',
        style: { border: '1px solid #d9d9d9', borderRadius: '8px' },
        children: <LongContent />,
      }}
      showDescriptions
    />
  ),
};
