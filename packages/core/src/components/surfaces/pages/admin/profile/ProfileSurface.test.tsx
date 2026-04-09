/** @fileoverview ProfileSurface tests -- section rendering, avatar, and save actions. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProfileSurface } from '.';
import type { ProfileSurfaceConfig } from '../../../foundation/types';
import { renderSurface } from '../common/test-utils';

function buildConfig(overrides?: Partial<ProfileSurfaceConfig>): ProfileSurfaceConfig {
  return {
    visual: {
      layout: 'stacked',
    },
    presentation: {
      chrome: {
        title: 'My Profile',
      },
    },
    behavior: {
      sections: [
        {
          key: 'personal',
          label: 'Personal Information',
          description: 'Your basic profile details',
          fields: [
            { key: 'name', label: 'Full Name', value: 'John Doe', type: 'text' },
            { key: 'email', label: 'Email', value: 'john@example.com', type: 'email', readOnly: true },
          ],
        },
        {
          key: 'contact',
          label: 'Contact Details',
          fields: [
            { key: 'phone', label: 'Phone', value: '+1 555-0100', type: 'tel' },
          ],
        },
      ],
      onSave: vi.fn(),
      onDeleteAccount: vi.fn(),
    },
    ...overrides,
  };
}

describe('ProfileSurface', () => {
  it('renders sections with field values', async () => {
    renderSurface(<ProfileSurface config={buildConfig()} />);

    expect(await screen.findByText('My Profile')).toBeInTheDocument();
    expect(await screen.findByText('Personal Information')).toBeInTheDocument();
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(await screen.findByText('john@example.com')).toBeInTheDocument();
    expect(await screen.findByText('Contact Details')).toBeInTheDocument();
    expect(await screen.findByText('+1 555-0100')).toBeInTheDocument();
  });

  it('renders delete account button when handler is provided', async () => {
    const config = buildConfig();

    renderSurface(<ProfileSurface config={config} />);

    const deleteButton = await screen.findByRole('button', { name: /delete account/i });
    fireEvent.click(deleteButton);
    expect(config.behavior.onDeleteAccount).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when no sections are provided', async () => {
    const config = buildConfig({
      behavior: {
        ...buildConfig().behavior,
        sections: [],
      },
    });

    renderSurface(<ProfileSurface config={config} />);

    expect(await screen.findByText('No profile sections')).toBeInTheDocument();
  });
});
