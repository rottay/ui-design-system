import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { ModerationItem } from '../contracts';
import ModernModerationGallery from '../engines/modern';

function buildItems(ids: string[]): ModerationItem[] {
  return ids.map((id) => ({
    id,
    thumbnailUrl: `/media-${id}.jpg`,
    type: 'image' as const,
    status: 'pending' as const,
    uploadedBy: `user${id}`,
    uploadedAt: new Date().toISOString(),
  }));
}

/** Consumer that removes the triaged card, as a real moderation queue does. */
function Harness({ initial }: { initial: string[] }) {
  const [ids, setIds] = useState(initial);
  return (
    <ModernModerationGallery
      items={buildItems(ids)}
      selectable
      onApprove={(id) => setIds((prev) => prev.filter((entry) => entry !== id))}
      onBulkAction={() => undefined}
    />
  );
}

describe('Modern ModerationGallery — focus policy on card removal', () => {
  it('hands focus to the next surviving card when the triaged card unmounts', async () => {
    const user = userEvent.setup();
    render(<Harness initial={['a', 'b']} />);

    await user.click(screen.getByRole('button', { name: 'Approve media by usera' }));

    // Before: the card unmounted and focus fell to <body>.
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Approve media by userb' }),
      );
    });
  });

  it('hands focus to the grid root when the gallery empties', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness initial={['a']} />);

    await user.click(screen.getByRole('button', { name: 'Approve media by usera' }));

    await waitFor(() => {
      const root = container.querySelector('[data-part="root"]');
      expect(root).toHaveAttribute('tabindex', '-1');
      expect(document.activeElement).toBe(root);
    });
  });
});

describe('Modern ModerationGallery — selection announcer', () => {
  it('mounts the polite region empty so the first selection is announced', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ModernModerationGallery
        items={buildItems(['a', 'b'])}
        selectable
        onBulkAction={() => undefined}
      />,
    );

    // Before: the only aria-live node was the bulk count, which MOUNTED with
    // "1 selected" already inside it and so never announced it.
    const announcer = container.querySelector('[data-part="selection-announcer"]');
    expect(announcer).not.toBeNull();
    expect(announcer).toHaveAttribute('aria-live', 'polite');
    expect(announcer?.textContent).toBe('');

    await user.click(screen.getByRole('checkbox', { name: 'Select media by usera' }));

    await waitFor(() => {
      expect(
        container.querySelector('[data-part="selection-announcer"]')?.textContent,
      ).toBe('1 selected');
    });

    expect(container.querySelector('[data-part="bulk-count"]')).not.toHaveAttribute(
      'aria-live',
    );
  });
});
