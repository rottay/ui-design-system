import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithEngineContext } from '@tests/support/engine';

import type { FieldDef } from '../../../../../foundation/contracts/runtime/components/patterns/core';
import ModernFormBuilder from '../engines/modern';

const render = (ui: React.ReactElement) => renderWithEngineContext(ui, 'classic');

const FIELDS: FieldDef[] = [
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'bio', label: 'Bio', type: 'textarea' },
];

describe('ModernFormBuilder loading transition', () => {
  it('keeps a stable hook order when loading resolves into the real schema', async () => {
    const onSubmit = vi.fn();

    const { rerender } = render(
      <ModernFormBuilder loading fields={FIELDS} onSubmit={onSubmit} />
    );

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');

    // The async-form path: `loading` flips true -> false with the same props.
    // While the skeleton returned above the `useMemo` calls this rerender
    // threw "Rendered more hooks than during the previous render."
    expect(() =>
      rerender(<ModernFormBuilder fields={FIELDS} onSubmit={onSubmit} />)
    ).not.toThrow();

    expect(screen.queryByRole('status')).toBeNull();
    // FormField is a lazily-mounted engine router, so the schema settles async.
    expect(await screen.findByLabelText(/Email/)).toBeInTheDocument();
    expect(await screen.findByLabelText(/Bio/)).toBeInTheDocument();
  });

  it('keeps a stable hook order when a resolved form falls back into loading', () => {
    const onSubmit = vi.fn();

    const { rerender } = render(
      <ModernFormBuilder fields={FIELDS} onSubmit={onSubmit} />
    );

    expect(() =>
      rerender(<ModernFormBuilder loading fields={FIELDS} onSubmit={onSubmit} />)
    ).not.toThrow();

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });
});
