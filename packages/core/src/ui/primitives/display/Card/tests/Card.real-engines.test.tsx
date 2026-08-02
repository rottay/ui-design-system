import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { Card } from '..';
import ClassicCard from '../engines/classic';
import ModernCard from '../engines/modern';
import RusticCard from '../engines/rustic';

describe('Card real engine coverage', () => {
  it('covers classic card branches with loading, cover, extra, and color variants', () => {
    const handleClick = vi.fn();

    const { rerender } = render(
      <ClassicCard
        title="Classic card"
        description="Classic description"
        cover="/classic.jpg"
        extra={<button type="button">Extra</button>}
        actions={[<button key="buy" type="button">Buy</button>]}
        variant="filled"
        colorVariant="success"
        padding="lg"
        radius="lg"
        divider={false}
        hoverable
        clickable
        onClick={handleClick}
      >
        Classic content
      </ClassicCard>
    );

    fireEvent.click(screen.getByText('Classic content'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Classic description')).toBeInTheDocument();
    expect(screen.getByText('Extra')).toBeInTheDocument();

    rerender(
      <ClassicCard title="Loading card" loading cover="/classic.jpg">
        Hidden content
      </ClassicCard>
    );

    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('covers modern card branches with loading and bottom cover', () => {
    const { container, rerender } = render(
      <ModernCard
        title="Modern card"
        description="Modern description"
        cover="/modern.jpg"
        coverPosition="bottom"
        extra={<button type="button">Action</button>}
        actions={[<button key="resolve" type="button">Resolve</button>]}
        variant="outlined"
        bordered
      >
        Modern content
      </ModernCard>
    );

    expect(screen.getByText('Modern content')).toBeInTheDocument();
    expect(screen.getByText('Resolve')).toBeInTheDocument();
    expect(container.querySelector('img[src="/modern.jpg"]')).toHaveAttribute('src', '/modern.jpg');

    rerender(
      <ModernCard loading cover="/modern.jpg">
        Modern content
      </ModernCard>
    );

    const root = container.querySelector('.ds-card--modern');
    const spinner = container.querySelector('[data-part="spinner"]');
    expect(root).toHaveAttribute('data-loading', 'true');
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(spinner?.tagName).toBe('SPAN');
  });

  it('uses canonical variant border surfaces for outlined and ghost cards', () => {
    // The skin stylesheet is the only place these chains live now. Reading the
    // component back would only prove it consumes a variable; reading the sheet
    // proves the tenant channel the variable names is the one that ships.
    const skin = readFileSync(
      join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/card.css'),
      'utf-8'
    );

    // C2 law: the edge grammar owns the border STYLE of containers, so the
    // bare `solid` keyword became a channel whose fallback preserves solid.
    // Pinned as a chain, tolerant of reformatting.
    expect(skin).toMatch(
      /border:\s*var\(\s*--ds-card-bordered-border-width\s*,\s*var\(\s*--ds-card-border-width\s*,\s*var\(\s*--ds-edge-standard-width\s*,\s*1px\s*\)\s*\)\s*\)\s+var\(\s*--ds-edge-standard-style\s*,\s*solid\s*\)\s+var\(\s*--ds-card-bordered-border-color\s*,\s*var\(\s*--ds-card-border\s*,\s*var\(\s*--ds-card-border-color\s*,\s*var\(\s*--ds-color-border-subtle\s*\)\s*\)\s*\)\s*\)/
    );
    expect(skin).toContain(
      'border: 0 solid var(--ds-card-border, var(--ds-card-ghost-border-color))'
    );
    expect(skin).not.toContain('var(--ds-card-border-width, 1px)');
  });

  it('covers modern card interactivity, color variants, and click handling', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <ModernCard
        title="Interactive modern"
        description="Interactive description"
        colorVariant="success"
        variant="elevated"
        hoverable
        clickable
        onClick={handleClick}
      >
        Interactive content
      </ModernCard>
    );

    const card = container.firstElementChild as HTMLDivElement;

    // The skin paints from a stylesheet this runtime never loads, so what is
    // assertable here is the state the component publishes and the rule the
    // sheet answers it with. The rendered pixels are measured against a real
    // cascade by `packages/showroom/e2e/visual/states.spec.ts`.
    expect(card).toHaveAttribute('data-interactive', 'true');
    expect(card).toHaveAttribute('data-actionable', 'true');
    expect(card).toHaveAttribute('data-variant', 'elevated');

    fireEvent.pointerEnter(card);
    expect(card.getAttribute('data-state')).toContain('hovered');

    const skin = readFileSync(
      join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/card.css'),
      'utf-8'
    );
    // Hover elevation resolves through the finite elevated material channel,
    // then falls back to the shared Card personality channel.
    expect(skin).toContain(
      "[data-interactive='true'][data-variant='elevated'][data-state~='hovered']"
    );
    expect(skin).toContain(
      'transform: var(--ds-card-interactive-transform-hover, var(--ds-card-hover-transform, translateY(-1px)))'
    );
    expect(skin).toContain(
      'box-shadow: var(--ds-card-elevated-shadow-hover, var(--ds-card-shadow-hover))'
    );

    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.pointerLeave(card);
    // At rest a part carries no state at all, so `[data-state~='hovered']` cannot
    // match it and the base rule's `translateY(0)` is what paints.
    expect(card).not.toHaveAttribute('data-state');
    expect(skin).toContain('transform: translateY(0)');
  });

  it('covers rustic card branches with keyboard/clickable/loading behavior', () => {
    const handleClick = vi.fn();
    const { container, rerender } = render(
      <RusticCard
        title="Rustic card"
        description="Rustic description"
        extra={<button type="button">More</button>}
        actions={[<button key="save" type="button">Save</button>]}
        cover="/rustic.jpg"
        colorVariant="warning"
        variant="elevated"
        hoverable
        clickable
        onClick={handleClick}
      >
        Rustic content
      </RusticCard>
    );

    const card = container.querySelector('.rottay-card--rustic') as HTMLDivElement;
    fireEvent.pointerEnter(card);
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(card).toHaveAttribute('role', 'button');
    expect(screen.getByText('Save')).toBeInTheDocument();

    rerender(
      <RusticCard loading title="Loading">
        Hidden content
      </RusticCard>
    );

    expect(container.querySelector('[aria-label="Loading"]')).toBeTruthy();
  });

  it('covers header, footer, and image compounds directly', () => {
    render(
      <>
        <Card.Header
          title="Header title"
          subtitle="Header subtitle"
          avatar={<span data-testid="avatar">A</span>}
          extra={<button type="button">Extra</button>}
        />
        <Card.Footer
          actions={[<button key="one" type="button">One</button>, <button key="two" type="button">Two</button>]}
        />
        <Card.Image
          src="/compound.jpg"
          alt="Compound image"
          aspectRatio="16 / 9"
          objectFit="contain"
        />
      </>
    );

    expect(screen.getByText('Header subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByAltText('Compound image')).toHaveAttribute('src', '/compound.jpg');
  });
});
