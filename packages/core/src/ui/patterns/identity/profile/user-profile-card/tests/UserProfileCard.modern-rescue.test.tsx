import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithEngine } from '../../../../../../tooling/testing/helpers/engine';
import type { UserProfileCardProps } from '../contracts';
import ModernUserProfileCard from '../engines/modern';

function createProps(overrides: Partial<UserProfileCardProps> = {}): UserProfileCardProps {
  return {
    user: {
      name: 'Jane Doe',
      role: 'Product Manager',
      email: 'jane@example.com',
      department: 'Engineering',
      status: 'active',
    },
    ...overrides,
  };
}

function renderModern(overrides: Partial<UserProfileCardProps> = {}) {
  return renderWithEngine(<ModernUserProfileCard {...createProps(overrides)} />, 'modern');
}

describe('ModernUserProfileCard — keyboard operability', () => {
  it('promotes a clickable card with no nested controls to a real button', () => {
    const onClick = vi.fn();
    const { container } = renderModern({ onClick });
    const root = container.querySelector('[data-part="root"]');

    expect(root).toHaveAttribute('role', 'button');
    expect(root).toHaveAttribute('tabindex', '0');
  });

  it.each([['Enter'], [' ']])('activates the card with the %s key', (key) => {
    const onClick = vi.fn();
    const { container } = renderModern({ onClick });
    const root = container.querySelector('[data-part="root"]') as HTMLElement;

    fireEvent.keyDown(root, { key });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ignores unrelated keys', () => {
    const onClick = vi.fn();
    const { container } = renderModern({ onClick });

    fireEvent.keyDown(container.querySelector('[data-part="root"]') as HTMLElement, { key: 'a' });

    expect(onClick).not.toHaveBeenCalled();
  });

  it('leaves a non-clickable card out of the tab order', () => {
    const { container } = renderModern();
    const root = container.querySelector('[data-part="root"]');

    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('tabindex');
  });

  it('does not swallow a nested action tray behind role="button"', () => {
    // role="button" makes descendants presentational, so a card that owns
    // controls must stay a container or those controls leave the a11y tree.
    const onClick = vi.fn();
    const { container } = renderModern({
      onClick,
      actions: [{ key: 'msg', label: 'Message', onClick: vi.fn() }],
    });

    expect(container.querySelector('[data-part="root"]')).not.toHaveAttribute('role', 'button');
    expect(screen.getByRole('button', { name: 'Message' })).toBeInTheDocument();
  });

  it('does not swallow a caller header slot behind role="button"', () => {
    const { container } = renderModern({
      onClick: vi.fn(),
      headerExtra: <button type="button">Follow</button>,
    });

    expect(container.querySelector('[data-part="root"]')).not.toHaveAttribute('role', 'button');
    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument();
  });
});

describe('ModernUserProfileCard — avatar resilience', () => {
  it('falls back to the initial when the avatar URL fails', () => {
    const { container } = renderModern({
      user: { ...createProps().user, avatar: '/avatars/missing.png' },
    });

    const image = container.querySelector('[data-part="avatar"] img') as HTMLImageElement;
    expect(image).toBeInTheDocument();

    fireEvent.error(image);

    expect(container.querySelector('[data-part="avatar"] img')).toBeNull();
    expect(container.querySelector('[data-part="avatar-initial"]')).toHaveTextContent('J');
  });

  it('keeps the avatar decorative so the name is not announced twice', () => {
    const { container } = renderModern({
      user: { ...createProps().user, avatar: '/avatars/jane.png' },
    });

    expect(container.querySelector('[data-part="avatar"] img')).toHaveAttribute('alt', '');
  });

  it('takes the first grapheme of an astral-plane name, not half a surrogate', () => {
    const { container } = renderModern({ user: { name: '\u{1D49C}lice', role: 'Engineer' } });

    const initial = container.querySelector('[data-part="avatar-initial"]')?.textContent ?? '';
    expect(initial).toBe('\u{1D49C}');
    expect([...initial]).toHaveLength(1);
  });

  it('renders no initial for a whitespace-only name', () => {
    const { container } = renderModern({ user: { name: '   ', role: 'Engineer' } });

    expect(container.querySelector('[data-part="avatar-initial"]')).toHaveTextContent('');
  });
});

describe('ModernUserProfileCard — content integrity', () => {
  it('renders a human status label instead of the machine token', () => {
    const { container } = renderModern({ user: { ...createProps().user, status: 'away' } });

    expect(container.querySelector('[data-part="status-badge"]')).toHaveTextContent('Away');
  });

  it('bidi-isolates every caller-owned identity string', () => {
    const { container } = renderModern();

    for (const part of ['name', 'role', 'email', 'department-badge']) {
      expect(container.querySelector(`[data-part="${part}"] bdi`)).toBeInTheDocument();
    }
  });

  it('advertises the full name and role that the skin ellipsises', () => {
    const { container } = renderModern();

    expect(container.querySelector('[data-part="name"]')).toHaveAttribute('title', 'Jane Doe');
    expect(container.querySelector('[data-part="role"]')).toHaveAttribute('title', 'Product Manager');
  });

  it('gives the compact caller slot the same anatomy as the full card', () => {
    const { container } = renderModern({ variant: 'compact', headerExtra: <span>badge</span> });

    expect(container.querySelector('[data-part="header-extra"]')).toBeInTheDocument();
  });
});
