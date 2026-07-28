/**
 * MobileHeader modern-engine contract (Wave R2+R3).
 *
 * The colocated MobileHeader.test.tsx mocks `createEngineComponent` wholesale,
 * so it pins a re-implementation, not the shipped component. This suite renders
 * the REAL runtime through the modern engine and pins the anatomy the
 * mobile-header.css skin keys on, the i18n English floor, and the sticky
 * posture stamp.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { MobileHeader } from '..';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

const WAIT_TIMEOUT = 2000;

async function waitForRoot(container: HTMLElement): Promise<HTMLElement> {
  await waitFor(
    () => {
      if (!container.querySelector('.rottay-mobile-header[data-part="root"]')) {
        throw new Error('expected .rottay-mobile-header[data-part="root"] in <container>');
      }
    },
    { timeout: WAIT_TIMEOUT },
  );
  return container.querySelector('.rottay-mobile-header[data-part="root"]') as HTMLElement;
}

describe('MobileHeader (modern engine) contract', () => {
  it('stamps the data-part anatomy the skin keys on: root/left/right/trigger/label', async () => {
    const { container } = renderWithEngine(
      <MobileHeader title="Order Details" onBack={vi.fn()} rightActions={<span>edit</span>} />,
      'modern',
    );

    const root = await waitForRoot(container);
    expect(root.getAttribute('role')).toBe('banner');
    expect(root.getAttribute('data-sticky')).toBe('false');

    expect(container.querySelector('[data-part="left"]')).not.toBeNull();
    expect(container.querySelector('[data-part="right"]')).not.toBeNull();
    expect(container.querySelector('.rottay-mobile-header__title[data-part="label"]')).not.toBeNull();

    const trigger = container.querySelector('.rottay-mobile-header__back[data-part="trigger"]');
    expect(trigger).not.toBeNull();
    // Native button semantics: never an accidental form submit.
    expect(trigger?.getAttribute('type')).toBe('button');
    // i18n channel with English floor (no I18nProvider in this harness).
    expect(trigger?.getAttribute('aria-label')).toBe('Go back');
  });

  it('stamps data-sticky="true" in the sticky posture', async () => {
    const { container } = renderWithEngine(<MobileHeader title="Sticky" sticky />, 'modern');

    const root = await waitForRoot(container);
    expect(root.getAttribute('data-sticky')).toBe('true');
    expect((root as HTMLElement).style.position).toBe('sticky');
  });

  it('omits the back trigger when neither onBack nor leftAction is provided', async () => {
    const { container } = renderWithEngine(<MobileHeader title="Plain" />, 'modern');

    await waitForRoot(container);
    expect(container.querySelector('[data-part="trigger"]')).toBeNull();
    expect(container.querySelector('[data-part="left"]')).not.toBeNull();
  });
});
