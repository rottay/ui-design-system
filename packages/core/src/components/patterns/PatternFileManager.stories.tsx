import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatternFileManager } from './file-manager';
import { createSurfaceStoryDecorator } from '../surfaces/common/story-helpers';

const meta: Meta<typeof PatternFileManager> = {
  title: 'Patterns/FileManager',
  component: PatternFileManager,
  decorators: [createSurfaceStoryDecorator({ productProfile: 'events.organizer', engine: 'rustic' })],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PatternFileManager>;

export const Default: Story = {
  args: {
    files: [
      { id: 'f1', name: 'report-q4.pdf', type: 'file', mimeType: 'application/pdf', size: 245760, modifiedAt: '2026-03-10' },
      { id: 'f2', name: 'team-photo.jpg', type: 'file', mimeType: 'image/jpeg', size: 1048576, modifiedAt: '2026-03-12' },
      { id: 'f3', name: 'notes.txt', type: 'file', mimeType: 'text/plain', size: 512, modifiedAt: '2026-03-14' },
    ],
    folders: [
      { id: 'd1', name: 'Documents', type: 'folder', childCount: 12, modifiedAt: '2026-03-13' },
      { id: 'd2', name: 'Images', type: 'folder', childCount: 45, modifiedAt: '2026-03-11' },
    ],
    viewMode: 'list',
    onUpload: (files) => console.log('Upload:', files),
    onDelete: (ids) => console.log('Delete:', ids),
    onNavigate: (id) => console.log('Navigate:', id),
  },
};

export const GridView: Story = {
  args: {
    ...Default.args,
    viewMode: 'grid',
  },
};
