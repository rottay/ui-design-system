import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatternCommentThread } from './';
import { createSurfaceStoryDecorator } from '../../../surfaces/foundation/common/story-helpers';

const meta: Meta<typeof PatternCommentThread> = {
  title: 'Patterns/CommentThread',
  component: PatternCommentThread,
  decorators: [createSurfaceStoryDecorator({ productProfile: 'events.organizer', engine: 'rustic' })],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PatternCommentThread>;

export const Default: Story = {
  args: {
    comments: [
      {
        id: '1',
        author: { name: 'Alice Johnson' },
        content: 'This design looks fantastic! I love the color palette.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        reactions: [
          { emoji: '\uD83D\uDC4D', count: 3, active: true },
          { emoji: '\u2764\uFE0F', count: 1, active: false },
        ],
        replies: [
          {
            id: '2',
            author: { name: 'Bob Smith' },
            content: 'Thanks! We spent a lot of time on that.',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
          },
          {
            id: '3',
            author: { name: 'Charlie Brown' },
            content: 'Agreed, the dark mode variant is especially nice.',
            timestamp: new Date(Date.now() - 900000).toISOString(),
          },
        ],
      },
      {
        id: '4',
        author: { name: 'Diana Prince' },
        content: 'Could we add a loading skeleton variant?',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        edited: true,
      },
    ],
    currentUser: { name: 'Alice Johnson' },
    onAdd: (content) => console.log('Add:', content),
    onReply: (id, content) => console.log('Reply:', id, content),
    onEdit: (id, content) => console.log('Edit:', id, content),
    onDelete: (id) => console.log('Delete:', id),
    onReaction: (id, emoji) => console.log('React:', id, emoji),
    maxDepth: 3,
  },
};
