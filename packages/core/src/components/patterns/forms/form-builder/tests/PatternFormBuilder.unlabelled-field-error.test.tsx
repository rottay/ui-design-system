import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { renderWithEngine } from '@tests/support/engine';
import ModernFormBuilder from '../engines/modern';

describe('ModernFormBuilder unlabelled-branch field error', () => {
  // The FormField branch owns its own error wiring; this branch had none, so a
  // rejected value was a red string no assistive tech ever announced.
  const submitInvalid = (
    field: { name: string; label: string; type: 'text' | 'checkbox' },
    showLabels: boolean,
  ) => {
    const { container } = renderWithEngine(
      <ModernFormBuilder
        showLabels={showLabels}
        fields={[{ ...field, required: true }]}
        onSubmit={() => undefined}
        actions={<button type="submit">Save</button>}
      />,
      'modern',
    );
    const form = container.querySelector('form');
    if (!form) throw new Error('the builder rendered no form element');
    fireEvent.submit(form);
    return container;
  };

  it('announces the error and ties it to the control it rejected', async () => {
    const container = submitInvalid({ name: 'email', label: 'Email', type: 'text' }, false);
    // The control is engine-resolved through Suspense, so it lands a tick later.
    await waitFor(() => expect(container.querySelector('input')).toBeTruthy());

    const error = container.querySelector('[data-part="field-error"]');
    expect(error).toBeTruthy();
    expect(error?.getAttribute('role')).toBe('alert');

    const errorId = error?.getAttribute('id');
    expect(errorId).toBeTruthy();

    const control = container.querySelector(`[aria-describedby~="${errorId}"]`);
    expect(control).toBeTruthy();
    expect(control?.getAttribute('aria-invalid')).toBe('true');
  });

  // A checkbox field always lands in this branch (showLabel excludes it), so
  // the native input — not a wrapper — has to carry the reference.
  it('ties a rejected checkbox to the alert on its own native input', async () => {
    const container = submitInvalid({ name: 'terms', label: 'Accept terms', type: 'checkbox' }, true);
    await waitFor(() => expect(container.querySelector('input[type="checkbox"]')).toBeTruthy());

    const error = container.querySelector('[data-part="field-error"]');
    expect(error?.getAttribute('role')).toBe('alert');
    const errorId = error?.getAttribute('id');
    expect(errorId).toBeTruthy();

    const box = container.querySelector('input[type="checkbox"]');
    const tokens = (box?.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    expect(tokens).toContain(errorId);
  });
});
