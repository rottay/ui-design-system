/**
 * Deprecated overlay/Modal adapter — canonical Modern Modal contract pins.
 *
 * The engine stamps parts; `modern/skin/overlay-modal.css` owns section
 * layout AND typography. These pins fail if typography/layout creeps back
 * inline, and if the English accessibility floor breaks when no
 * I18nProvider is mounted.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { Modal } from '..';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

function part(name: string): HTMLElement {
  const el = document.body.querySelector(`dialog [data-part='${name}']`);
  expect(el, `expected data-part='${name}'`).not.toBeNull();
  return el as HTMLElement;
}

describe('overlay/Modal compatibility adapter — skin ownership', () => {
  it('stamps header parts with NO inline layout or typography (the skin owns them)', async () => {
    renderWithEngine(
      <Modal engine="modern" open title="Decision review" description="Read-only summary" onClose={() => {}}>
        Body
      </Modal>,
      'modern',
    );

    expect(await screen.findByText('Decision review')).toBeInTheDocument();

    const header = part('header');
    expect(header.style.padding).toBe('');
    expect(header.style.display).toBe('');

    const title = part('title');
    expect(title.style.fontSize).toBe('');
    expect(title.style.fontWeight).toBe('');
    expect(title.style.lineHeight).toBe('');

    const description = part('description');
    expect(description.textContent).toBe('Read-only summary');
    expect(description.style.fontSize).toBe('');
    expect(description.style.lineHeight).toBe('');
    expect(description.style.marginTop).toBe('');
  });

  it('keeps the footer frame and close geometry skin-owned', async () => {
    renderWithEngine(
      <Modal
        engine="modern"
        open
        title="t"
        footer={<button type="button">Save</button>}
        onClose={() => {}}
      >
        Body
      </Modal>,
      'modern',
    );

    expect(await screen.findByText('Save')).toBeInTheDocument();

    const footer = part('footer');
    expect(footer.style.padding).toBe('');
    expect(footer.style.display).toBe('');

    const close = part('close-button');
    expect(close.style.width).toBe('');
    expect(close.style.height).toBe('');
    expect(close.style.display).toBe('');
  });
});

describe('overlay/Modal compatibility adapter — i18n English floor (no I18nProvider)', () => {
  it('resolves the close button label to the English floor and renders the semantic close icon', async () => {
    renderWithEngine(
      <Modal engine="modern" open title="t" onClose={() => {}}>
        Body
      </Modal>,
      'modern',
    );

    const close = await screen.findByRole('button', { name: 'Close' });
    expect(close).toHaveAttribute('data-part', 'close-button');
    // The semantic ActionCloseIcon renders decorative SVG, not a raw
    // hand-rolled path payload with inline sizing.
    const icon = close.querySelector('svg');
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});
