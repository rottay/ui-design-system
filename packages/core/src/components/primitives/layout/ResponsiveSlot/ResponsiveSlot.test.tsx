/**
 * ResponsiveSlot Component - Unit Tests
 *
 * Tests cover device-alias mode (phone/tablet/desktop), standard breakpoint
 * mode (xs/sm/md/lg/xl/2xl), and the cascade fallback behaviour where missing
 * slots inherit from the nearest smaller breakpoint.
 *
 * Because the component is CSS-first (renders all variants and uses Show
 * wrappers with media queries to control visibility), the tests verify that
 * the correct content nodes AND the expected Show wrappers are present in the
 * rendered output.
 *
 * @module ResponsiveSlot/tests
 * @category Layout
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponsiveSlot } from './';

// ---------------------------------------------------------------------------
// Device-alias mode
// ---------------------------------------------------------------------------

describe('ResponsiveSlot - device aliases', () => {
  it('renders phone content on phone', () => {
    const { container } = render(
      <ResponsiveSlot
        phone={<span data-testid="phone">Phone</span>}
        tablet={<span data-testid="tablet">Tablet</span>}
        desktop={<span data-testid="desktop">Desktop</span>}
      />,
    );

    // All three variants should be present in the DOM (CSS controls visibility)
    expect(screen.getByTestId('phone')).toBeInTheDocument();
    expect(screen.getByTestId('tablet')).toBeInTheDocument();
    expect(screen.getByTestId('desktop')).toBeInTheDocument();

    // Verify the Show wrappers emit style tags with media queries
    const styles = container.querySelectorAll('style');
    expect(styles.length).toBeGreaterThanOrEqual(3);
  });

  it('renders tablet content on tablet', () => {
    render(
      <ResponsiveSlot
        phone={<span data-testid="phone">Phone</span>}
        tablet={<span data-testid="tablet">Tablet</span>}
        desktop={<span data-testid="desktop">Desktop</span>}
      />,
    );

    // Tablet content is in the DOM
    expect(screen.getByTestId('tablet')).toBeInTheDocument();
    expect(screen.getByTestId('tablet')).toHaveTextContent('Tablet');
  });

  it('renders desktop content on desktop', () => {
    render(
      <ResponsiveSlot
        phone={<span data-testid="phone">Phone</span>}
        tablet={<span data-testid="tablet">Tablet</span>}
        desktop={<span data-testid="desktop">Desktop</span>}
      />,
    );

    // Desktop content is in the DOM
    expect(screen.getByTestId('desktop')).toBeInTheDocument();
    expect(screen.getByTestId('desktop')).toHaveTextContent('Desktop');
  });

  it('falls back to phone when tablet is not provided', () => {
    const { container } = render(
      <ResponsiveSlot
        phone={<span data-testid="phone">Phone</span>}
        desktop={<span data-testid="desktop">Desktop</span>}
      />,
    );

    // Phone content should appear (used for both phone and tablet ranges)
    expect(screen.getByTestId('phone')).toBeInTheDocument();
    expect(screen.getByTestId('desktop')).toBeInTheDocument();

    // Without tablet, phone + tablet are merged into a single Show below="desktop"
    // so the phone content covers 0--1023px
    const styles = container.querySelectorAll('style');
    expect(styles.length).toBeGreaterThanOrEqual(2);

    // The phone content should be wrapped in a Show that covers below desktop
    const styleTexts = Array.from(styles).map((s) => s.textContent);
    const hasBelowDesktop = styleTexts.some((t) => t?.includes('max-width: 1023px'));
    expect(hasBelowDesktop).toBe(true);
  });

  it('falls back to tablet when desktop is not provided', () => {
    const { container } = render(
      <ResponsiveSlot
        phone={<span data-testid="phone">Phone</span>}
        tablet={<span data-testid="tablet">Tablet</span>}
      />,
    );

    // Phone and tablet content present
    expect(screen.getByTestId('phone')).toBeInTheDocument();
    expect(screen.getByTestId('tablet')).toBeInTheDocument();

    // Tablet content covers tablet + desktop (from="tablet", no upper bound)
    const styles = container.querySelectorAll('style');
    const styleTexts = Array.from(styles).map((s) => s.textContent);
    const hasFromTablet = styleTexts.some((t) => t?.includes('min-width: 640px'));
    expect(hasFromTablet).toBe(true);
  });

  it('renders nothing when no slots are provided', () => {
    const { container } = render(<ResponsiveSlot />);
    expect(container.innerHTML).toBe('');
  });

  it('renders without Show wrappers when all slots are the same', () => {
    const shared = <span data-testid="shared">Same</span>;
    const { container } = render(
      <ResponsiveSlot phone={shared} tablet={shared} desktop={shared} />,
    );

    expect(screen.getByTestId('shared')).toBeInTheDocument();
    // No style tags needed since content is identical at all sizes
    const styles = container.querySelectorAll('style');
    expect(styles.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Standard breakpoint mode
// ---------------------------------------------------------------------------

describe('ResponsiveSlot - standard breakpoints', () => {
  it('renders xs content for all sizes when only xs is provided', () => {
    const { container } = render(
      <ResponsiveSlot xs={<span data-testid="xs">Extra Small</span>} />,
    );

    expect(screen.getByTestId('xs')).toBeInTheDocument();
    // Single slot covering full range -- no Show wrappers needed
    const styles = container.querySelectorAll('style');
    expect(styles.length).toBe(0);
  });

  it('cascades xs to sm when sm is not provided', () => {
    const { container } = render(
      <ResponsiveSlot
        xs={<span data-testid="xs">XS</span>}
        lg={<span data-testid="lg">LG</span>}
      />,
    );

    // Both present in DOM
    expect(screen.getByTestId('xs')).toBeInTheDocument();
    expect(screen.getByTestId('lg')).toBeInTheDocument();

    // xs covers xs through md (below lg), lg covers lg+
    const styles = container.querySelectorAll('style');
    const styleTexts = Array.from(styles).map((s) => s.textContent);
    const hasBelowLg = styleTexts.some((t) => t?.includes('max-width: 1023px'));
    const hasFromLg = styleTexts.some((t) => t?.includes('min-width: 1024px'));
    expect(hasBelowLg).toBe(true);
    expect(hasFromLg).toBe(true);
  });

  it('renders multiple breakpoint groups correctly', () => {
    render(
      <ResponsiveSlot
        xs={<span data-testid="xs">XS</span>}
        md={<span data-testid="md">MD</span>}
        xl={<span data-testid="xl">XL</span>}
      />,
    );

    expect(screen.getByTestId('xs')).toBeInTheDocument();
    expect(screen.getByTestId('md')).toBeInTheDocument();
    expect(screen.getByTestId('xl')).toBeInTheDocument();
  });
});
