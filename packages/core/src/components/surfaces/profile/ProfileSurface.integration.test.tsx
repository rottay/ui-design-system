import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProfileSurface } from '.';
import type { ProfileSurfaceConfig } from '../types';
import { renderSurface } from '../common/test-utils';

function buildConfig(overrides?: Partial<ProfileSurfaceConfig>): ProfileSurfaceConfig {
  return {
    visual: {
      layout: 'stacked',
    },
    presentation: {
      chrome: {
        title: 'My Profile',
        subtitle: 'Manage your account settings',
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
            { key: 'bio', label: 'Bio', value: 'Software developer', type: 'textarea' },
          ],
        },
        {
          key: 'contact',
          label: 'Contact Details',
          description: 'How others can reach you',
          fields: [
            { key: 'phone', label: 'Phone', value: '+1 555-0100', type: 'tel' },
            { key: 'address', label: 'Address', value: '123 Main St', type: 'text' },
          ],
        },
        {
          key: 'preferences',
          label: 'Preferences',
          fields: [
            { key: 'language', label: 'Language', value: 'English', type: 'text' },
            { key: 'timezone', label: 'Timezone', value: 'UTC-5', type: 'text' },
          ],
        },
      ],
      onSave: vi.fn(),
      onDeleteAccount: vi.fn(),
      onPasswordChange: vi.fn(),
    },
    ...overrides,
  };
}

describe('ProfileSurface integration', () => {
  describe('section rendering', () => {
    it('renders all sections with labels', async () => {
      renderSurface(<ProfileSurface config={buildConfig()} />);

      expect(await screen.findByText('Personal Information')).toBeInTheDocument();
      expect(await screen.findByText('Contact Details')).toBeInTheDocument();
      expect(await screen.findByText('Preferences')).toBeInTheDocument();
    });

    it('renders section descriptions', async () => {
      renderSurface(<ProfileSurface config={buildConfig()} />);

      expect(await screen.findByText('Your basic profile details')).toBeInTheDocument();
      expect(await screen.findByText('How others can reach you')).toBeInTheDocument();
    });

    it('renders all field labels', async () => {
      renderSurface(<ProfileSurface config={buildConfig()} />);

      expect(await screen.findByText('Full Name')).toBeInTheDocument();
      expect(await screen.findByText('Email')).toBeInTheDocument();
      expect(await screen.findByText('Bio')).toBeInTheDocument();
      expect(await screen.findByText('Phone')).toBeInTheDocument();
      expect(await screen.findByText('Address')).toBeInTheDocument();
      expect(await screen.findByText('Language')).toBeInTheDocument();
      expect(await screen.findByText('Timezone')).toBeInTheDocument();
    });

    it('renders field values in read mode', async () => {
      renderSurface(<ProfileSurface config={buildConfig()} />);

      expect(await screen.findByText('John Doe')).toBeInTheDocument();
      expect(await screen.findByText('john@example.com')).toBeInTheDocument();
      expect(await screen.findByText('Software developer')).toBeInTheDocument();
      expect(await screen.findByText('+1 555-0100')).toBeInTheDocument();
      expect(await screen.findByText('123 Main St')).toBeInTheDocument();
    });

    it('renders chrome title', async () => {
      renderSurface(<ProfileSurface config={buildConfig()} />);

      expect(await screen.findByText('My Profile')).toBeInTheDocument();
    });
  });

  describe('save callback', () => {
    it('shows edit buttons for sections when onSave is provided', async () => {
      renderSurface(<ProfileSurface config={buildConfig()} />);

      const editButtons = await screen.findAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBe(3); // One per section
    });

    it('does not show edit buttons when onSave is not provided', async () => {
      const config = buildConfig({
        behavior: {
          ...buildConfig().behavior,
          onSave: undefined,
        },
      });

      renderSurface(<ProfileSurface config={config} />);

      expect(await screen.findByText('Personal Information')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
    });

    it('toggles to edit mode and back to save', async () => {
      const config = buildConfig();
      renderSurface(<ProfileSurface config={config} />);

      const editButtons = await screen.findAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]); // Edit "Personal Information"

      // After clicking edit, a Save button should appear
      const saveButton = await screen.findByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();

      fireEvent.click(saveButton);
      expect(config.behavior.onSave).toHaveBeenCalledWith(
        'personal',
        expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
        })
      );
    });
  });

  describe('delete account', () => {
    it('renders delete account button and fires callback', async () => {
      const config = buildConfig();
      renderSurface(<ProfileSurface config={config} />);

      const deleteButton = await screen.findByRole('button', { name: /delete account/i });
      fireEvent.click(deleteButton);
      expect(config.behavior.onDeleteAccount).toHaveBeenCalledTimes(1);
    });

    it('does not render delete button when handler is not provided', async () => {
      const config = buildConfig({
        behavior: {
          ...buildConfig().behavior,
          onDeleteAccount: undefined,
        },
      });

      renderSurface(<ProfileSurface config={config} />);

      expect(await screen.findByText('Personal Information')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete account/i })).not.toBeInTheDocument();
    });
  });

  describe('change password', () => {
    it('renders change password button when handler is provided', async () => {
      renderSurface(<ProfileSurface config={buildConfig()} />);

      const changePasswordButton = await screen.findByRole('button', { name: /change password/i });
      expect(changePasswordButton).toBeInTheDocument();
    });

    it('does not render change password button when handler is not provided', async () => {
      const config = buildConfig({
        behavior: {
          ...buildConfig().behavior,
          onPasswordChange: undefined,
        },
      });

      renderSurface(<ProfileSurface config={config} />);

      expect(await screen.findByText('Personal Information')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /change password/i })).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
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

  describe('sidebar layout', () => {
    it('renders in sidebar layout without error', async () => {
      const config = buildConfig({
        visual: { layout: 'sidebar' },
      });

      renderSurface(<ProfileSurface config={config} />);

      expect(await screen.findByText('Personal Information')).toBeInTheDocument();
    });
  });
});
