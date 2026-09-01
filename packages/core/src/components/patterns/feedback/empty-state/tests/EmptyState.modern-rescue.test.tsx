import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import type { EmptyStateProps } from '../contracts';
import ModernEmptyState from '../engines/modern';

const SKIN_PATH = join(
  __dirname,
  '../../../../../foundation/tokens/css/runtime/engines/modern/skin/empty-state/index.css',
);

function createProps(overrides: Partial<EmptyStateProps> = {}): EmptyStateProps {
  return {
    title: 'No items found',
    description: 'Try adjusting your filters or creating a new item.',
    ...overrides,
  };
}

function renderModern(overrides: Partial<EmptyStateProps> = {}) {
  return render(<ModernEmptyState {...createProps(overrides)} />);
}

describe('ModernEmptyState — illustration resilience', () => {
  it('falls back to the semantic glyph when the illustration fails', () => {
    const { container } = renderModern({ image: '/illustrations/missing.svg' });

    const image = container.querySelector('[data-part="image"]') as HTMLImageElement;
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-visual', 'image');

    fireEvent.error(image);

    expect(container.querySelector('[data-part="image"]')).toBeNull();
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-visual',
      'semantic-icon',
    );
    expect(
      container.querySelector('[data-part="icon"] [data-icon-name="communication.inbox"]'),
    ).not.toBeNull();
  });

  it('prefers a caller icon over the semantic glyph when the illustration dies', () => {
    const { container } = renderModern({
      image: '/illustrations/missing.svg',
      icon: <span data-testid="caller-icon" />,
    });

    fireEvent.error(container.querySelector('[data-part="image"]') as HTMLImageElement);

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-visual',
      'custom-icon',
    );
  });

  it('does not crop a non-square illustration inside the well', () => {
    // `cover` clipped every asset that was not square — an empty-state
    // illustration is content, so it must fit whole.
    const skin = readFileSync(SKIN_PATH, 'utf8');

    expect(skin).toContain('object-fit: contain;');
    expect(skin).not.toContain('object-fit: cover;');
  });
});

describe('ModernEmptyState — the skeleton holds the settled anatomy', () => {
  it('stamps the same anatomy contract while loading as it does when settled', async () => {
    const props = createProps({
      image: '/illustrations/empty.svg',
      action: { label: 'Create', onClick: vi.fn() },
    });

    const { container: busy } = render(<ModernEmptyState {...props} loading />);
    const { container: settled } = render(<ModernEmptyState {...props} />);
    await screen.findByRole('button', { name: 'Create' });

    const busyRoot = busy.querySelector('[data-part="root"]') as HTMLElement;
    const settledRoot = settled.querySelector('[data-part="root"]') as HTMLElement;

    for (const stamp of ['data-visual', 'data-has-description', 'data-has-action']) {
      expect(busyRoot.getAttribute(stamp)).toBe(settledRoot.getAttribute(stamp));
    }
    // The loading root's data-has-action must mirror the settled root, not hardcode false.
    expect(busyRoot).toHaveAttribute('data-has-action', 'true');
  });
});

describe('ModernEmptyState — action hierarchy and live-region scope', () => {
  it('gives an unlabelled primary action the primary treatment', async () => {
    const { container } = renderModern({
      action: { label: 'Create', onClick: vi.fn() },
      secondaryAction: { label: 'Learn more', onClick: vi.fn() },
    });
    await screen.findByRole('button', { name: 'Create' });

    expect(container.querySelector('[data-part="action"]')).toHaveAttribute(
      'data-variant',
      'primary',
    );
    expect(container.querySelector('[data-part="secondary-action"]')).toHaveAttribute(
      'data-variant',
      'default',
    );
  });

  it('honours an explicit action variant', async () => {
    const { container } = renderModern({
      action: { label: 'Create', onClick: vi.fn(), variant: 'default' },
    });
    await screen.findByRole('button', { name: 'Create' });

    expect(container.querySelector('[data-part="action"]')).toHaveAttribute(
      'data-variant',
      'default',
    );
  });

  it('keeps the action tray out of the polite live region', async () => {
    const { container } = renderModern({ action: { label: 'Create', onClick: vi.fn() } });
    await screen.findByRole('button', { name: 'Create' });

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('aria-live', 'polite');
    expect(container.querySelector('[data-part="actions"]')).toHaveAttribute('aria-live', 'off');
  });
});

describe('ModernEmptyState — bidi isolation', () => {
  it('isolates the caller-owned copy', () => {
    const { container } = renderModern();

    expect(container.querySelector('[data-part="title"] bdi')).toBeInTheDocument();
    expect(container.querySelector('[data-part="description"] bdi')).toBeInTheDocument();
  });
});
