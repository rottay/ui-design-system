/** @fileoverview WizardSurface tests -- step progression, validation gating, and back/next. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WizardSurface } from '..';
import type { WizardSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';
import { mockMatchMedia } from '../../../../../../../tooling/testing/helpers/browser/match-media';
import { ResponsiveContext, type ResponsiveContextValue } from '../../../../../../../infrastructure/runtime/responsive';

const UNRESOLVED_PHONE_CONTEXT: ResponsiveContextValue = {
  hasResolvedViewport: false,
  deviceClass: 'phone',
  activeBreakpoint: 'xs',
  isPhone: true,
  isTablet: false,
  isDesktop: false,
  pointer: 'coarse',
  orientation: 'portrait',
  prefersReducedMotion: true,
  isPhoneOrTablet: true,
  isTabletOrDesktop: false,
  isTouchDevice: true,
  virtualKeyboardInset: 0,
  isVirtualKeyboardOpen: false,
};

function buildConfig(overrides?: Partial<WizardSurfaceConfig>): WizardSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: {
        title: 'Setup flow',
      },
    },
    behavior: {
      steps: [
        {
          key: 'review',
          title: 'Review',
          content: <div>Review the setup</div>,
        },
      ],
      initialValues: {
        region: 'us-east-1',
      },
      submitAction: {
        id: 'complete-setup',
        label: 'Complete setup',
        variant: 'primary',
        onClick: vi.fn(),
      },
    },
    permissions: undefined,
    ...overrides,
  };
}

describe('WizardSurface', () => {
  beforeEach(() => {
    mockMatchMedia(1280);
  });

  it('routes completion through submitAction with the resolved values', async () => {
    const config = buildConfig();

    renderSurface(<WizardSurface config={config} />);

    fireEvent.click(await screen.findByRole('button', { name: /Complete setup/i }));

    await waitFor(() => {
      expect(config.behavior.submitAction.onClick).toHaveBeenCalledWith({
        region: 'us-east-1',
      });
    });
  });

  it('hides the complete action when submitAction is denied by permissions', async () => {
    const config = buildConfig({
      permissions: {
        granted: [],
        actions: {
          'complete-setup': {
            permission: 'setup:complete',
          },
        },
      },
    });

    renderSurface(<WizardSurface config={config} />);

    expect(await screen.findByText('Review the setup')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Complete setup/i })).not.toBeInTheDocument();
  });

  it('keeps a raw mobile config on rail and inline actions until explicitly opted in', async () => {
    mockMatchMedia(390);

    renderSurface(<WizardSurface config={buildConfig()} />);

    expect(await screen.findByText('Review the setup')).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByTestId('step-wizard-action-dock')).toBeNull();
    expect(document.querySelector('[data-part="step-rail"]')).not.toBeNull();
  });

  it('keeps phone progress and actions inline until the viewport snapshot resolves', async () => {
    const config = buildConfig({
      visual: {
        compactStepsOnMobile: true,
        mobileActionsSticky: true,
      },
    });
    const renderAtResolution = (hasResolvedViewport: boolean) => (
      <ResponsiveContext.Provider value={{ ...UNRESOLVED_PHONE_CONTEXT, hasResolvedViewport }}>
        <WizardSurface config={config} />
      </ResponsiveContext.Provider>
    );

    const unresolved = renderSurface(renderAtResolution(false));

    expect(await screen.findByText('Review the setup')).toBeInTheDocument();
    expect(screen.queryByTestId('step-wizard-action-dock')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    unresolved.unmount();

    renderSurface(renderAtResolution(true));

    expect(await screen.findByRole('status', { name: 'Step 1 of 1: Review' })).toBeInTheDocument();
    expect(await screen.findByTestId('step-wizard-action-dock')).toHaveAttribute('data-mode', 'fixed');
  });

  it('uses a mobile counter and dock without blocking dirty step changes', async () => {
    mockMatchMedia(390);
    const confirmDiscard = vi.fn(() => false);
    const onCancel = vi.fn();
    const config = buildConfig({
      visual: {
        compactStepsOnMobile: true,
        mobileActionsSticky: true,
      },
      behavior: {
        ...buildConfig().behavior,
        steps: [
          {
            key: 'details',
            title: 'Details',
            content: <div>Enter details</div>,
            layout: 'grid',
            columns: 3,
            fields: [
              {
                fieldId: 'setup-name',
                name: 'name',
                label: 'Name',
                type: 'text',
                colSpan: 3,
              },
            ],
          },
          {
            key: 'review',
            title: 'Review',
            content: <div>Review details</div>,
          },
        ],
        dirtyState: {
          isDirty: true,
          confirmDiscard,
        },
        cancelAction: {
          id: 'cancel-setup',
          label: 'Cancel',
          onClick: onCancel,
        },
      },
    });

    renderSurface(<WizardSurface config={config} />, {
      tenantOverrides: { locale: 'es' },
    });

    expect(await screen.findByRole('status', { name: 'Paso 1 de 2: Details' })).toBeInTheDocument();
    expect(await screen.findByTestId('step-wizard-action-dock')).toHaveAttribute('data-mode', 'fixed');
    expect(document.querySelector('form [style*="grid-template-columns"]')).toBeNull();
    expect(document.querySelector('form [style*="grid-column"]')).toBeNull();

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    expect(confirmDiscard).toHaveBeenCalledWith('¿Descartar los cambios sin guardar del asistente?', 'cancel');
    expect(onCancel).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Review details')).toBeInTheDocument();
    expect(confirmDiscard).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status', { name: 'Paso 2 de 2: Review' })).toBeInTheDocument();
  });

  it('disables mobile draft and completion actions without disabling cancel', async () => {
    mockMatchMedia(390);
    const config = buildConfig({
      visual: { mobileActionsSticky: true },
      behavior: {
        ...buildConfig().behavior,
        disabled: true,
        cancelAction: {
          id: 'cancel-setup',
          label: 'Cancel',
          onClick: vi.fn(),
        },
        saveDraftAction: {
          id: 'save-draft',
          label: 'Save draft',
          onClick: vi.fn(),
        },
      },
    });

    renderSurface(<WizardSurface config={config} />);

    expect(await screen.findByTestId('step-wizard-action-dock')).toHaveAttribute('data-mode', 'fixed');
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Complete setup' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled();
  });
});
