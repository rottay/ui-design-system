import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WizardSurface } from '..';
import type { WizardSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';
import { mockMatchMedia } from '@tests/support/browser/match-media';

function config(validate: () => boolean | string | Promise<boolean | string> = () => true): WizardSurfaceConfig {
  return {
    visual: { mobileActionsSticky: true },
    presentation: { chrome: { title: 'Setup' } },
    behavior: {
      steps: [
        { key: 'details', title: 'Details', content: <div>Details body</div>, validate },
        { key: 'review', title: 'Review', content: <div>Review body</div> },
      ],
      initialValues: { region: 'us' },
      submitAction: { id: 'complete', label: 'Finish', variant: 'primary', onClick: vi.fn() },
    },
  };
}

function mount(node: React.ReactElement) {
  return renderSurface(node, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
}

describe('WizardSurface real navigation postures', () => {
  beforeEach(() => mockMatchMedia(390));

  it.each(['bottom-bar', 'floating'] as const)('relocates existing validated controls once to %s', async (placement) => {
    const validate = vi.fn(() => true);
    const flow = config(validate);
    mount(<WizardSurface config={flow} postures={{ phone: { primaryAction: placement } }} />);
    const next = await screen.findByRole('button', { name: 'Next' });
    expect(screen.getAllByRole('button', { name: 'Next' })).toHaveLength(1);
    expect(next.closest('[data-surface-region="' + placement + '"]')).not.toBeNull();
    expect(screen.queryByTestId('step-wizard-action-dock')).toBeNull();
    fireEvent.click(next);
    const finish = await screen.findByRole('button', { name: 'Finish' });
    expect(validate).toHaveBeenCalledTimes(1);
    fireEvent.click(finish);
    await waitFor(() => expect(flow.behavior.submitAction.onClick).toHaveBeenCalledExactlyOnceWith({ region: 'us' }));
  });

  it.each(['hide', 'collapse'] as const)('does not mount navigation or an empty dock when primary action is %s', async (disposition) => {
    mount(<WizardSurface config={config()} postures={{ phone: { primaryAction: 'floating', regions: { 'primary-action': disposition } } }} />);
    await screen.findByText('Details body');
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
    expect(document.querySelector('[data-surface-region="floating"]')).toBeNull();
    const region = document.querySelector('[data-surface-region="primary-action"]');
    if (disposition === 'hide') expect(region).toBeNull();
    else expect(region).toBeEmptyDOMElement();
  });

  it('keeps app-bar inline even when the legacy mobile sticky flag is set', async () => {
    mount(<WizardSurface config={config()} postures={{ phone: { primaryAction: 'app-bar' } }} />);
    await screen.findByRole('button', { name: 'Next' });
    expect(screen.queryByTestId('step-wizard-action-dock')).toBeNull();
    expect(document.querySelector('[data-surface-region="bottom-bar"]')).toBeNull();
  });

  it('preserves the legacy sticky path when postures are omitted', async () => {
    mount(<WizardSurface config={config()} />);
    await screen.findByRole('button', { name: 'Next' });
    expect(screen.getByTestId('step-wizard-action-dock')).toBeInTheDocument();
    expect(document.querySelector('[data-surface-region="primary-action"]')).toBeNull();
  });

  it('keeps rejected validation in the current step after action relocation', async () => {
    const validate = vi.fn(() => 'Fix the details');
    mount(<WizardSurface config={config(validate)} postures={{ phone: { primaryAction: 'floating' } }} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    await screen.findByText('Fix the details');
    expect(screen.getByText('Details body')).toBeInTheDocument();
    expect(screen.queryByText('Review body')).toBeNull();
    expect(validate).toHaveBeenCalledTimes(1);
  });

  it('locks relocated navigation while validation is pending', async () => {
    let release: (result: boolean) => void = () => {};
    const pending = new Promise<boolean>((resolve) => { release = resolve; });
    const validate = vi.fn(() => pending);
    mount(<WizardSurface config={config(validate)} postures={{ phone: { primaryAction: 'bottom-bar' } }} />);
    const next = await screen.findByRole('button', { name: 'Next' });
    fireEvent.click(next);
    await waitFor(() => expect(next).toBeDisabled());
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    fireEvent.click(next);
    expect(validate).toHaveBeenCalledTimes(1);
    release(true);
    await screen.findByText('Review body');
    expect(await screen.findByRole('button', { name: 'Finish' })).toBeEnabled();
  });
});
