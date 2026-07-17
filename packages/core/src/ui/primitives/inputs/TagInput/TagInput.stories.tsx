/**
 * TagInput Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TagInput } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';

const meta: Meta<typeof TagInput> = {
  title: 'Primitives/Inputs/TagInput',
  component: TagInput,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ maxWidth: 400 }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TagInput>;

const TagInputDemo = (props: any) => {
  const [tags, setTags] = useState<string[]>(props.value || ['react', 'typescript']);
  return <TagInput {...props} value={tags} onChange={setTags} />;
};

export const Default: Story = {
  render: () => <TagInputDemo placeholder="Add tags..." />,
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <TagInputDemo key={size} size={size} placeholder={`Size: ${size}`} />
      ))}
    </div>
  ),
};

export const MaxTags: Story = {
  render: () => <TagInputDemo maxTags={3} placeholder="Max 3 tags" />,
};

export const Disabled: Story = {
  render: () => <TagInputDemo disabled />,
};

export const WithError: Story = {
  render: () => <TagInputDemo error errorMessage="At least one tag is required" value={[]} />,
};
