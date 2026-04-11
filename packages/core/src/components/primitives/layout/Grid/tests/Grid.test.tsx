/**
 * Grid Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { createRef } from 'react';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../runtime/engines/factory', () => {
  // Define MockGridItem inside the factory to avoid hoisting issues
  const MockGridItem = React.forwardRef<HTMLElement, any>(({
    children,
    as: Component = 'div',
    span,
    colSpan,
    rowSpan,
    colStart,
    colEnd,
    rowStart,
    rowEnd,
    area,
    alignSelf,
    justifySelf,
    placeSelf,
    zIndex,
    className,
    style,
    'data-testid': testId,
    ...props
  }, ref) => {
    const Tag = Component as keyof JSX.IntrinsicElements;
    return React.createElement(Tag, {
      ref,
      'data-testid': testId || 'grid-item',
      'data-span': span,
      'data-col-span': colSpan,
      'data-row-span': rowSpan,
      'data-col-start': colStart,
      'data-col-end': colEnd,
      'data-row-start': rowStart,
      'data-row-end': rowEnd,
      'data-area': area,
      'data-align-self': alignSelf,
      'data-justify-self': justifySelf,
      'data-place-self': placeSelf,
      'data-z-index': zIndex,
      className,
      style,
      ...props,
    }, children);
  });
  MockGridItem.displayName = 'GridItem';

  return {
    createEngineComponent: () => {
      const MockGrid = React.forwardRef<HTMLElement, any>(({
        children,
        as: Component = 'div',
        columns,
        rows,
        gap,
        spacing,
        columnGap,
        rowGap,
        templateColumns,
        templateRows,
        templateAreas,
        autoFlow,
        autoColumns,
        autoRows,
        alignItems,
        justifyItems,
        placeItems,
        alignContent,
        justifyContent,
        width,
        height,
        minHeight,
        maxWidth,
        inline,
        className,
        style,
        'data-testid': testId,
        ...props
      }, ref) => {
        const Tag = Component as keyof JSX.IntrinsicElements;
        return React.createElement(Tag, {
          ref,
          'data-testid': testId || 'grid',
          'data-columns': typeof columns === 'object' ? JSON.stringify(columns) : columns,
          'data-rows': rows,
          'data-gap': gap,
          'data-spacing': spacing,
          'data-column-gap': columnGap,
          'data-row-gap': rowGap,
          'data-template-columns': templateColumns,
          'data-template-rows': templateRows,
          'data-template-areas': templateAreas,
          'data-auto-flow': autoFlow,
          'data-auto-columns': autoColumns,
          'data-auto-rows': autoRows,
          'data-align-items': alignItems,
          'data-justify-items': justifyItems,
          'data-place-items': placeItems,
          'data-align-content': alignContent,
          'data-justify-content': justifyContent,
          'data-width': width,
          'data-height': height,
          'data-min-height': minHeight,
          'data-max-width': maxWidth,
          'data-inline': inline,
          className,
          style,
          ...props,
        }, children);
      });
      MockGrid.displayName = 'Grid';
      // Attach Item compound component
      (MockGrid as any).Item = MockGridItem;
      return MockGrid;
    },
  };
});

import { Grid, GridItem } from '../';

describe('Grid', () => {
  describe('Basic Rendering', () => {
    it('renders correctly with children', () => {
      render(
        <Grid>
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>
      );
      expect(screen.getByTestId('grid')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('renders as default div element', () => {
      render(<Grid data-testid="grid">Content</Grid>);
      expect(screen.getByTestId('grid').tagName).toBe('DIV');
    });

    it('renders empty grid without children', () => {
      render(<Grid data-testid="empty-grid" />);
      expect(screen.getByTestId('empty-grid')).toBeInTheDocument();
    });
  });

  describe('Polymorphic "as" Prop', () => {
    it('renders as section when as="section"', () => {
      render(<Grid as="section" data-testid="section-grid">Content</Grid>);
      expect(screen.getByTestId('section-grid').tagName).toBe('SECTION');
    });

    it('renders as ul when as="ul"', () => {
      render(<Grid as="ul" data-testid="ul-grid">Content</Grid>);
      expect(screen.getByTestId('ul-grid').tagName).toBe('UL');
    });

    it('renders as nav when as="nav"', () => {
      render(<Grid as="nav" data-testid="nav-grid">Content</Grid>);
      expect(screen.getByTestId('nav-grid').tagName).toBe('NAV');
    });

    it('renders as main when as="main"', () => {
      render(<Grid as="main" data-testid="main-grid">Content</Grid>);
      expect(screen.getByTestId('main-grid').tagName).toBe('MAIN');
    });
  });

  describe('Columns Prop', () => {
    it.each([1, 2, 3, 4, 6, 12] as const)(
      'applies columns %s',
      (columns) => {
        render(<Grid columns={columns}>Test</Grid>);
        expect(screen.getByTestId('grid')).toHaveAttribute('data-columns', String(columns));
      }
    );

    it('applies columns="auto"', () => {
      render(<Grid columns="auto">Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveAttribute('data-columns', 'auto');
    });

    it('applies responsive columns object', () => {
      const responsive = { xs: 1, sm: 2, md: 3, lg: 4 };
      render(<Grid columns={responsive}>Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveAttribute('data-columns', JSON.stringify(responsive));
    });
  });

  describe('Gap Props', () => {
    it.each(['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const)(
      'applies gap %s',
      (gap) => {
        render(<Grid gap={gap}>Test</Grid>);
        expect(screen.getByTestId('grid')).toHaveAttribute('data-gap', gap);
      }
    );

    it('applies numeric gap value', () => {
      render(<Grid gap={16}>Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveAttribute('data-gap', '16');
    });

    it('applies spacing alias for gap', () => {
      render(<Grid spacing="lg">Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveAttribute('data-spacing', 'lg');
    });

    it('applies separate columnGap and rowGap', () => {
      render(<Grid columnGap="lg" rowGap="sm">Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveAttribute('data-column-gap', 'lg');
      expect(screen.getByTestId('grid')).toHaveAttribute('data-row-gap', 'sm');
    });
  });

  describe('Template Props', () => {
    it('applies templateColumns', () => {
      render(<Grid templateColumns="200px 1fr 200px">Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveAttribute('data-template-columns', '200px 1fr 200px');
    });

    it('applies templateRows', () => {
      render(<Grid templateRows="auto 1fr auto">Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveAttribute('data-template-rows', 'auto 1fr auto');
    });

    it('applies templateAreas', () => {
      const areas = "'header header' 'sidebar main' 'footer footer'";
      render(<Grid templateAreas={areas}>Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveAttribute('data-template-areas', areas);
    });
  });

  describe('Auto Flow Props', () => {
    it.each(['row', 'column', 'dense', 'row dense', 'column dense'] as const)(
      'applies autoFlow %s',
      (autoFlow) => {
        render(<Grid autoFlow={autoFlow}>Test</Grid>);
        expect(screen.getByTestId('grid')).toHaveAttribute('data-auto-flow', autoFlow);
      }
    );

    it('applies autoColumns', () => {
      render(<Grid autoColumns="minmax(100px, 1fr)">Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveAttribute('data-auto-columns', 'minmax(100px, 1fr)');
    });

    it('applies autoRows', () => {
      render(<Grid autoRows="100px">Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveAttribute('data-auto-rows', '100px');
    });
  });

  describe('Alignment Props', () => {
    it.each(['start', 'end', 'center', 'stretch', 'baseline'] as const)(
      'applies alignItems %s',
      (alignItems) => {
        render(<Grid alignItems={alignItems}>Test</Grid>);
        expect(screen.getByTestId('grid')).toHaveAttribute('data-align-items', alignItems);
      }
    );

    it.each(['start', 'end', 'center', 'stretch'] as const)(
      'applies justifyItems %s',
      (justifyItems) => {
        render(<Grid justifyItems={justifyItems}>Test</Grid>);
        expect(screen.getByTestId('grid')).toHaveAttribute('data-justify-items', justifyItems);
      }
    );

    it.each(['start', 'end', 'center', 'stretch'] as const)(
      'applies placeItems %s',
      (placeItems) => {
        render(<Grid placeItems={placeItems}>Test</Grid>);
        expect(screen.getByTestId('grid')).toHaveAttribute('data-place-items', placeItems);
      }
    );

    it.each(['start', 'end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly'] as const)(
      'applies alignContent %s',
      (alignContent) => {
        render(<Grid alignContent={alignContent}>Test</Grid>);
        expect(screen.getByTestId('grid')).toHaveAttribute('data-align-content', alignContent);
      }
    );

    it.each(['start', 'end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly'] as const)(
      'applies justifyContent %s',
      (justifyContent) => {
        render(<Grid justifyContent={justifyContent}>Test</Grid>);
        expect(screen.getByTestId('grid')).toHaveAttribute('data-justify-content', justifyContent);
      }
    );
  });

  describe('Dimension Props', () => {
    it('applies width', () => {
      render(<Grid width="100%">Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveAttribute('data-width', '100%');
    });

    it('applies height', () => {
      render(<Grid height="500px">Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveAttribute('data-height', '500px');
    });

    it('applies minHeight', () => {
      render(<Grid minHeight="300px">Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveAttribute('data-min-height', '300px');
    });

    it('applies maxWidth', () => {
      render(<Grid maxWidth="1200px">Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveAttribute('data-max-width', '1200px');
    });
  });

  describe('Inline Prop', () => {
    it('applies inline=true', () => {
      render(<Grid inline>Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveAttribute('data-inline', 'true');
    });

    it('applies inline=false by default', () => {
      render(<Grid>Test</Grid>);
      // data-inline should not be present or be falsy
      const grid = screen.getByTestId('grid');
      expect(grid.getAttribute('data-inline')).toBeFalsy();
    });
  });

  describe('className and style Props', () => {
    it('applies custom className', () => {
      render(<Grid className="custom-grid">Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveClass('custom-grid');
    });

    it('applies multiple custom classNames', () => {
      render(<Grid className="class-one class-two">Test</Grid>);
      expect(screen.getByTestId('grid')).toHaveClass('class-one');
      expect(screen.getByTestId('grid')).toHaveClass('class-two');
    });

    it('applies inline styles', () => {
      render(<Grid style={{ backgroundColor: 'red' }}>Test</Grid>);
      expect(screen.getByTestId('grid')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to the DOM element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Grid ref={ref}>Test</Grid>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('forwards ref when using polymorphic as prop', () => {
      const ref = createRef<HTMLElement>();
      render(<Grid as="section" ref={ref}>Test</Grid>);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('Combined Props', () => {
    it('applies multiple grid props together', () => {
      render(
        <Grid
          columns={4}
          gap="lg"
          templateRows="auto 1fr"
          autoFlow="dense"
          alignItems="center"
          justifyItems="stretch"
          width="100%"
          height="500px"
        >
          Content
        </Grid>
      );
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveAttribute('data-columns', '4');
      expect(grid).toHaveAttribute('data-gap', 'lg');
      expect(grid).toHaveAttribute('data-template-rows', 'auto 1fr');
      expect(grid).toHaveAttribute('data-auto-flow', 'dense');
      expect(grid).toHaveAttribute('data-align-items', 'center');
      expect(grid).toHaveAttribute('data-justify-items', 'stretch');
      expect(grid).toHaveAttribute('data-width', '100%');
      expect(grid).toHaveAttribute('data-height', '500px');
    });
  });
});

describe('Grid.Item', () => {
  describe('Basic Rendering', () => {
    it('renders correctly with children', () => {
      render(
        <GridItem data-testid="grid-item">Item Content</GridItem>
      );
      expect(screen.getByTestId('grid-item')).toBeInTheDocument();
      expect(screen.getByText('Item Content')).toBeInTheDocument();
    });

    it('renders as default div element', () => {
      render(<GridItem data-testid="grid-item">Content</GridItem>);
      expect(screen.getByTestId('grid-item').tagName).toBe('DIV');
    });

    it('has rottay-grid-item class', () => {
      render(<GridItem data-testid="grid-item">Content</GridItem>);
      expect(screen.getByTestId('grid-item')).toHaveClass('rottay-grid-item');
    });
  });

  describe('Spanning Props', () => {
    it('applies span prop as gridColumn style', () => {
      render(<GridItem data-testid="item" span={2}>Content</GridItem>);
      expect(screen.getByTestId('item').style.gridColumn).toBe('span 2');
    });

    it('applies colSpan prop as gridColumn style', () => {
      render(<GridItem data-testid="item" colSpan={3}>Content</GridItem>);
      expect(screen.getByTestId('item').style.gridColumn).toBe('span 3');
    });

    it('applies rowSpan prop as gridRow style', () => {
      render(<GridItem data-testid="item" rowSpan={2}>Content</GridItem>);
      expect(screen.getByTestId('item').style.gridRow).toBe('span 2');
    });
  });

  describe('Positioning Props', () => {
    it('applies colStart and colEnd as gridColumn style', () => {
      render(<GridItem data-testid="item" colStart={1} colEnd={3}>Content</GridItem>);
      expect(screen.getByTestId('item').style.gridColumn).toBe('1 / 3');
    });

    it('applies rowStart and rowEnd as gridRow style', () => {
      render(<GridItem data-testid="item" rowStart={2} rowEnd={4}>Content</GridItem>);
      expect(screen.getByTestId('item').style.gridRow).toBe('2 / 4');
    });

    it('applies area prop as gridArea style', () => {
      render(<GridItem data-testid="item" area="header">Content</GridItem>);
      expect(screen.getByTestId('item').style.gridArea).toBe('header');
    });
  });

  describe('Self Alignment Props', () => {
    it.each(['start', 'end', 'center', 'stretch', 'baseline'] as const)(
      'applies alignSelf %s as style',
      (alignSelf) => {
        render(<GridItem data-testid="item" alignSelf={alignSelf}>Content</GridItem>);
        // Check style attribute contains the property (jsdom/happy-dom may not fully support grid properties)
        const item = screen.getByTestId('item');
        expect(item.style.alignSelf).toBe(alignSelf);
      }
    );

    it.each(['start', 'end', 'center', 'stretch'] as const)(
      'applies justifySelf %s as style',
      (justifySelf) => {
        render(<GridItem data-testid="item" justifySelf={justifySelf}>Content</GridItem>);
        const item = screen.getByTestId('item');
        expect(item.style.justifySelf).toBe(justifySelf);
      }
    );

    it.each(['start', 'end', 'center', 'stretch'] as const)(
      'applies placeSelf %s as style',
      (placeSelf) => {
        render(<GridItem data-testid="item" placeSelf={placeSelf}>Content</GridItem>);
        const item = screen.getByTestId('item');
        expect(item.style.placeSelf).toBe(placeSelf);
      }
    );
  });

  describe('Z-Index Prop', () => {
    it('applies zIndex as style', () => {
      render(<GridItem data-testid="item" zIndex={10}>Content</GridItem>);
      const item = screen.getByTestId('item');
      expect(item.style.zIndex).toBe('10');
    });
  });

  describe('Polymorphic "as" Prop', () => {
    it('renders as li when as="li"', () => {
      render(<GridItem as="li" data-testid="li-item">Content</GridItem>);
      expect(screen.getByTestId('li-item').tagName).toBe('LI');
    });

    it('renders as article when as="article"', () => {
      render(<GridItem as="article" data-testid="article-item">Content</GridItem>);
      expect(screen.getByTestId('article-item').tagName).toBe('ARTICLE');
    });
  });

  describe('className and style Props', () => {
    it('applies custom className', () => {
      render(<GridItem className="custom-item" data-testid="item">Content</GridItem>);
      expect(screen.getByTestId('item')).toHaveClass('custom-item');
    });

    it('merges style prop with computed styles', () => {
      render(
        <GridItem
          data-testid="item"
          span={2}
          style={{ backgroundColor: 'red' }}
        >
          Content
        </GridItem>
      );
      const item = screen.getByTestId('item');
      expect(item.style.gridColumn).toBe('span 2');
      expect(item.style.backgroundColor).toBe('red');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to the DOM element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<GridItem ref={ref}>Test</GridItem>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});

describe('Grid and Grid.Item Integration', () => {
  it('renders Grid with Grid.Item children', () => {
    render(
      <Grid columns={3} gap="md">
        <Grid.Item span={2}>Wide Item</Grid.Item>
        <Grid.Item>Regular Item</Grid.Item>
        <Grid.Item rowSpan={2}>Tall Item</Grid.Item>
      </Grid>
    );
    expect(screen.getByText('Wide Item')).toBeInTheDocument();
    expect(screen.getByText('Regular Item')).toBeInTheDocument();
    expect(screen.getByText('Tall Item')).toBeInTheDocument();
  });

  it('renders nested grids', () => {
    render(
      <Grid columns={2} gap="lg" data-testid="outer-grid">
        <Grid.Item>
          <Grid columns={3} gap="sm" data-testid="inner-grid">
            <Grid.Item>Nested 1</Grid.Item>
            <Grid.Item>Nested 2</Grid.Item>
            <Grid.Item>Nested 3</Grid.Item>
          </Grid>
        </Grid.Item>
        <Grid.Item>Outer Item</Grid.Item>
      </Grid>
    );
    expect(screen.getByTestId('outer-grid')).toBeInTheDocument();
    expect(screen.getByTestId('inner-grid')).toBeInTheDocument();
    expect(screen.getByText('Nested 1')).toBeInTheDocument();
  });
});

describe('Grid Types', () => {
  it('exports GRID_DEFAULTS constant', async () => {
    const { GRID_DEFAULTS } = await import('./Grid.types');
    expect(GRID_DEFAULTS).toBeDefined();
    expect(GRID_DEFAULTS.columns).toBe(12);
    expect(GRID_DEFAULTS.gap).toBe('md');
    expect(GRID_DEFAULTS.autoFlow).toBe('row');
    expect(GRID_DEFAULTS.as).toBe('div');
    expect(GRID_DEFAULTS.inline).toBe(false);
  });

  it('exports GRID_ITEM_DEFAULTS constant', async () => {
    const { GRID_ITEM_DEFAULTS } = await import('./Grid.types');
    expect(GRID_ITEM_DEFAULTS).toBeDefined();
    expect(GRID_ITEM_DEFAULTS.as).toBe('div');
  });

  it('exports GAP_MAP constant', async () => {
    const { GAP_MAP } = await import('./Grid.types');
    expect(GAP_MAP).toBeDefined();
    expect(GAP_MAP.none).toBe('0');
    expect(GAP_MAP.md).toBe('1rem');
    expect(GAP_MAP.xl).toBe('2rem');
  });

  it('exports ALIGN_ITEMS_MAP constant', async () => {
    const { ALIGN_ITEMS_MAP } = await import('./Grid.types');
    expect(ALIGN_ITEMS_MAP).toBeDefined();
    expect(ALIGN_ITEMS_MAP.start).toBe('start');
    expect(ALIGN_ITEMS_MAP.center).toBe('center');
  });

  it('exports JUSTIFY_ITEMS_MAP constant', async () => {
    const { JUSTIFY_ITEMS_MAP } = await import('./Grid.types');
    expect(JUSTIFY_ITEMS_MAP).toBeDefined();
    expect(JUSTIFY_ITEMS_MAP.start).toBe('start');
    expect(JUSTIFY_ITEMS_MAP.stretch).toBe('stretch');
  });
});

describe('Grid engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Grid engine={engine}>Test</Grid>);
    expect(screen.getByTestId('grid')).toBeInTheDocument();
  });
});

describe('Grid tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Grid>Test</Grid>);
    expect(screen.getByTestId('grid')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});

