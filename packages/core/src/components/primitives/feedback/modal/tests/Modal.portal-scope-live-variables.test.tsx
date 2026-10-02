/**
 * An open modal's portaled dialog follows a live inline `--ds-*` change on its
 * mount lineage, with no scope attribute change to force a re-snapshot.
 */
import React from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernModal from '../engines/modern';

const flushMutations = () => act(async () => {
  await Promise.resolve();
});

beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
  }
});

afterEach(() => {
  cleanup();
  document.getElementById('rottay-portal-root')?.remove();
});

describe('Modal modern -- live portal variables', () => {
  it('re-stamps an ancestor inline --ds-* flip onto the open dialog', async () => {
    const { getByTestId } = render(
      <I18nProvider locale="en">
        <div data-ds-root="" data-tenant="acme" data-density="comfortable">
          <div data-testid="shell" style={{ '--ds-command-palette-search-gap': '6px' } as React.CSSProperties}>
            <ModernModal open onClose={vi.fn()} aria-label="m">
              <span data-probe="content">body</span>
            </ModernModal>
          </div>
        </div>
      </I18nProvider>,
    );
    const dialog = document.querySelector<HTMLDialogElement>('dialog')!;
    const read = () => dialog.style.getPropertyValue('--ds-command-palette-search-gap');
    expect(read()).toBe('6px');

    const shell = getByTestId('shell');
    shell.style.setProperty('--ds-command-palette-search-gap', '61px');
    await flushMutations();

    expect(dialog.getAttribute('data-density')).toBe('comfortable');
    expect(read()).toBe('61px');
  });
});
