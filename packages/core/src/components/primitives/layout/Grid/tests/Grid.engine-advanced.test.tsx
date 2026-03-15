import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ClassicGrid, ClassicGridItem } from '../engines/classic';
import ModernGrid, { ModernGridItem } from '../engines/modern';
import RusticGrid, { RusticGridItem } from '../engines/rustic';

describe('Grid advanced engine coverage', () => {
  it('covers classic grid responsive CSS, inline layout, spacing fallbacks, and item placement branches', () => {
    const { container } = render(
      <>
        <ClassicGrid
          inline
          columns={{ xs: 1, md: 3 }}
          rows={{ xs: 1, xl: 2 }}
          spacing="xl"
          columnGap="sm"
          rowGap={12}
          autoFlow="column"
          autoColumns="minmax(12rem, 1fr)"
          autoRows="minmax(4rem, auto)"
          alignItems="center"
          justifyItems="end"
          alignContent="space-between"
          justifyContent="space-around"
          width="100%"
          height="60vh"
          minHeight="20rem"
          maxWidth="80rem"
          data-testid="classic-responsive-grid"
        >
          <ClassicGridItem area="hero">Hero</ClassicGridItem>
          <ClassicGridItem
            colStart={2}
            colEnd={4}
            rowStart={1}
            rowEnd={3}
            alignSelf="stretch"
            justifySelf="center"
            zIndex={5}
          >
            Secondary
          </ClassicGridItem>
        </ClassicGrid>

        <ClassicGrid
          columns="2fr 1fr"
          rows={2}
          gap={8}
          placeItems="center"
          templateAreas={`"main side" "footer footer"`}
          data-testid="classic-template-grid"
        >
          <ClassicGridItem placeSelf="end">Placed</ClassicGridItem>
        </ClassicGrid>
      </>
    );

    const responsiveGrid = screen.getByTestId('classic-responsive-grid');
    const styleTag = container.querySelector('style');
    expect(responsiveGrid.style.display).toBe('inline-grid');
    expect(responsiveGrid.style.gap).toBe('2rem');
    expect(responsiveGrid.style.columnGap).toBe('0.5rem');
    expect(responsiveGrid.style.rowGap).toBe('12px');
    expect(responsiveGrid.style.gridAutoFlow).toBe('column');
    expect(responsiveGrid.style.gridAutoColumns).toBe('minmax(12rem, 1fr)');
    expect(responsiveGrid.style.gridAutoRows).toBe('minmax(4rem, auto)');
    expect(responsiveGrid.style.alignItems).toBe('center');
    expect(responsiveGrid.style.justifyItems).toBe('end');
    expect(responsiveGrid.style.alignContent).toBe('space-between');
    expect(responsiveGrid.style.justifyContent).toBe('space-around');
    expect(responsiveGrid.style.width).toBe('100%');
    expect(responsiveGrid.style.height).toBe('60vh');
    expect(responsiveGrid.style.minHeight).toBe('20rem');
    expect(responsiveGrid.style.maxWidth).toBe('80rem');
    expect(styleTag?.textContent).toContain('@media (min-width: 768px)');
    expect(styleTag?.textContent).toContain('@media (min-width: 1280px)');

    const classicItems = container.querySelectorAll('.rottay-grid-item--classic');
    expect(classicItems[0]).toHaveStyle({ gridArea: 'hero' });
    expect(classicItems[1]).toHaveStyle({
      gridColumn: '2 / 4',
      gridRow: '1 / 3',
      alignSelf: 'stretch',
      justifySelf: 'center',
      zIndex: '5',
    });

    expect(screen.getByTestId('classic-template-grid')).toHaveStyle({
      gridTemplateColumns: '2fr 1fr',
      gridTemplateRows: 'repeat(2, 1fr)',
      gridTemplateAreas: '"main side" "footer footer"',
      gap: '8px',
      placeItems: 'center',
    });
    expect(classicItems[2]).toHaveStyle({ placeSelf: 'end' });
  });

  it('covers modern grid class/style branches for auto/none columns, responsive templates, and item span helpers', () => {
    const { container } = render(
      <>
        <ModernGrid columns="auto" gap="xs" data-testid="modern-auto-grid">
          <ModernGridItem span={2} rowSpan={3}>Auto</ModernGridItem>
        </ModernGrid>

        <ModernGrid columns="none" gap="4xl" data-testid="modern-none-grid">
          <ModernGridItem area="sidebar">None</ModernGridItem>
        </ModernGrid>

        <ModernGrid
          columns={{ xs: 1, lg: 4 }}
          rows={{ xs: 1, md: 2 }}
          templateAreas={`"hero hero"`}
          autoFlow="row dense"
          autoColumns="minmax(8rem, 1fr)"
          autoRows="minmax(6rem, auto)"
          placeItems="stretch"
          data-testid="modern-responsive-grid"
        >
          <ModernGridItem colStart={2} colSpan={3} rowStart={1} rowSpan={2} placeSelf="center">
            Responsive
          </ModernGridItem>
        </ModernGrid>
      </>
    );

    expect(screen.getByTestId('modern-auto-grid')).toHaveClass('grid', 'grid-cols-auto', 'gap-1');
    expect(screen.getByTestId('modern-none-grid')).toHaveClass('grid', 'grid-cols-none', 'gap-16');

    const styleTag = container.querySelector('style');
    expect(screen.getByTestId('modern-responsive-grid')).toHaveStyle({
      gridTemplateAreas: '"hero hero"',
      gridAutoFlow: 'row dense',
      gridAutoColumns: 'minmax(8rem, 1fr)',
      gridAutoRows: 'minmax(6rem, auto)',
      placeItems: 'stretch',
    });
    expect(styleTag?.textContent).toContain('@media (min-width: 1024px)');

    const modernItems = container.querySelectorAll('.rottay-grid-item--modern');
    expect(modernItems[0]).toHaveClass('col-span-2', 'row-span-3');
    expect(modernItems[1]).toHaveStyle({ gridArea: 'sidebar' });
    expect(modernItems[2]).toHaveStyle({
      gridColumn: '2 / span 3',
      gridRow: '1 / span 2',
      placeSelf: 'center',
    });
  });

  it('covers modern grid fallbacks for undefined gaps, numeric gaps, string templates, explicit template overrides, and custom elements', () => {
    const { container } = render(
      <>
        <ModernGrid as="section" data-testid="modern-empty-grid" aria-label="Empty grid" />

        <ModernGrid
          columns={5}
          rows="auto auto"
          gap={10}
          alignItems="start"
          justifyItems="center"
          minHeight="12rem"
          maxWidth="64rem"
          data-testid="modern-numeric-grid"
        >
          <ModernGridItem colEnd={4} rowEnd={3} alignSelf="stretch" justifySelf="end">
            Numeric
          </ModernGridItem>
        </ModernGrid>

        <ModernGrid
          columns={{ xs: 1, lg: 3 }}
          rows={{ xs: 1, md: 2 }}
          templateColumns="240px 1fr"
          templateRows="auto 1fr"
          gap="none"
          columnGap="xl"
          rowGap={14}
          data-testid="modern-template-grid"
        >
          <ModernGridItem area="main">Template</ModernGridItem>
        </ModernGrid>
      </>
    );

    const emptyGrid = screen.getByTestId('modern-empty-grid');
    expect(emptyGrid.tagName).toBe('SECTION');
    expect(emptyGrid).not.toHaveAttribute('data-grid-id');

    expect(screen.getByTestId('modern-numeric-grid')).toHaveStyle({
      gridTemplateColumns: 'repeat(5, 1fr)',
      gridTemplateRows: 'auto auto',
      gap: '10px',
      alignItems: 'start',
      justifyItems: 'center',
      minHeight: '12rem',
      maxWidth: '64rem',
    });

    const numericItem = container.querySelector('.rottay-grid-item--modern');
    expect(numericItem).toHaveStyle({
      gridColumn: 'auto / 4',
      gridRow: 'auto / 3',
      alignSelf: 'stretch',
      justifySelf: 'end',
    });

    expect(screen.getByTestId('modern-template-grid')).toHaveClass('gap-0');
    expect(screen.getByTestId('modern-template-grid')).toHaveStyle({
      gridTemplateColumns: '240px 1fr',
      gridTemplateRows: 'auto 1fr',
      columnGap: '2rem',
      rowGap: '14px',
    });
    expect(container.querySelectorAll('.rottay-grid-item--modern')[1]).toHaveStyle({ gridArea: 'main' });
  });

  it('covers rustic grid fallbacks for template skipping, numeric/string resolution, responsive ids, and item alignment branches', () => {
    const { container } = render(
      <>
        <RusticGrid
          as="article"
          columns={4}
          rows="auto auto"
          gap={6}
          columnGap="lg"
          rowGap="sm"
          data-testid="rustic-numeric-grid"
        >
          <RusticGridItem colStart={2} colEnd={5} rowEnd={4} justifySelf="end" alignSelf="center">
            Numeric rustic
          </RusticGridItem>
        </RusticGrid>

        <RusticGrid
          columns={{ xs: 1, md: 2 }}
          rows={{ xs: 1, lg: 3 }}
          templateColumns="18rem 1fr"
          templateRows="auto 1fr"
          autoFlow="row dense"
          autoColumns="minmax(10rem, 1fr)"
          autoRows="minmax(3rem, auto)"
          placeItems="stretch"
          data-testid="rustic-responsive-grid"
        >
          <RusticGridItem area="content">Responsive rustic</RusticGridItem>
        </RusticGrid>
      </>
    );

    const numericGrid = screen.getByTestId('rustic-numeric-grid');
    expect(numericGrid.tagName).toBe('ARTICLE');
    expect(numericGrid).toHaveStyle({
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'auto auto',
      gap: '6px',
      columnGap: '1.5rem',
      rowGap: '0.5rem',
    });

    const numericItem = container.querySelector('.rottay-grid-item--rustic');
    expect(numericItem).toHaveStyle({
      gridColumn: '2 / 5',
      gridRow: 'auto / 4',
      justifySelf: 'end',
      alignSelf: 'center',
    });

    const responsiveGrid = screen.getByTestId('rustic-responsive-grid');
    expect(responsiveGrid).toHaveAttribute('data-grid-id');
    expect(responsiveGrid).toHaveStyle({
      gridTemplateColumns: '18rem 1fr',
      gridTemplateRows: 'auto 1fr',
      gridAutoFlow: 'row dense',
      gridAutoColumns: 'minmax(10rem, 1fr)',
      gridAutoRows: 'minmax(3rem, auto)',
      placeItems: 'stretch',
    });
    expect(container.querySelectorAll('.rottay-grid-item--rustic')[1]).toHaveStyle({ gridArea: 'content' });
    expect(container.querySelector('style')?.textContent).toContain('@media');
  });

  it('covers rustic inline auto/none layouts, size constraints, content alignment, and span-based item placement', () => {
    const { container } = render(
      <RusticGrid
        inline
        columns="auto"
        rows="none"
        spacing="md"
        alignItems="start"
        justifyItems="center"
        alignContent="space-evenly"
        justifyContent="space-between"
        width="75%"
        height="30rem"
        minHeight="12rem"
        maxWidth="72rem"
        data-testid="rustic-inline-grid"
      >
        <RusticGridItem span={2} rowSpan={3} placeSelf="end">
          Inline rustic
        </RusticGridItem>
      </RusticGrid>
    );

    const grid = screen.getByTestId('rustic-inline-grid');
    expect(grid).not.toHaveAttribute('data-grid-id');
    expect(grid).toHaveStyle({
      display: 'inline-grid',
      gridTemplateColumns: 'auto',
      gridTemplateRows: 'none',
      gap: '1rem',
      alignItems: 'start',
      justifyItems: 'center',
      alignContent: 'space-evenly',
      justifyContent: 'space-between',
      width: '75%',
      height: '30rem',
      minHeight: '12rem',
      maxWidth: '72rem',
    });

    expect(container.querySelector('.rottay-grid-item--rustic')).toHaveStyle({
      gridColumn: 'span 2',
      gridRow: 'span 3',
      placeSelf: 'end',
    });
  });
});
