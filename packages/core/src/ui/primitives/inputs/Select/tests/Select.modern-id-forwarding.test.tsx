import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernSelect from '../engines/modern';

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
];

/**
 * `id` reached the native `<select>` only. The moment a consumer added
 * `searchable`, `multiple`, `optionGroups` or `virtual`, the custom trigger
 * rendered instead and the id vanished — so every external reference to it
 * dangled: `aria-labelledby`/`aria-controls` from sibling chrome, anchor
 * targets, and `Form.scrollToField`, which resolves the id Form.Item minted for
 * its child. The asymmetry is what made it dangerous: `aria-label`,
 * `aria-invalid` and `aria-describedby` all survive on that path, so the
 * control still looked wired up.
 */
describe('Select modern id forwarding', () => {
  it('keeps an external aria reference resolvable on the custom trigger path', () => {
    render(
      <>
        <span id="fav-team-label">Favourite team</span>
        <ModernSelect id="fav-team" searchable aria-labelledby="fav-team-label" options={OPTIONS} />
      </>
    );

    // The named node is the SAME element the id resolves to, so anything
    // pointing at `#fav-team` reaches the real control.
    const named = screen.getByRole('combobox', { name: 'Favourite team' });
    expect(document.getElementById('fav-team')).toBe(named);
    expect(named).toHaveAttribute('data-part', 'trigger');
  });

  it('forwards the id on every custom-path variant', () => {
    for (const props of [{ searchable: true }, { multiple: true }, { virtual: true }] as const) {
      const view = render(<ModernSelect id="scoped" options={OPTIONS} {...props} />);
      expect(document.getElementById('scoped')).toHaveAttribute('data-part', 'trigger');
      view.unmount();
    }
  });

  it('still carries the id on the native path', () => {
    const { container } = render(<ModernSelect id="native-one" options={OPTIONS} />);
    const native = container.querySelector('select');
    expect(native).not.toBeNull();
    expect(native).toHaveAttribute('id', 'native-one');
  });
});
