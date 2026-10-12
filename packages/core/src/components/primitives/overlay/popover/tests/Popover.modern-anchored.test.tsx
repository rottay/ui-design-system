import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ModernPopover from '../engines/modern';
import { Popover } from '../index';
import ModernSelect from '../../../inputs/select/engines/modern';
import { overlayCapabilities } from '../../../runtime/overlay/positioning';

const ORIGINAL_CAPABILITIES = { ...overlayCapabilities };

function forceAnchorBranch(): void {
  Object.assign(overlayCapabilities, { anchorPositioning: true, topLayer: true });
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
}

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  Object.assign(overlayCapabilities, ORIGINAL_CAPABILITIES);
  delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover;
  delete (HTMLElement.prototype as Partial<HTMLElement>).hidePopover;
  vi.restoreAllMocks();
});

const popoverWarnings = (): string[] =>
  warn.mock.calls
    .map((call) => String(call[0]))
    .filter((message) => message.startsWith('[Popover]'));

interface HarnessProps {
  initialOpen?: boolean;
  content?: (close: () => void) => React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  initialFocus?: 'first-control' | 'surface' | 'none';
  density?: 'compact' | 'comfortable' | 'spacious';
  anchorAttributes?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  surfaceRef?: React.Ref<HTMLDivElement>;
}

function Harness({
  initialOpen = true,
  content,
  onOpenChange,
  initialFocus,
  density,
  anchorAttributes,
  surfaceRef,
}: HarnessProps) {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(initialOpen);
  const change = (next: boolean) => {
    onOpenChange?.(next);
    setOpen(next);
  };
  return (
    <div data-ds-root="" data-tenant="acme" data-testid="root">
      <button
        ref={anchorRef}
        type="button"
        aria-controls="disclosure"
        aria-expanded={open}
        onClick={() => change(!open)}
        {...anchorAttributes}
      >
        Filters
      </button>
      <div data-testid="mount">
        <ModernPopover
          ref={surfaceRef}
          anchor={anchorRef}
          open={open}
          onOpenChange={change}
          id="disclosure"
          aria-label="Filter panel"
          placement="bottomRight"
          offset={8}
          initialFocus={initialFocus}
          density={density}
          content={
            content ? (
              content(() => change(false))
            ) : (
              <>
                <input aria-label="Query" />
                <button type="button" onClick={() => change(false)}>
                  Apply
                </button>
              </>
            )
          }
        />
      </div>
      <button type="button">Elsewhere</button>
      <span data-testid="plain">plain</span>
    </div>
  );
}

const surface = (): HTMLElement => screen.getByRole('dialog', { name: 'Filter panel' });

describe('Popover anchored mode -- in-tree posture and scope', () => {
  it('renders in-tree at the mount point in the js branch, never through a portal', () => {
    render(<Harness />);

    const node = surface();
    expect(screen.getByTestId('mount').contains(node)).toBe(true);
    expect(node.closest('[data-rottay-portal]')).toBeNull();
    expect(node.closest('[data-tenant]')).toBe(screen.getByTestId('root'));
    expect(node.getAttribute('data-ds-position-strategy')).toBe('js');
    expect(node.style.position).toBe('fixed');
  });

  it('promotes in place in the anchor-css branch and registers the caller-owned anchor', async () => {
    forceAnchorBranch();
    render(<Harness />);

    const node = surface();
    await waitFor(() => {
      expect(node.getAttribute('data-ds-position-strategy')).toBe('anchor-css');
    });
    expect(node.getAttribute('popover')).toBe('manual');
    expect(screen.getByTestId('mount').contains(node)).toBe(true);
    expect(node.closest('[data-rottay-portal]')).toBeNull();
    const anchor = screen.getByRole('button', { name: 'Filters' });
    expect(anchor.style.getPropertyValue('anchor-name')).toMatch(/^--ds-anchor-\d+$/);
  });

  it('inherits the tenant scope instead of re-stamping it', () => {
    render(
      <div dir="rtl" lang="ar">
        <Harness />
      </div>,
    );

    const node = surface();
    const host = node.parentElement as HTMLElement;
    expect(host).toHaveAttribute('data-anchor-scope', 'external');
    expect(host).not.toHaveAttribute('data-portal-scope');
    for (const attribute of ['data-tenant', 'data-theme', 'data-engine', 'data-vertical', 'data-density']) {
      expect(node).not.toHaveAttribute(attribute);
    }
    const inlineCustomProperties = Array.from(node.style)
      .filter((property) => property.startsWith('--'))
      .filter((property) => !property.startsWith('--ds-popover-instance-'));
    expect(inlineCustomProperties).toEqual([]);
    expect(node).toHaveAttribute('dir', 'rtl');
    expect(node).toHaveAttribute('lang', 'ar');
  });

  it('stamps density only when the caller passes it', () => {
    render(<Harness density="compact" />);
    expect(surface()).toHaveAttribute('data-density', 'compact');
  });
});

describe('Popover anchored mode -- anchor resolution', () => {
  function SwitchingHarness() {
    const anchorRef = useRef<HTMLButtonElement | null>(null);
    const [open, setOpen] = useState(true);
    const [target, setTarget] = useState<'first' | 'second'>('first');
    return (
      <div data-ds-root="" data-tenant="acme">
        <button ref={target === 'first' ? anchorRef : undefined} type="button">
          First
        </button>
        <button ref={target === 'second' ? anchorRef : undefined} type="button">
          Second
        </button>
        <button type="button" onClick={() => setTarget('second')}>
          Re-point
        </button>
        <button type="button" onClick={() => setOpen((value) => !value)}>
          Toggle
        </button>
        <ModernPopover
          anchor={anchorRef}
          open={open}
          onOpenChange={setOpen}
          id="switching"
          aria-label="Filter panel"
          content={<input aria-label="Query" />}
        />
      </div>
    );
  }

  it('re-pins to a ref re-pointed while open, on the next commit', async () => {
    render(<SwitchingHarness />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Query' })).toHaveFocus());

    fireEvent.click(screen.getByRole('button', { name: 'Re-point' }));
    screen.getByRole('textbox', { name: 'Query' }).focus();
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus());
  });

  it('re-pins across opens', async () => {
    render(<SwitchingHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click(screen.getByRole('button', { name: 'Re-point' }));
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Query' })).toHaveFocus());

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus());
  });

  function MissingAnchorHarness() {
    const anchorRef = useRef<HTMLButtonElement | null>(null);
    const [present, setPresent] = useState(true);
    return (
      <div data-ds-root="" data-tenant="acme">
        {present ? (
          <button ref={anchorRef} type="button">
            Filters
          </button>
        ) : null}
        <button type="button" onClick={() => setPresent((value) => !value)}>
          Toggle anchor
        </button>
        <ModernPopover
          anchor={anchorRef}
          open
          onOpenChange={() => {}}
          id="missing"
          aria-label="Filter panel"
          content={<input aria-label="Query" />}
        />
      </div>
    );
  }

  it.each([
    ['js', false],
    ['anchor-css', true],
  ])(
    'withholds the surface while the anchor is missing, in the %s branch, and stays an anchored dropdown layer',
    async (strategy, anchorBranch) => {
      if (anchorBranch) forceAnchorBranch();
      render(<MissingAnchorHarness />);
      await waitFor(() =>
        expect(surface().getAttribute('data-ds-position-strategy')).toBe(strategy),
      );

      fireEvent.click(screen.getByRole('button', { name: 'Toggle anchor' }));
      await waitFor(() => expect(screen.queryByRole('dialog', { hidden: true })).toBeNull());
      expect(document.querySelector('[data-overlay-kind]')).toBeNull();
      expect(popoverWarnings().some((message) => message.includes('anchor is missing'))).toBe(true);

      fireEvent.click(screen.getByRole('button', { name: 'Toggle anchor' }));
      const restored = await screen.findByRole('dialog', { name: 'Filter panel' });
      expect(restored).toHaveAttribute('data-layer-kind', 'dropdown');
      expect(restored).toHaveAttribute('data-overlay-kind', 'dropdown');
      expect(restored.style.position).toBe('fixed');
      await waitFor(() =>
        expect(restored.getAttribute('data-ds-position-strategy')).toBe(strategy),
      );
    },
  );
});

describe('Popover anchored mode -- closing and focus return', () => {
  it('closes on Escape and returns focus to the anchor itself', async () => {
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Query' })).toHaveFocus());

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Filters' })).toHaveFocus());
  });

  it('lets a nested open Select take the first Escape', async () => {
    const onOpenChange = vi.fn();
    render(
      <Harness
        onOpenChange={onOpenChange}
        content={() => (
          <ModernSelect
            showSearch
            aria-label="Status"
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
        )}
      />,
    );

    fireEvent.click(await screen.findByRole('combobox'));
    expect(await screen.findByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(surface()).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('returns focus to the anchor on a controlled close from inside', async () => {
    render(<Harness />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Query' })).toHaveFocus());
    const apply = screen.getByRole('button', { name: 'Apply' });
    apply.focus();
    fireEvent.click(apply);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Filters' })).toHaveFocus());
  });

  it('returns stranded focus to the anchor on an outside press over a non-focusable area', async () => {
    render(<Harness />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Query' })).toHaveFocus());

    fireEvent.pointerDown(screen.getByTestId('plain'));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Filters' })).toHaveFocus();
  });

  it('leaves focus on a real destination after an outside press', async () => {
    render(<Harness />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Query' })).toHaveFocus());
    const destination = screen.getByRole('button', { name: 'Elsewhere' });

    fireEvent.pointerDown(destination);
    fireEvent.mouseDown(destination);
    destination.focus();

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(destination).toHaveFocus();
  });

  it('gives an aria-disabled anchor its focus back', async () => {
    render(<Harness anchorAttributes={{ 'aria-disabled': true }} />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Query' })).toHaveFocus());

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Filters' })).toHaveFocus());
  });

  it('does not throw or move focus when the anchor is gone at close', async () => {
    function GoneHarness() {
      const anchorRef = useRef<HTMLButtonElement | null>(null);
      const [open, setOpen] = useState(true);
      const [present, setPresent] = useState(true);
      return (
        <div data-ds-root="" data-tenant="acme">
          {present ? (
            <button ref={anchorRef} type="button">
              Filters
            </button>
          ) : null}
          <ModernPopover
            anchor={anchorRef}
            open={open}
            onOpenChange={setOpen}
            id="gone"
            aria-label="Filter panel"
            content={
              <button
                type="button"
                onClick={() => {
                  setPresent(false);
                  setOpen(false);
                }}
              >
                Remove and close
              </button>
            }
          />
        </div>
      );
    }
    render(<GoneHarness />);
    const action = await screen.findByRole('button', { name: 'Remove and close' });
    await waitFor(() => expect(action).toHaveFocus());

    expect(() => fireEvent.click(action)).not.toThrow();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.queryByRole('button', { name: 'Filters' })).toBeNull();
  });

  it('stays open for presses inside the surface, on the anchor, and in a nested Select panel', async () => {
    const onOpenChange = vi.fn();
    render(
      <Harness
        onOpenChange={onOpenChange}
        content={() => (
          <ModernSelect
            showSearch
            aria-label="Status"
            options={[{ label: 'Active', value: 'active' }]}
          />
        )}
      />,
    );

    fireEvent.pointerDown(surface());
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Filters' }));
    fireEvent.click(await screen.findByRole('combobox'));
    fireEvent.pointerDown(await screen.findByRole('option', { name: 'Active' }));

    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(surface()).toBeInTheDocument();
  });

  it('has no trigger reasons: pointer leave, Tab-out and unrelated focus keep it open', async () => {
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);
    const input = screen.getByRole('textbox', { name: 'Query' });
    await waitFor(() => expect(input).toHaveFocus());

    fireEvent.pointerEnter(surface(), { pointerType: 'mouse' });
    fireEvent.pointerLeave(surface(), { pointerType: 'mouse' });

    const apply = screen.getByRole('button', { name: 'Apply' });
    apply.focus();
    const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
    fireEvent.blur(apply, { relatedTarget: elsewhere });
    elsewhere.focus();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(surface()).toBeInTheDocument();
  });
});

describe('Popover anchored mode -- initial focus', () => {
  it('lands on the first control by default', async () => {
    render(<Harness />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Query' })).toHaveFocus());
  });

  it('parks on the surface when declared', async () => {
    render(<Harness initialFocus="surface" />);
    await waitFor(() => expect(surface()).toHaveFocus());
  });

  it('moves nothing when declared none', async () => {
    render(<Harness initialFocus="none" />);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(surface().contains(document.activeElement)).toBe(false);
  });

  it('hands the parked focus to a control that mounts late', async () => {
    function LateContent() {
      const [ready, setReady] = useState(false);
      useEffect(() => {
        const timer = setTimeout(() => setReady(true), 30);
        return () => clearTimeout(timer);
      }, []);
      return ready ? <input aria-label="Late query" /> : <span>Loading</span>;
    }
    render(<Harness content={() => <LateContent />} />);

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Late query' })).toHaveFocus());
  });

  it('lands on the first control when the re-open commits with the unmount of the closed surface', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const nextFrame = () =>
        act(() => new Promise<void>((done) => requestAnimationFrame(() => done())));
      render(<Harness />);
      await nextFrame();
      const closedSurface = surface();
      expect(screen.getByRole('textbox', { name: 'Query' })).toHaveFocus();

      fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Escape' });
      const anchor = screen.getByRole('button', { name: 'Filters' });
      expect(anchor).toHaveFocus();

      // One batch: the exit fallback unmounts the surface and the press re-opens
      // it, so the open commits while the engine still holds the removed element.
      act(() => {
        vi.advanceTimersByTime(1000);
        anchor.click();
      });
      await nextFrame();

      expect(closedSurface.isConnected).toBe(false);
      expect(surface()).not.toBe(closedSurface);
      expect(screen.getByRole('textbox', { name: 'Query' })).toHaveFocus();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('Popover anchored mode -- fixed mode rules', () => {
  it('renders no arrow, unmounts after close, keeps one id per open, and forwards its ref to the surface', async () => {
    const surfaceRef = React.createRef<HTMLDivElement>();
    render(<Harness surfaceRef={surfaceRef} />);

    const node = surface();
    expect(node.querySelector('[data-part="arrow"]')).toBeNull();
    expect(node).toHaveAttribute('data-has-arrow', 'false');
    expect(surfaceRef.current).toBe(node);

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(document.getElementById('disclosure')).toBeNull());
    expect(surfaceRef.current).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    await screen.findByRole('dialog', { name: 'Filter panel' });
    expect(document.querySelectorAll('#disclosure')).toHaveLength(1);
  });

  it('takes the dropdown band so a nested Select stacks above it', async () => {
    render(
      <Harness
        content={() => (
          <ModernSelect
            showSearch
            aria-label="Status"
            options={[{ label: 'Active', value: 'active' }]}
          />
        )}
      />,
    );
    const node = surface();
    expect(node).toHaveAttribute('data-layer-kind', 'dropdown');
    expect(node).toHaveAttribute('data-overlay-kind', 'dropdown');

    fireEvent.click(await screen.findByRole('combobox'));
    await screen.findByRole('listbox');
    const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-overlay-kind="dropdown"]'));
    const nested = layers.find((layer) => layer !== node);
    expect(nested).toBeDefined();

    const parse = (expression: string): { band: string; position: number } => {
      const match = /^(?:calc\()?var\((--[\w-]+)\)(?: \+ (\d+)\))?$/u.exec(expression.trim());
      expect(match, expression).not.toBeNull();
      return { band: match![1], position: Number(match![2] ?? 0) };
    };
    const own = parse(node.style.getPropertyValue('--ds-popover-instance-z-index'));
    const above = parse(
      (nested as HTMLElement).style.zIndex ||
        (nested as HTMLElement).style.getPropertyValue('z-index'),
    );
    expect(own.band).toBe('--ds-z-index-dropdown');
    expect(above.band).toBe('--ds-z-index-dropdown');
    expect(above.position).toBeGreaterThan(own.position);
  });

  it('flips a bottom-end request to the top when the bottom clips, and mirrors the end alignment in RTL', async () => {
    const rects = new Map<string, DOMRect>();
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.getAttribute('role') === 'dialog') {
        const top = Number.parseFloat(this.style.top) || 0;
        const left = Number.parseFloat(this.style.left) || 0;
        return new DOMRect(left, top, 300, 200);
      }
      if (this.textContent === 'Filters' && this.tagName === 'BUTTON') {
        return rects.get('anchor') ?? new DOMRect(0, 0, 0, 0);
      }
      return new DOMRect(0, 0, 0, 0);
    });
    rects.set('anchor', new DOMRect(700, window.innerHeight - 40, 100, 30));

    const { unmount } = render(<Harness initialFocus="none" />);
    await waitFor(() => expect(surface().getAttribute('data-placement')).toMatch(/^top/));
    expect(surface()).toHaveAttribute('data-preferred-placement', 'bottom-end');
    expect(surface().getAttribute('data-ds-position-strategy')).toBe('js');
    unmount();

    // Unclipped: the end alignment meets the anchor's right edge in LTR and
    // its left edge in RTL (anchor spans 700..800, the surface is 300 wide).
    rects.set('anchor', new DOMRect(700, 100, 100, 30));
    const ltr = render(<Harness initialFocus="none" />);
    await waitFor(() => expect(surface().style.left).toBe('500px'));
    expect(surface().getAttribute('data-placement')).toMatch(/^bottom/);
    ltr.unmount();

    render(
      <div dir="rtl">
        <Harness initialFocus="none" />
      </div>,
    );
    await waitFor(() => expect(surface().style.left).toBe('700px'));
  });

  it('is a named non-modal dialog and never clones the caller trigger', () => {
    render(<Harness />);
    const node = surface();
    expect(node).toHaveAttribute('role', 'dialog');
    expect(node).toHaveAttribute('aria-modal', 'false');
    expect(node).toHaveAttribute('id', 'disclosure');
    const anchor = screen.getByRole('button', { name: 'Filters' });
    expect(anchor).not.toHaveAttribute('aria-haspopup');
    expect(anchor.parentElement).toBe(screen.getByTestId('root'));

    function LabelledBy() {
      const anchorRef = useRef<HTMLButtonElement | null>(null);
      return (
        <div>
          <span id="external-label">External label</span>
          <button ref={anchorRef} type="button">
            Other
          </button>
          <ModernPopover
            anchor={anchorRef}
            open
            onOpenChange={() => {}}
            id="labelled"
            aria-labelledby="external-label"
            initialFocus="none"
            content="Body"
          />
        </div>
      );
    }
    render(<LabelledBy />);
    expect(screen.getByRole('dialog', { name: 'External label' })).toHaveAttribute('id', 'labelled');
  });
});

describe('Popover anchored mode -- development guards and refusals', () => {
  it('warns when the caller portals the surface out of its anchor scope', async () => {
    function ForeignPortal() {
      const anchorRef = useRef<HTMLButtonElement | null>(null);
      return (
        <div data-ds-root="" data-tenant="acme">
          <button ref={anchorRef} type="button">
            Filters
          </button>
          {createPortal(
            <ModernPopover
              anchor={anchorRef}
              open
              onOpenChange={() => {}}
              id="foreign"
              aria-label="Filter panel"
              initialFocus="none"
              content="Body"
            />,
            document.body,
          )}
        </div>
      );
    }
    render(<ForeignPortal />);
    await waitFor(() =>
      expect(popoverWarnings().some((message) => message.includes("DS/tenant scope"))).toBe(true),
    );
  });

  it('warns when an ancestor of the mount point traps fixed positioning', async () => {
    function Trapped() {
      const anchorRef = useRef<HTMLButtonElement | null>(null);
      return (
        <div data-ds-root="" data-tenant="acme">
          <button ref={anchorRef} type="button">
            Filters
          </button>
          <div style={{ transform: 'translateX(0px)' }}>
            <ModernPopover
              anchor={anchorRef}
              open
              onOpenChange={() => {}}
              id="trapped"
              aria-label="Filter panel"
              initialFocus="none"
              content="Body"
            />
          </div>
        </div>
      );
    }
    render(<Trapped />);
    await waitFor(() =>
      expect(popoverWarnings().some((message) => message.includes('containing block'))).toBe(true),
    );
  });

  it('warns when the anchor already carries another overlay anchor-name', async () => {
    function Shared() {
      const anchorRef = useRef<HTMLButtonElement | null>(null);
      return (
        <div data-ds-root="" data-tenant="acme">
          <button
            ref={(node) => {
              anchorRef.current = node;
              node?.style.setProperty('anchor-name', '--someone-else');
            }}
            type="button"
          >
            Filters
          </button>
          <ModernPopover
            anchor={anchorRef}
            open
            onOpenChange={() => {}}
            id="shared"
            aria-label="Filter panel"
            initialFocus="none"
            content="Body"
          />
        </div>
      );
    }
    render(<Shared />);
    await waitFor(() =>
      expect(popoverWarnings().some((message) => message.includes('--someone-else'))).toBe(true),
    );
  });

  it('raises no warning when mounted correctly', async () => {
    render(<Harness />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Query' })).toHaveFocus());
    expect(popoverWarnings()).toEqual([]);
  });

  it.each(['classic', 'rustic'] as const)('refuses the anchored mode on the frozen %s engine', (engine) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    function Frozen() {
      const anchorRef = useRef<HTMLButtonElement | null>(null);
      return (
        <Popover
          engine={engine}
          anchor={anchorRef}
          open
          onOpenChange={() => {}}
          id="frozen"
          aria-label="Filter panel"
          content="Body"
        />
      );
    }
    expect(() => render(<Frozen />)).toThrow(/anchored mode .* modern engine only/);
  });
});
