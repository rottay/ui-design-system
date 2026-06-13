/** @fileoverview ProfileSurface integration tests -- save flow and layout variants. */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProfileSurface } from '..';
import type { ProfileSurfaceConfig } from '../../../../foundation/types';
import { renderSurface } from '../../../../foundation/common/test-utils';

function getButtonsByText(container: HTMLElement, label: RegExp): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('button')).filter((button) =>
    label.test(button.textContent ?? '')
  );
}

function getButtonByText(container: HTMLElement, label: RegExp): HTMLButtonElement {
  const button = getButtonsByText(container, label)[0];
  expect(button).toBeDefined();
  return button;
}

function queryButtonByText(container: HTMLElement, label: RegExp): HTMLButtonElement | undefined {
  return getButtonsByText(container, label)[0];
}

async function expectText(container: HTMLElement, text: string): Promise<void> {
  await waitFor(() => {
    expect(container.textContent).toContain(text);
  });
}

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
      const { container } = renderSurface(<ProfileSurface config={buildConfig()} />);

      await expectText(container, 'Personal Information');
      expect(container.textContent).toContain('Contact Details');
      expect(container.textContent).toContain('Preferences');
    });

    it('renders section descriptions', async () => {
      const { container } = renderSurface(<ProfileSurface config={buildConfig()} />);

      await expectText(container, 'Your basic profile details');
      expect(container.textContent).toContain('How others can reach you');
    });

    it('renders all field labels', async () => {
      const { container } = renderSurface(<ProfileSurface config={buildConfig()} />);

      await expectText(container, 'Full Name');
      expect(container.textContent).toContain('Email');
      expect(container.textContent).toContain('Bio');
      expect(container.textContent).toContain('Phone');
      expect(container.textContent).toContain('Address');
      expect(container.textContent).toContain('Language');
      expect(container.textContent).toContain('Timezone');
    });

    it('renders field values in read mode', async () => {
      const { container } = renderSurface(<ProfileSurface config={buildConfig()} />);

      await expectText(container, 'John Doe');
      expect(container.textContent).toContain('john@example.com');
      expect(container.textContent).toContain('Software developer');
      expect(container.textContent).toContain('+1 555-0100');
      expect(container.textContent).toContain('123 Main St');
    });

    it('renders chrome title', async () => {
      const { container } = renderSurface(<ProfileSurface config={buildConfig()} />);

      await expectText(container, 'My Profile');
    });
  });

  describe('save callback', () => {
    it('shows edit buttons for sections when onSave is provided', async () => {
      const { container } = renderSurface(<ProfileSurface config={buildConfig()} />);

      await expectText(container, 'Personal Information');
      const editButtons = getButtonsByText(container, /edit/i);
      expect(editButtons.length).toBe(3); // One per section
    });

    it('does not show edit buttons when onSave is not provided', async () => {
      const config = buildConfig({
        behavior: {
          ...buildConfig().behavior,
          onSave: undefined,
        },
      });

      const { container } = renderSurface(<ProfileSurface config={config} />);

      await expectText(container, 'Personal Information');
      expect(queryButtonByText(container, /^edit$/i)).toBeUndefined();
    });

    it('toggles to edit mode and back to save', async () => {
      const config = buildConfig();
      const { container } = renderSurface(<ProfileSurface config={config} />);

      await expectText(container, 'Personal Information');
      const editButtons = getButtonsByText(container, /edit/i);
      fireEvent.click(editButtons[0]); // Edit "Personal Information"

      // After clicking edit, a Save button should appear
      await expectText(container, 'Save');
      const saveButton = getButtonByText(container, /save/i);
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
      const { container } = renderSurface(<ProfileSurface config={config} />);

      await expectText(container, 'Delete Account');
      const deleteButton = getButtonByText(container, /delete account/i);
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

      const { container } = renderSurface(<ProfileSurface config={config} />);

      await expectText(container, 'Personal Information');
      expect(queryButtonByText(container, /delete account/i)).toBeUndefined();
    });
  });

  describe('change password', () => {
    it('renders change password button when handler is provided', async () => {
      const { container } = renderSurface(<ProfileSurface config={buildConfig()} />);

      await expectText(container, 'Change Password');
      const changePasswordButton = getButtonByText(container, /change password/i);
      expect(changePasswordButton).toBeInTheDocument();
    });

    it('does not render change password button when handler is not provided', async () => {
      const config = buildConfig({
        behavior: {
          ...buildConfig().behavior,
          onPasswordChange: undefined,
        },
      });

      const { container } = renderSurface(<ProfileSurface config={config} />);

      await expectText(container, 'Personal Information');
      expect(queryButtonByText(container, /change password/i)).toBeUndefined();
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

      const { container } = renderSurface(<ProfileSurface config={config} />);

      await expectText(container, 'No profile sections');
    });
  });

  describe('sidebar layout', () => {
    it('renders in sidebar layout without error', async () => {
      const config = buildConfig({
        visual: { layout: 'sidebar' },
      });

      const { container } = renderSurface(<ProfileSurface config={config} />);

      await expectText(container, 'Personal Information');
    });
  });
});
