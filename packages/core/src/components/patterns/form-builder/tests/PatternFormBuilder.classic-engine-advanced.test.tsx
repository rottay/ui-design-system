import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ClassicFormBuilder from '../engines/classic';

describe('PatternFormBuilder classic advanced coverage', () => {
  it('covers classic validation, field interactions, custom rendering, and submission', async () => {
    const onSubmit = vi.fn();
    const onChange = vi.fn();
    const onValidationChange = vi.fn();

    render(
      <ClassicFormBuilder
        title="Classic builder"
        description="Advanced field exercise"
        layout="grid"
        columns={2}
        onSubmit={onSubmit}
        onChange={onChange}
        onValidationChange={onValidationChange}
        fields={[
          { name: 'name', label: 'Name', type: 'text', placeholder: 'Name', required: true },
          { name: 'secret', label: 'Secret', type: 'password', placeholder: 'Secret' },
          {
            name: 'budget',
            label: 'Budget',
            type: 'number',
            placeholder: 'Budget',
            validation: { min: 10, max: 1000, message: 'Budget out of range' },
          },
          { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Notes' },
          { name: 'optIn', label: 'Opt in', type: 'checkbox' },
          {
            name: 'audience',
            label: 'Audience',
            type: 'radio',
            options: [
              { label: 'Internal', value: 'internal' },
              { label: 'Public', value: 'public' },
            ],
          },
          { name: 'featured', label: 'Featured', type: 'switch' },
          {
            name: 'preview',
            label: 'Preview',
            type: 'custom',
            render: (_field, value, setValue) => (
              <button type="button" onClick={() => setValue(`preview:${String(value ?? 'empty')}`)}>
                Update preview
              </button>
            ),
          },
          { name: 'fallback', label: 'Fallback', type: 'unknown' as any, placeholder: 'Fallback' },
        ]}
        actions={<button type="submit">Submit classic</button>}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /submit classic/i }));
    await waitFor(() => {
      expect(onValidationChange).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Launch' },
    });
    fireEvent.change(screen.getByPlaceholderText('Secret'), {
      target: { value: 'top-secret' },
    });
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '240' },
    });
    fireEvent.change(screen.getByPlaceholderText('Notes'), {
      target: { value: 'Detailed notes' },
    });
    const fallbackField = screen
      .getByText('Fallback')
      .closest('.ant-form-item')
      ?.querySelector('input');
    if (!(fallbackField instanceof HTMLInputElement)) {
      throw new Error('Expected fallback field input');
    }
    fireEvent.change(fallbackField, {
      target: { value: 'Fallback value' },
    });

    fireEvent.click(screen.getByRole('checkbox', { name: 'Opt in' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Public' }));
    fireEvent.click(screen.getByRole('switch'));
    fireEvent.click(screen.getByRole('button', { name: 'Update preview' }));
    fireEvent.click(screen.getByRole('button', { name: /submit classic/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Launch',
          secret: 'top-secret',
          budget: 240,
          notes: 'Detailed notes',
          fallback: 'Fallback value',
          audience: 'public',
          preview: 'preview:empty',
        })
      );
    });
    expect(onChange).toHaveBeenCalled();
  });
});
