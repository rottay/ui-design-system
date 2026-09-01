import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import ModernRadio from '../engines/modern';

describe('Modern Radio native group behavior', () => {
  it('keeps exactly one radio checked when siblings share a name without Radio.Group', async () => {
    const user = userEvent.setup();

    render(
      <form>
        <ModernRadio name="plan" value="monthly" label="Monthly" defaultChecked />
        <ModernRadio name="plan" value="yearly" label="Yearly" />
      </form>,
    );

    expect(screen.getAllByRole('radio', { checked: true })).toHaveLength(1);

    await user.click(screen.getByRole('radio', { name: 'Yearly' }));

    expect(screen.getByRole('radio', { name: 'Yearly' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Monthly' })).not.toBeChecked();
    expect(screen.getAllByRole('radio', { checked: true })).toHaveLength(1);
  });

  it('does not deselect a radio when an unrelated native group changes', async () => {
    const user = userEvent.setup();

    render(
      <form>
        <ModernRadio name="plan" value="monthly" label="Monthly" defaultChecked />
        <ModernRadio name="billing" value="card" label="Card" />
      </form>,
    );

    await user.click(screen.getByRole('radio', { name: 'Card' }));

    expect(screen.getByRole('radio', { name: 'Monthly' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Card' })).toBeChecked();
  });
});

describe('Modern Radio accessible name', () => {
  it('keeps the description out of the accessible name and exposes it as a description', () => {
    render(
      <ModernRadio
        name="plan"
        value="yearly"
        label="Yearly"
        description="Two months included, renews every twelve months."
      />,
    );

    const radio = screen.getByRole('radio', { name: 'Yearly' });
    expect(radio).toHaveAccessibleName('Yearly');
    expect(radio).toHaveAccessibleDescription(
      'Two months included, renews every twelve months.',
    );
  });
});

describe('Modern Radio label click keeps aria in step with checkedness', () => {
  it('leaves exactly one radio checked AND one aria-checked after a visible-label click', async () => {
    const user = userEvent.setup();
    render(
      <>
        <ModernRadio name="plan" value="monthly" label="Monthly" defaultChecked />
        <ModernRadio name="plan" value="yearly" label="Yearly" description="Two months included." />
      </>
    );

    // click the visible LABEL text, the path a real user takes
    await user.click(screen.getByText('Yearly'));

    const monthly = screen.getByRole('radio', { name: /Monthly/ });
    const yearly = screen.getByRole('radio', { name: /Yearly/ });

    expect(yearly).toBeChecked();
    expect(monthly).not.toBeChecked();

    // no independent aria-checked: native checkedness IS the accessibility state
    expect(monthly).not.toHaveAttribute('aria-checked');
    expect(yearly).not.toHaveAttribute('aria-checked');
  });
});
