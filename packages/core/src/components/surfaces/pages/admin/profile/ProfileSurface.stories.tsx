/** @fileoverview ProfileSurface Storybook stories. */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProfileSurface } from '.';
import { Text } from '../../../../primitives';
import { createSurfaceStoryDecorator } from '../../../foundation/common/story-helpers';

const meta: Meta<typeof ProfileSurface> = {
  title: 'Surfaces/ProfileSurface',
  component: ProfileSurface,
  decorators: [
    createSurfaceStoryDecorator({
      productProfile: 'events.organizer',
      engine: 'rustic',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'User account management surface with support for sectioned profile editing, ' +
          'avatar management, password changes, and account deletion. Supports sidebar and stacked layouts.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProfileSurface>;

const sampleSections = [
  {
    key: 'personal',
    label: 'Personal Information',
    description: 'Update your name and contact details',
    fields: [
      { key: 'firstName', label: 'First Name', value: 'Alice' },
      { key: 'lastName', label: 'Last Name', value: 'Johnson' },
      { key: 'email', label: 'Email', value: 'alice@company.com', type: 'email' as const, readOnly: true },
      { key: 'phone', label: 'Phone', value: '+1 (555) 123-4567', type: 'tel' as const },
    ],
  },
  {
    key: 'bio',
    label: 'Bio & Social',
    description: 'Tell others about yourself',
    fields: [
      { key: 'bio', label: 'Bio', value: 'Senior engineer working on platform infrastructure.', type: 'textarea' as const },
      { key: 'website', label: 'Website', value: 'https://alice.dev', type: 'url' as const },
    ],
  },
  {
    key: 'company',
    label: 'Company Details',
    fields: [
      { key: 'company', label: 'Company', value: 'Rottay Inc.', readOnly: true },
      { key: 'department', label: 'Department', value: 'Platform Engineering' },
      { key: 'role', label: 'Role', value: 'Senior Engineer', readOnly: true },
    ],
  },
];

const avatarPlaceholder = (
  <div
    style={{
      width: 96,
      height: 96,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #0a66c2, #14b8a6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 700,
      fontSize: 32,
    }}
  >
    AJ
  </div>
);

export const Default: Story = {
  args: {
    config: {
      visual: { layout: 'stacked' },
      presentation: {
        chrome: { title: 'My Profile', subtitle: 'Manage your account settings' },
        avatar: avatarPlaceholder,
      },
      behavior: {
        sections: sampleSections,
        onSave: (section, data) => console.log('Save:', section, data),
        onPasswordChange: (oldPw, newPw) => console.log('Password change:', oldPw, newPw),
        onDeleteAccount: () => console.log('Delete account clicked'),
      },
    },
  },
};

export const SidebarLayout: Story = {
  args: {
    config: {
      visual: { layout: 'sidebar' },
      presentation: {
        chrome: { title: 'Account Settings' },
        avatar: avatarPlaceholder,
        header: (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <Text style={{ fontWeight: 600 }}>Alice Johnson</Text>
            <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 13 }}>Senior Engineer</Text>
          </div>
        ),
      },
      behavior: {
        sections: sampleSections,
        onSave: (section, data) => console.log('Save:', section, data),
        onPasswordChange: (oldPw, newPw) => console.log('Password change:', oldPw, newPw),
      },
    },
  },
};

export const ReadOnly: Story = {
  args: {
    config: {
      visual: { layout: 'stacked' },
      presentation: {
        chrome: { title: 'User Profile', subtitle: 'View-only profile' },
        avatar: avatarPlaceholder,
      },
      behavior: {
        sections: sampleSections.map((s) => ({
          ...s,
          fields: s.fields.map((f) => ({ ...f, readOnly: true })),
        })),
      },
    },
  },
};
