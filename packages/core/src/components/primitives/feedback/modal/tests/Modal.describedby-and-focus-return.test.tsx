// `aria-describedby` may only reference ids that render, and must MERGE with a caller's.
// Unmounting an open dialog skips the native close steps, so focus is salvaged.

import React from 'react';
import { describe, expect, it } from 'vitest';
import { act } from '@testing-library/react';

import ModernModal from '../engines/modern';
import { renderWithEngine } from '@tests/support/engine';

describe('Modal modern engine describedby + focus return', () => {
  it('never points aria-describedby at a description a custom header suppressed', () => {
    const { container } = renderWithEngine(
      <ModernModal open header={<h2>Archive workspace</h2>} description="This cannot be undone." onClose={() => {}}>
        body
      </ModernModal>,
      'modern',
    );

    const doc = container.ownerDocument;
    const dialog = doc.querySelector('dialog') as HTMLElement;
    const describedBy = dialog.getAttribute('aria-describedby');

    // Either no reference at all, or one that resolves. A dangling id is the defect.
    for (const id of (describedBy ?? '').split(/\s+/).filter(Boolean)) {
      expect(doc.getElementById(id), `aria-describedby referenced a missing id: ${id}`).toBeTruthy();
    }
    // The description element genuinely does not render under a custom header.
    expect(doc.querySelector('[data-part="description"]')).toBeNull();
  });

  it('merges a caller aria-describedby with the modal own description', () => {
    const { container } = renderWithEngine(
      <>
        <p id="form-hint">Form level hint</p>
        <ModernModal open title="Delete record" description="This cannot be undone." aria-describedby="form-hint" onClose={() => {}}>
          body
        </ModernModal>
      </>,
      'modern',
    );

    const doc = container.ownerDocument;
    const dialog = doc.querySelector('dialog') as HTMLElement;
    const tokens = (dialog.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);

    expect(tokens).toContain('form-hint');
    const ownDescription = doc.querySelector('[data-part="description"]') as HTMLElement;
    expect(ownDescription).toBeTruthy();
    expect(tokens).toContain(ownDescription.id);
    for (const id of tokens) {
      expect(doc.getElementById(id), `aria-describedby referenced a missing id: ${id}`).toBeTruthy();
    }
  });

  it('returns focus to the invoker when an open modal unmounts without closing', () => {
    const doc = document;
    const invoker = doc.createElement('button');
    invoker.textContent = 'Open';
    doc.body.appendChild(invoker);
    act(() => {
      invoker.focus();
    });
    expect(doc.activeElement).toBe(invoker);

    const { unmount } = renderWithEngine(
      <ModernModal open title="Delete record" onClose={() => {}}>
        <button type="button" data-testid="inside">Confirm</button>
      </ModernModal>,
      'modern',
    );

    // A real browser's showModal() puts focus inside the dialog; happy-dom's
    // does not, so stand the user where the browser would have stood them.
    const inside = doc.querySelector('[data-testid="inside"]') as HTMLElement;
    act(() => {
      inside.focus();
    });
    expect(doc.activeElement).toBe(inside);

    // The `{show && <Modal open />}` shape: closing IS the unmount, so the
    // native close steps -- and their focus restore -- never run.
    act(() => {
      unmount();
    });

    expect(doc.activeElement).toBe(invoker);
    invoker.remove();
  });
});
