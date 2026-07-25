/**
 * Layout modern-engine contract tests (K3-C pass 1).
 *
 * The engine carried its whole structure as raw Tailwind utilities
 * (`flex flex-col min-h-screen`, `md:flex-row`, `px-4`, `p-4`, `shrink-0`,
 * `overflow-y-auto`, `transition-all duration-300`, `flex-1`) and the sider
 * collapse trigger's sizing as a 32px inline style -- a second style owner
 * beside the skin, with a raw 300ms motion literal and a sub-44px touch
 * target. K3-C moved structure and trigger sizing into the modern skin
 * (`layout.css`). These tests pin:
 *
 *  - every piece keeps its canonical engine class pair + data-part anatomy
 *    (Content gains `rottay-layout-content--modern`, minted in K3-C);
 *  - no drained utility class survives in any class list;
 *  - runtime-measured values (header height, sider width) stay inline;
 *  - the collapse trigger renders with NO inline style (skin-owned sizing)
 *    and still toggles controlled/uncontrolled collapse.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Layout, Header, Sider, Content, Footer } from '../engines/modern';

describe('Layout modern contract: anatomy and drained utilities', () => {
  it('root keeps the class pair and data-has-sider, with no structure utilities', () => {
    const { container, rerender } = render(
      <Layout>
        <span>body</span>
      </Layout>
    );
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root.className).toContain('rottay-layout');
    expect(root.className).toContain('rottay-layout--modern');
    expect(root.getAttribute('data-has-sider')).toBe('false');
    expect(root.className).not.toMatch(/flex|min-h-screen|md:flex-row/);

    rerender(
      <Layout hasSider>
        <span>body</span>
      </Layout>
    );
    expect(
      (container.querySelector('[data-part="root"]') as HTMLElement).getAttribute('data-has-sider')
    ).toBe('true');
  });

  it('header keeps its pair, inlines only the measured height', () => {
    render(<Header height={72}>hdr</Header>);
    const header = screen.getByText('hdr');
    expect(header.className).toContain('rottay-layout-header');
    expect(header.className).toContain('rottay-layout-header--modern');
    expect(header.className).not.toMatch(/px-4|flex|shrink-0/);
    expect(header.style.height).toBe('72px');
  });

  it('header accepts a string height unchanged', () => {
    render(<Header height="4rem">hdr</Header>);
    expect(screen.getByText('hdr').style.height).toBe('4rem');
  });

  it('sider keeps its pair and inline width, with no drained utilities', () => {
    render(
      <Sider width={240} theme="dark">
        nav
      </Sider>
    );
    const sider = screen.getByText('nav');
    expect(sider.className).toContain('rottay-layout-sider');
    expect(sider.className).toContain('rottay-layout-sider--modern');
    expect(sider.className).not.toMatch(/shrink-0|overflow-y-auto|transition-all|duration-300/);
    expect(sider.style.width).toBe('240px');
    expect(sider.getAttribute('data-theme')).toBe('dark');
    expect(sider.getAttribute('data-collapsed')).toBe('false');
  });

  it('content gains the minted --modern pair with no structure utilities', () => {
    render(<Content>main</Content>);
    const content = screen.getByText('main');
    expect(content.className).toContain('rottay-layout-content');
    expect(content.className).toContain('rottay-layout-content--modern');
    expect(content.className).not.toMatch(/flex-1|p-4|overflow-auto/);
    expect(content.getAttribute('data-part')).toBe('content');
  });

  it('footer keeps its pair with no spacing utilities', () => {
    render(<Footer>ftr</Footer>);
    const footer = screen.getByText('ftr');
    expect(footer.className).toContain('rottay-layout-footer');
    expect(footer.className).toContain('rottay-layout-footer--modern');
    expect(footer.className).not.toMatch(/px-4|py-2|shrink-0/);
  });
});

describe('Layout modern contract: sider collapse', () => {
  it('renders the trigger with no inline style (skin-owned sizing)', () => {
    render(
      <Sider collapsible>
        <span>nav</span>
      </Sider>
    );
    const trigger = document.querySelector('[data-part="trigger"]') as HTMLElement;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('style')).toBeNull();
  });

  it('toggles uncontrolled collapse and reports via onCollapse', () => {
    const handleCollapse = vi.fn();
    render(
      <Sider collapsible onCollapse={handleCollapse} width={200} collapsedWidth={80}>
        <span>nav</span>
      </Sider>
    );
    const sider = screen.getByText('nav').closest('[data-part="sider"]') as HTMLElement;
    const trigger = document.querySelector('[data-part="trigger"]') as HTMLElement;

    fireEvent.click(trigger);
    expect(handleCollapse).toHaveBeenCalledWith(true);
    expect(sider.getAttribute('data-collapsed')).toBe('true');
    expect(sider.style.width).toBe('80px');

    fireEvent.click(trigger);
    expect(handleCollapse).toHaveBeenLastCalledWith(false);
    expect(sider.style.width).toBe('200px');
  });

  it('honors controlled collapse state', () => {
    render(
      <Sider collapsible collapsed width={200} collapsedWidth={80}>
        <span>nav</span>
      </Sider>
    );
    const sider = screen.getByText('nav').closest('[data-part="sider"]') as HTMLElement;
    expect(sider.getAttribute('data-collapsed')).toBe('true');
    expect(sider.style.width).toBe('80px');
  });

  it('renders a custom trigger node when provided', () => {
    render(
      <Sider collapsible trigger={<span>toggle-me</span>}>
        <span>nav</span>
      </Sider>
    );
    expect(screen.getByText('toggle-me')).toBeInTheDocument();
  });
});
