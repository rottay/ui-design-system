import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { Card } from '../';
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
    expect(container.querySelector('figure img')).toHaveAttribute('src', '/modern.jpg');

    rerender(
      <ModernCard loading cover="/modern.jpg">
        Modern content
      </ModernCard>
    );

    const spinner = container.querySelector('svg');
    expect(spinner).toHaveAttribute('width', '28');
    expect(spinner).toHaveAttribute('height', '28');
  });

  it('covers modern card interactivity, color variants, and click handling', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <ModernCard
        title="Interactive modern"
        description="Interactive description"
        colorVariant="success"
        variant="filled"
        hoverable
        clickable
        onClick={handleClick}
      >
        Interactive content
      </ModernCard>
    );

    const card = container.querySelector('.card') as HTMLDivElement;
    expect(card.style.borderLeft).toContain('solid');
    expect(card.style.backgroundColor).not.toBe('');

    fireEvent.mouseEnter(card);
    expect(card.style.transform).toBe('var(--ds-card-hover-transform, translateY(-2px))');
    expect(card.style.boxShadow).toContain('var(--ds-card-hover-shadow');

    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.mouseLeave(card);
    expect(card.style.transform).toBe('translateY(0)');
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
    fireEvent.mouseEnter(card);
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
