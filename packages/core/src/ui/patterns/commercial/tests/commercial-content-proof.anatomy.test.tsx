/** Content and proof anatomy: data-part hooks, reduced-motion behavior and the
 *  accessible final value of every animated family. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AsciiDiagram,
  MonoStat,
  ProductWindow,
  TerminalBlock,
  TreeView,
  Typewriter,
} from '../../../../entrypoints/commercial';

function mockReducedMotion(reduce: boolean): void {
  window.matchMedia = vi.fn().mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion') ? reduce : false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );
}

/** A controllable IntersectionObserver: `.observe()` stores the callback instead of firing it, so a test decides exactly when the element "s... */
function installManualIntersectionObserver(): { fire: () => void } {
  let stored: IntersectionObserverCallback | undefined;
  window.IntersectionObserver = vi.fn((cb: IntersectionObserverCallback) => {
    stored = cb;
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => []),
      root: null,
      rootMargin: '0px',
      thresholds: [0.35],
    } as unknown as IntersectionObserver;
  }) as unknown as typeof IntersectionObserver;

  return {
    fire: () =>
      stored?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver),
  };
}

let originalMatchMedia: typeof window.matchMedia;
let originalIntersectionObserver: typeof window.IntersectionObserver;

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
  originalIntersectionObserver = window.IntersectionObserver;
});

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
  window.IntersectionObserver = originalIntersectionObserver;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('AsciiDiagram — anatomy and reveal CLS', () => {
  it('exposes exactly the documented root/grid data-part anatomy (anti-vacuity: a made-up part matches nothing)', () => {
    mockReducedMotion(true);
    const { container } = render(
      <AsciiDiagram
        nodes={[{ id: 'a', label: 'ONE', col: 0, row: 0 }]}
        edges={[]}
        description="A single node labelled ONE"
      />,
    );
    expect(container.querySelectorAll('[data-part="root"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-part="grid"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-part="not-a-real-part"]')).toHaveLength(0);
  });

  it('reserves the grid element height for the full diagram so the line-by-line "type" reveal cannot shrink the box before regrowing it (CLS)', () => {
    mockReducedMotion(false);
    const observer = installManualIntersectionObserver();
    const { container } = render(
      <AsciiDiagram
        nodes={[
          { id: 'a', label: 'ONE', col: 0, row: 0 },
          { id: 'b', label: 'TWO', col: 0, row: 2 },
          { id: 'c', label: 'THREE', col: 0, row: 4 },
        ]}
        edges={[
          { from: 'a', to: 'b' },
          { from: 'b', to: 'c' },
        ]}
        description="Three stacked nodes"
      />,
    );
    const grid = container.querySelector('[data-part="grid"]') as HTMLElement;
    // Before any reveal fires, the SSR-safe initial state already renders the full grid, so
    // this is the true final line count the reservation is checked against below.
    const fullLineCount = grid.textContent!.split('\n').length;
    expect(fullLineCount).toBeGreaterThan(1);

    act(() => observer.fire());

    // The reveal has reset the visible grid text to a shorter (here, empty) string...
    expect(grid.textContent).toBe('');
    // ...but the element must still reserve its FULL final height so nothing below it on the
    // page shifts as the lines regrow.
    expect(grid.style.minHeight).toBe(`${(fullLineCount * 1.25 * 0.8125).toFixed(4)}rem`);
  });
});

describe('TerminalBlock — anatomy and streaming CLS', () => {
  it('exposes exactly the documented 6 data-part anatomy names', () => {
    mockReducedMotion(true);
    const { container } = render(
      <TerminalBlock
        title="build"
        lines={[
          { prompt: true, text: 'pnpm build' },
          { text: 'done' },
        ]}
      />,
    );
    const parts = new Set(
      Array.from(container.querySelectorAll('[data-part]')).map((el) => el.getAttribute('data-part')),
    );
    expect(parts).toEqual(new Set(['root', 'scanlines', 'title-bar', 'body', 'line', 'prompt']));
  });

  it('keeps every line row present in the DOM from the first streamed frame, instead of mounting a row only once its turn to type begins (CLS)', () => {
    mockReducedMotion(false);
    const observer = installManualIntersectionObserver();
    const { container } = render(
      <TerminalBlock
        lines={[
          { prompt: true, text: 'pnpm build' },
          { text: 'compiling...' },
          { text: 'done in 2.4s' },
        ]}
      />,
    );

    act(() => observer.fire());

    // Only the first line has started typing at this instant...
    expect(container.querySelectorAll('.rt-terminal-block__line')).toHaveLength(3);
    // ...but every row's inline content box must already be mounted (even empty) so the row's DOM
    // shape stays constant; the height floor itself is CSS (asserted in the visual-remediation suite).
    expect(container.querySelectorAll('.rt-terminal-block__visual')).toHaveLength(3);
    // Anti-vacuity: a made-up class matches nothing, proving the selector above is load-bearing.
    expect(container.querySelectorAll('.rt-terminal-block__not-a-real-class')).toHaveLength(0);
  });
});

describe('MonoStat — anatomy and count-up reset', () => {
  it('exposes exactly the documented root/value/label data-part anatomy', () => {
    mockReducedMotion(true);
    const { container } = render(<MonoStat value={601} label="use cases" />);
    const parts = new Set(
      Array.from(container.querySelectorAll('[data-part]')).map((el) => el.getAttribute('data-part')),
    );
    expect(parts).toEqual(new Set(['root', 'value', 'label']));
  });

  it('resets the visible digits to 0 the instant the count-up starts, instead of flashing the final value first', () => {
    mockReducedMotion(false);
    const observer = installManualIntersectionObserver();
    const rafSpy = vi.fn(() => 1);
    vi.stubGlobal('requestAnimationFrame', rafSpy);

    const { container } = render(<MonoStat value={601} label="use cases" />);
    act(() => observer.fire());

    // The count-up frame has been scheduled but never invoked (rafSpy is a no-op stand-in), so this is exactly the state the first paint after ...
    expect(rafSpy).toHaveBeenCalled();
    expect(container.querySelector('[data-part="value"]')?.textContent).toBe('0');
    // The accessible alternative must still carry the real final value throughout — proving the
    // reset does not leak into what assistive tech reads.
    expect(container.querySelector('.rt-mono-stat__visually-hidden')?.textContent).toBe('601');
  });

  it('shows the final value instantly with no reset under reduced motion (regression guard for the fix above)', () => {
    mockReducedMotion(true);
    const { container } = render(<MonoStat value={601} label="use cases" />);
    expect(container.querySelector('[data-part="value"]')?.textContent).toBe('601');
  });
});

describe('ProductWindow — anatomy, color-exception boundary, and figcaption defect', () => {
  it('exposes exactly the documented 7 data-part anatomy names', () => {
    const { container } = render(
      <ProductWindow label="Dashboard — live view" caption="A live view.">
        <div>content</div>
      </ProductWindow>,
    );
    const parts = new Set(
      Array.from(container.querySelectorAll('[data-part]')).map((el) => el.getAttribute('data-part')),
    );
    expect(parts).toEqual(
      new Set(['root', 'frame', 'titlebar', 'affordance', 'label', 'content', 'caption']),
    );
  });

  it('never sets color on the content seat, so a child brand demo keeps its own colors untouched (the sanctioned exception boundary)', () => {
    const { container } = render(
      <ProductWindow label="Dashboard — live view">
        <div
          data-testid="brand-demo"
          style={{ color: 'rgb(13, 59, 102)', backgroundColor: 'rgb(255, 204, 0)' }}
        >
          Live brand content
        </div>
      </ProductWindow>,
    );
    const contentRegion = container.querySelector('[data-part="content"]') as HTMLElement;
    expect(contentRegion.style.color).toBe('');
    expect(contentRegion.style.backgroundColor).toBe('');
    const demo = screen.getByTestId('brand-demo');
    expect(demo.style.color).toBe('rgb(13, 59, 102)');
    expect(demo.style.backgroundColor).toBe('rgb(255, 204, 0)');
  });

  it('pairs the caption with a real <figcaption> inside <figure> by default (regression guard for the fix below)', () => {
    const { container } = render(
      <ProductWindow label="Dashboard — live view" caption="A live view.">
        <div>content</div>
      </ProductWindow>,
    );
    expect(container.querySelector('figure')).not.toBeNull();
    expect(container.querySelector('figcaption')).not.toBeNull();
  });

  /* The contract now promises exactly this pair, so both routes are pinned. */
  it('states both caption routes in the contract instead of promising figcaption unconditionally', () => {
    const contract = readFileSync(
      join(__dirname, '../foundation/contracts/proof/product-window/index.ts'),
      'utf8',
    );
    expect(contract).toMatch(/a `figcaption` under the default `figure` container/);
    expect(contract).toMatch(/a generic element when `as` overrides it/);
    expect(contract).not.toMatch(/rendered under the window as a `figcaption`\./);
  });

  it('never emits a <figcaption> outside a <figure> when `as` overrides the container (figcaption is only valid HTML inside figure)', () => {
    const { container } = render(
      <ProductWindow as="div" label="Dashboard — live view" caption="A live view.">
        <div>content</div>
      </ProductWindow>,
    );
    expect(container.querySelector('figure')).toBeNull();
    expect(container.querySelector('figcaption')).toBeNull();
    expect(screen.getByText('A live view.')).toBeInTheDocument();
  });
});

describe('TreeView — anatomy and semantics (no defect found)', () => {
  it('exposes exactly the documented 7 data-part anatomy names', () => {
    const { container } = render(
      <TreeView data={{ label: 'root', children: [{ label: 'child', href: '/docs/child' }] }} />,
    );
    const parts = new Set(
      Array.from(container.querySelectorAll('[data-part]')).map((el) => el.getAttribute('data-part')),
    );
    expect(parts).toEqual(new Set(['root', 'item', 'row', 'connector', 'label', 'link', 'group']));
  });

  it('uses list/listitem semantics rather than tree/treeitem, matching its static, always-expanded, non-interactive contract', () => {
    const { container } = render(
      <TreeView
        aria-label="Repository structure"
        data={{ label: 'root', children: [{ label: 'child' }] }}
      />,
    );
    const root = container.querySelector('[data-part="root"]');
    expect(root?.tagName).toBe('UL');
    expect(root?.getAttribute('role')).toBe('list');
    expect(root?.getAttribute('aria-label')).toBe('Repository structure');
    expect(container.querySelectorAll('[role="listitem"]').length).toBeGreaterThan(0);
    // Anti-vacuity and the actual semantic check in one: an interactive tree role is absent because this component has no keyboard/expand-colla...
    expect(container.querySelectorAll('[role="tree"], [role="treeitem"]')).toHaveLength(0);
  });

  it('renders href nodes as real, focusable links and plain nodes as inert text', () => {
    const { container } = render(
      <TreeView
        data={{
          label: 'root',
          children: [{ label: 'linked', href: '/docs/linked' }, { label: 'plain' }],
        }}
      />,
    );
    const link = screen.getByRole('link', { name: 'linked' });
    expect(link).toHaveAttribute('href', '/docs/linked');
    expect(container.querySelectorAll('[data-part="link"]')).toHaveLength(1);
    expect(screen.getByText('plain').closest('a')).toBeNull();
  });

  it('computes correct box-drawing connectors across three nesting levels', () => {
    const { container } = render(
      <TreeView
        data={{
          label: 'root',
          children: [
            { label: 'branch-a', children: [{ label: 'leaf-a1' }, { label: 'leaf-a2' }] },
            { label: 'branch-b' },
          ],
        }}
      />,
    );
    const connectors = Array.from(container.querySelectorAll('[data-part="connector"]')).map(
      (el) => el.textContent,
    );
    // branch-a is not root's last child -> "├── "; its children continue the guide with "│   ";
    // leaf-a2 is branch-a's last child -> "│   └── "; branch-b IS root's last child -> "└── ".
    expect(connectors).toEqual(['├── ', '│   ├── ', '│   └── ', '└── ']);
  });
});

describe('Typewriter — anatomy (reflow-during-"type" documented as an open defect, not fixed here)', () => {
  it('exposes exactly the documented root/visual data-part anatomy', () => {
    mockReducedMotion(true);
    const { container } = render(<Typewriter text="typed headline" />);
    const parts = new Set(
      Array.from(container.querySelectorAll('[data-part]')).map((el) => el.getAttribute('data-part')),
    );
    expect(parts).toEqual(new Set(['root', 'visual']));
  });

  it('carries the real text in a permanent visually-hidden span and marks the animated layer aria-hidden, so a screenreader never encounters scrambled/partial text', () => {
    mockReducedMotion(true);
    const { container } = render(<Typewriter text="typed headline" mode="decode" />);
    const hidden = container.querySelector('.rt-typewriter__visually-hidden');
    const visual = container.querySelector('[data-part="visual"]');
    expect(hidden).toHaveTextContent('typed headline');
    expect(visual?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('cross-family — animated content never uses a live region', () => {
  it('AsciiDiagram, TerminalBlock, Typewriter, and MonoStat mark their animated layer aria-hidden with no aria-live anywhere (a live region here would thrash assistive tech on every frame)', () => {
    mockReducedMotion(true);
    const { container } = render(
      <div>
        <AsciiDiagram
          nodes={[{ id: 'a', label: 'ONE', col: 0, row: 0 }]}
          edges={[]}
          description="A single node labelled ONE"
        />
        <TerminalBlock lines={[{ prompt: true, text: 'pnpm build' }]} />
        <Typewriter text="typed headline" mode="decode" />
        <MonoStat value={601} label="use cases" />
      </div>,
    );
    expect(container.querySelectorAll('[aria-live]')).toHaveLength(0);
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(4);
  });
});
