/**
 * The composition guard where it actually bites: real overlays whose content is
 * a text field an IME writes into.
 *
 * A select's filter inside a popover is the worst case -- the candidate session
 * and the layer holding it die on the same keystroke -- and a dropdown is the
 * other blocking consumer of the same router. The modal is NOT here: it
 * registers its layer without an Escape handler and closes through the native
 * `<dialog>` cancel step instead, which the browser already withholds during
 * composition.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Popover } from '@/components/primitives/overlay/popover/engines/modern';
import ModernDropdown from '@/components/primitives/overlay/dropdown/engines/modern';
import ModernSelect from '@/components/primitives/inputs/select/engines/modern';

/** The keydown a browser dispatches while an IME owns the key. */
const COMPOSING = { isComposing: true, keyCode: 229 } as const;

const OPTIONS = [
  { value: 'tokyo', label: 'Tokyo' },
  { value: 'toronto', label: 'Toronto' },
];

describe('a select filter inside a popover survives a composed Escape', () => {
  function SelectInPopover({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
    return (
      <Popover
        open
        onOpenChange={onOpenChange}
        title="Assign"
        content={<ModernSelect options={OPTIONS} showSearch placeholder="Pick a city" />}
      >
        <button type="button">Details</button>
      </Popover>
    );
  }

  it('keeps the popover open while the composition is live', () => {
    const onOpenChange = vi.fn();
    render(<SelectInPopover onOpenChange={onOpenChange} />);

    fireEvent.keyDown(document, { key: 'Escape', ...COMPOSING });

    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole('dialog', { name: 'Assign' })).toBeInTheDocument();
  });

  it('closes on the plain Escape that follows', () => {
    const onOpenChange = vi.fn();
    render(<SelectInPopover onOpenChange={onOpenChange} />);

    fireEvent.keyDown(document, { key: 'Escape', ...COMPOSING });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('a dropdown survives a composed Escape', () => {
  const MENU = { items: [{ key: 'rename', label: 'Rename' }] };

  it('stays open while the composition is live, and closes on the next Escape', () => {
    const onOpenChange = vi.fn();
    render(
      <ModernDropdown open menu={MENU} trigger={['click']} onOpenChange={onOpenChange}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    fireEvent.keyDown(document, { key: 'Escape', ...COMPOSING });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
