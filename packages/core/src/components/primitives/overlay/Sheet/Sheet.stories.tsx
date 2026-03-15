/**
 * Sheet Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Sheet } from './';
import { DesignSystemProvider } from '../../../../design-system';

const meta: Meta<typeof Sheet> = {
  title: 'Primitives/Overlay/Sheet',
  component: Sheet,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <Story />
      </DesignSystemProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

const SheetDemo = ({ side = 'bottom' as const, title = 'Sheet Title' }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open {side} sheet</button>
      <Sheet open={open} onOpenChange={setOpen} side={side} title={title}>
        <p>Sheet content goes here. This is a mobile-first panel.</p>
      </Sheet>
    </>
  );
};

export const Bottom: Story = {
  render: () => <SheetDemo side="bottom" />,
};

export const Left: Story = {
  render: () => <SheetDemo side="left" title="Navigation" />,
};

export const Right: Story = {
  render: () => <SheetDemo side="right" title="Details" />,
};
