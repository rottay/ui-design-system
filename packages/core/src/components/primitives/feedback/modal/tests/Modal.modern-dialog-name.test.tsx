/**
 * A custom `header` node suppresses the built-in title, so the dialog's name
 * must come from the heading group that actually renders it.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';

import ModernModal from '../engines/modern';
import { renderWithEngine } from '@tests/support/engine';

describe('Modal modern engine dialog name', () => {
  it('names the dialog from a custom header node', () => {
    const { container } = renderWithEngine(
      <ModernModal open header={<h2>Archive workspace</h2>} onClose={() => {}}>
        body
      </ModernModal>,
      'modern',
    );

    const dialog = container.ownerDocument.querySelector('dialog') as HTMLElement;
    expect(dialog).toBeTruthy();

    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();

    const namer = container.ownerDocument.getElementById(labelledBy as string);
    expect(namer).toBeTruthy();
    expect(namer?.textContent).toContain('Archive workspace');
  });

  it('still names the dialog from the built-in title when no header is given', () => {
    const { container } = renderWithEngine(
      <ModernModal open title="Delete record" onClose={() => {}}>
        body
      </ModernModal>,
      'modern',
    );

    const dialog = container.ownerDocument.querySelector('dialog') as HTMLElement;
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(container.ownerDocument.getElementById(labelledBy as string)?.textContent).toContain(
      'Delete record',
    );
  });

  it('an explicit aria-label still suppresses aria-labelledby', () => {
    const { container } = renderWithEngine(
      <ModernModal open header={<h2>Archive workspace</h2>} aria-label="Archive" onClose={() => {}}>
        body
      </ModernModal>,
      'modern',
    );

    const dialog = container.ownerDocument.querySelector('dialog') as HTMLElement;
    expect(dialog.getAttribute('aria-label')).toBe('Archive');
    expect(dialog.getAttribute('aria-labelledby')).toBeNull();
  });
});
