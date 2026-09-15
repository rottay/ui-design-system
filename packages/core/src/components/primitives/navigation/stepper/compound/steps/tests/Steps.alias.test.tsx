import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { Steps } from '..';

const ITEMS = [
  { title: 'Account', description: 'Create it' },
  { title: 'Profile', subTitle: 'Optional' },
  { title: 'Done' },
];

describe('Steps is the deprecated name of Stepper', () => {
  it('renders the Stepper family anatomy and maps the legacy size', async () => {
    const { container } = renderWithEngine(<Steps items={ITEMS} current={1} size="small" />, 'modern');
    const root = await screen.findByRole('navigation', { name: 'Progress steps' });
    expect(root.querySelector('.ds-stepper--modern')).not.toBeNull();
    expect(container.querySelector('[class*="steps"]')).toBeNull();
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-size', 'sm');
    const items = container.querySelectorAll('[data-part="item"]');
    expect(items[0]).toHaveAttribute('data-status', 'finish');
    expect(items[1]).toHaveAttribute('data-status', 'process');
    expect(items[2]).toHaveAttribute('data-status', 'wait');
    expect(screen.getByText('Optional')).toHaveAttribute('data-part', 'subtitle');
  });

  it('makes the steps clickable when onChange is given and keeps the one-argument callback', async () => {
    const onChange = vi.fn();
    renderWithEngine(<Steps items={ITEMS} current={0} onChange={onChange} />, 'modern');
    const profile = await screen.findByRole('button', { name: /Profile/ });
    fireEvent.click(profile);
    expect(onChange).toHaveBeenCalledWith(1);
    expect(onChange.mock.calls[0]).toHaveLength(1);
  });

  it('stays inert without onChange and seeds the uncontrolled position from initial', async () => {
    const { container } = renderWithEngine(<Steps items={ITEMS} initial={2} />, 'modern');
    await screen.findByRole('navigation');
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelectorAll('[data-part="item"]')[2]).toHaveAttribute('data-status', 'process');
  });

  it('maps the legacy single-argument progressDot render function', async () => {
    const { container } = renderWithEngine(
      <Steps
        items={ITEMS}
        current={1}
        progressDot={(info) => <span data-testid={`dot-${info.index}`}>{info.status}</span>}
      />,
      'modern',
    );
    await screen.findByRole('navigation');
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-progress-dot', 'true');
    expect(container.querySelectorAll('[data-part="dot-slot"]')).toHaveLength(3);
    expect(screen.getByTestId('dot-1')).toHaveTextContent('process');
  });

  it('announces finished and failed steps by name and marks the current step on the trigger', async () => {
    const { container } = renderWithEngine(
      <Steps items={[{ title: 'Details' }, { title: 'Payment', status: 'error' }, { title: 'Review' }]} current={2} onChange={vi.fn()} />,
      'modern',
    );
    await screen.findByRole('navigation');
    const items = Array.from(container.querySelectorAll('[data-part="item"]'));
    expect(items[0]).toHaveTextContent('Completed');
    expect(items[1]).toHaveTextContent('Error');
    expect(items[2].textContent).toBe('Review');
    const marked = container.querySelectorAll('[aria-current="step"]');
    expect(marked).toHaveLength(1);
    expect(marked[0].tagName).toBe('BUTTON');
    expect(items[2]).not.toHaveAttribute('aria-current');
  });

  it('keeps the current mark on the listitem for a non-interactive track', async () => {
    const { container } = renderWithEngine(<Steps items={ITEMS} current={1} />, 'modern');
    await screen.findByRole('navigation');
    const marked = container.querySelectorAll('[aria-current="step"]');
    expect(marked).toHaveLength(1);
    expect(marked[0].tagName).toBe('LI');
  });

  it('keeps an Arabic title intact under RTL and paints nothing inline', async () => {
    const title = 'إنشاء الحساب';
    const { container } = renderWithEngine(
      <div dir="rtl" lang="ar">
        <Steps items={[{ title, description: 'وصف' }, { title: 'الملف' }]} current={0} direction="vertical" />
      </div>,
      'modern',
    );
    await screen.findByRole('navigation');
    expect(screen.getByText(title)).toHaveAttribute('data-part', 'label');
    for (const el of container.querySelectorAll('[data-part]')) {
      expect((el as HTMLElement).getAttribute('style'), `${el.getAttribute('data-part')} carries inline style`).toBeNull();
    }
  });

  it('passes the explicit status and direction through and drops the legacy type', async () => {
    const { container } = renderWithEngine(
      <Steps items={ITEMS} current={1} status="error" direction="vertical" type="navigation" />,
      'modern',
    );
    await screen.findByRole('navigation');
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-direction', 'vertical');
    expect(root).not.toHaveAttribute('data-type');
    expect(container.querySelectorAll('[data-part="item"]')[1]).toHaveAttribute('data-status', 'error');
  });
});
