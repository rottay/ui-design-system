import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import type { StableEngineName } from '../../../../../tooling/testing/helpers/engine';
import { STABLE_ENGINES, renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import type { EmptyStateProps } from '../contracts';
import ClassicEmptyState from '../engines/classic';
import ModernEmptyState from '../engines/modern';
import RusticEmptyState from '../engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<EmptyStateProps>> = {
  classic: ClassicEmptyState,
  modern: ModernEmptyState,
  rustic: RusticEmptyState,
};

function createProps(overrides: Partial<EmptyStateProps> = {}): EmptyStateProps {
  return {
    title: 'No items found',
    description: 'Try adjusting your filters or creating a new item.',
    ...overrides,
  };
}

describe('PatternEmptyState', () => {
  // -----------------------------------------------------------------------
  // Basic rendering: title + description
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'renders title and description with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('No items found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or creating a new item.')).toBeInTheDocument();
    },
  );

  // -----------------------------------------------------------------------
  // Title only (no description)
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'renders with title only (no description) with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps({ description: undefined })} />, engine);

      expect(screen.getByText('No items found')).toBeInTheDocument();
      expect(screen.queryByText('Try adjusting your filters or creating a new item.')).not.toBeInTheDocument();
    },
  );

  // -----------------------------------------------------------------------
  // Custom icon
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'renders with a custom icon in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(
        <Component {...createProps({ icon: <span data-testid="custom-icon">ICON</span> })} />,
        engine,
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.getByText('ICON')).toBeInTheDocument();
    },
  );

  // -----------------------------------------------------------------------
  // Action button
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'renders an action button and fires onClick in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onClick = vi.fn();
      renderWithEngine(
        <Component
          {...createProps({
            action: { label: 'Create Item', onClick, variant: 'primary' },
          })}
        />,
        engine,
      );

      const button = screen.getByText('Create Item');
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    },
  );

  // -----------------------------------------------------------------------
  // Secondary action button
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'renders a secondary action button in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onPrimary = vi.fn();
      const onSecondary = vi.fn();
      renderWithEngine(
        <Component
          {...createProps({
            action: { label: 'Create', onClick: onPrimary, variant: 'primary' },
            secondaryAction: { label: 'Learn more', onClick: onSecondary },
          })}
        />,
        engine,
      );

      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.getByText('Learn more')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Learn more'));
      expect(onSecondary).toHaveBeenCalledTimes(1);
    },
  );

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'renders loading state in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps({ loading: true })} />, engine);

      // When loading, the title should not be visible (all engines hide content)
      expect(screen.queryByText('No items found')).not.toBeInTheDocument();
    },
  );

  // -----------------------------------------------------------------------
  // Size variants
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'renders with different sizes in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];

      for (const size of ['sm', 'md', 'lg'] as const) {
        const { unmount } = renderWithEngine(
          <Component {...createProps({ size })} />,
          engine,
        );

        expect(screen.getByText('No items found')).toBeInTheDocument();
        unmount();
      }
    },
  );

  // -----------------------------------------------------------------------
  // Accessibility: proper structural roles
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'has accessible text content available to screen readers in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onClick = vi.fn();
      const { container } = renderWithEngine(
        <Component
          {...createProps({
            action: { label: 'Add Item', onClick, variant: 'primary' },
          })}
        />,
        engine,
      );

      // Title text must be discoverable
      expect(screen.getByText('No items found')).toBeInTheDocument();

      // Description text must be discoverable
      expect(screen.getByText('Try adjusting your filters or creating a new item.')).toBeInTheDocument();

      // Action button must be a <button> element (all engines use <button> or Ant's Button)
      const buttons = container.querySelectorAll('button');
      const actionButton = Array.from(buttons).find(
        (btn) => btn.textContent?.includes('Add Item'),
      );
      expect(actionButton).toBeTruthy();
      expect(actionButton?.tagName).toBe('BUTTON');
    },
  );

  // -----------------------------------------------------------------------
  // Image prop
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'renders with an image instead of icon in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const { container } = renderWithEngine(
        <Component {...createProps({ image: '/empty.svg' })} />,
        engine,
      );

      const img = container.querySelector('img[src="/empty.svg"]');
      expect(img).not.toBeNull();
    },
  );

  // -----------------------------------------------------------------------
  // className and style passthrough
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'passes className and style to the root element in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const { container } = renderWithEngine(
        <Component
          {...createProps({ className: 'test-custom-class', style: { minHeight: 300 } })}
        />,
        engine,
      );

      const root = container.querySelector('.test-custom-class');
      expect(root).not.toBeNull();
    },
  );
});

describe('PatternEmptyState modern anatomy', () => {
  it('exposes its visual hierarchy and semantic fallback icon', () => {
    const { container } = renderWithEngine(
      <ModernEmptyState {...createProps({ size: 'lg' })} />,
      'modern',
    );

    const root = container.querySelector('[data-part="root"]');
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-visual', 'semantic-icon');
    expect(root).toHaveAttribute('data-has-description', 'true');
    expect(root).toHaveAttribute('data-has-action', 'false');
    expect(root).toHaveAttribute('aria-live', 'polite');
    // The semantic fallback occupies the same icon slot a custom icon uses.
    expect(container.querySelector('[data-part="visual"] > [data-part="icon"] [data-icon-name="communication.inbox"]')).not.toBeNull();
    expect(container.querySelector('[data-part="content"]')).not.toBeNull();
    expect(container.querySelector('[data-part="visual"]')).not.toBeNull();
    expect(container.querySelector('[data-part="copy"]')).not.toBeNull();
  });

  it('keeps the quiet-premium contract in the skin (status, not interactive)', () => {
    const skin = readFileSync(
      join(
        __dirname,
        '../../../../../foundation/tokens/css/runtime/engines/modern/skin/empty-state.css',
      ),
      'utf-8',
    );

    // A role=status region carries no root hover treatment and no glow
    // backdrop; reduced motion stills the spinner instead of slowing it.
    expect(skin).not.toMatch(/\[data-part='root'\]\[data-part='root'\]:hover/);
    expect(skin).not.toContain('radial-gradient');
    expect(skin).toContain('@media (prefers-reduced-motion: reduce)');
    expect(skin).toContain("[data-part='spinner']");
  });

  it('marks its action tray and uses explicit button types', () => {
    const { container } = renderWithEngine(
      <ModernEmptyState
        {...createProps({
          action: { label: 'Create', onClick: vi.fn(), variant: 'primary' },
          secondaryAction: { label: 'Import', onClick: vi.fn() },
        })}
      />,
      'modern',
    );

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-has-action', 'true');
    expect(container.querySelector('[data-part="actions"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Create' })).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button', { name: 'Import' })).toHaveAttribute('type', 'button');
  });
});
