import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CollectionFilterDropdown } from '../filter-dropdown';

function makeRect({
  left,
  top,
  width,
  height,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
}): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  } as DOMRect;
}

const originalVisualViewport = Object.getOwnPropertyDescriptor(
  window,
  'visualViewport',
);

function installVisualViewport(width = 320, height = 480): EventTarget {
  const visualViewport = new EventTarget();
  Object.defineProperties(visualViewport, {
    width: { configurable: true, value: width },
    height: { configurable: true, value: height },
    offsetLeft: { configurable: true, value: 0 },
    offsetTop: { configurable: true, value: 0 },
  });
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    value: visualViewport,
  });
  return visualViewport;
}

function Harness({ onOpenChange = () => {} }: {
  onOpenChange?: (open: boolean) => void;
}) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    onOpenChange(nextOpen);
  };

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        aria-controls="collection-filter-panel"
        aria-expanded={open}
        onClick={() => handleOpenChange(!open)}
      >
        Filters
      </button>
      <CollectionFilterDropdown
        anchorRef={anchorRef}
        open={open}
        onOpenChange={handleOpenChange}
        id="collection-filter-panel"
        ariaLabel="Collection filters"
      >
        <label>
          Status
          <select aria-label="Status filter">
            <option>All</option>
            <option>Active</option>
          </select>
        </label>
        <button type="button">Apply filters</button>
      </CollectionFilterDropdown>
      <button type="button">Outside destination</button>
    </>
  );
}

function PortalHarness() {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button ref={anchorRef} type="button" onClick={() => setOpen((current) => !current)}>
        Portal filters
      </button>
      <CollectionFilterDropdown
        anchorRef={anchorRef}
        open={open}
        onOpenChange={setOpen}
        id="portal-filter-panel"
        ariaLabel="Portal filters"
      >
        <button type="button">Filter control</button>
      </CollectionFilterDropdown>
      {open
        ? createPortal(
            <div data-rottay-portal>
              <button type="button">Nested option</button>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function anchorWithRect(rect: DOMRect | (() => DOMRect)): HTMLButtonElement {
  const anchor = screen.getByRole('button', { name: 'Filters' });
  anchor.getBoundingClientRect = vi.fn(() => (
    typeof rect === 'function' ? rect() : rect
  ));
  return anchor;
}

afterEach(() => {
  vi.restoreAllMocks();
  if (originalVisualViewport) {
    Object.defineProperty(window, 'visualViewport', originalVisualViewport);
  } else {
    Reflect.deleteProperty(window, 'visualViewport');
  }
});

describe('CollectionFilterDropdown', () => {
  it('renders as a fixed sibling, clamps to the viewport, and focuses its first control', async () => {
    installVisualViewport();
    const { container } = render(<Harness />);
    const anchor = anchorWithRect(makeRect({
      left: 276,
      top: 18,
      width: 36,
      height: 36,
    }));

    fireEvent.click(anchor);

    const dialog = await screen.findByRole('dialog', {
      name: 'Collection filters',
    });
    expect(dialog).toHaveAttribute('id', 'collection-filter-panel');
    expect(dialog).toHaveAttribute('aria-modal', 'false');
    expect(dialog).toHaveAttribute('data-part', 'filter-dropdown-surface');
    expect(dialog).toHaveAttribute('data-placement', 'bottom');
    expect(dialog).toHaveStyle({
      left: '12px',
      position: 'fixed',
      top: '62px',
      visibility: 'visible',
    });
    expect(dialog.parentElement).toBe(anchor.parentElement);
    expect(container.contains(dialog)).toBe(true);
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Status filter' })).toHaveFocus();
    });
  });

  it('dismisses on Escape and restores focus to its anchor', async () => {
    installVisualViewport();
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);
    const anchor = anchorWithRect(makeRect({
      left: 20,
      top: 20,
      width: 80,
      height: 36,
    }));
    anchor.focus();
    fireEvent.click(anchor);
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Status filter' })).toHaveFocus();
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Collection filters' })).not.toBeInTheDocument();
      expect(anchor).toHaveFocus();
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('ignores in-panel pointer events, dismisses outside, and repositions on viewport changes', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => (
      window.setTimeout(() => callback(performance.now()), 0)
    ));
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((handle) => {
      window.clearTimeout(handle);
    });
    const visualViewport = installVisualViewport(500, 600);
    render(<Harness />);
    let anchorRect = makeRect({ left: 420, top: 20, width: 60, height: 36 });
    const anchor = anchorWithRect(() => anchorRect);
    fireEvent.click(anchor);

    const dialog = await screen.findByRole('dialog', { name: 'Collection filters' });
    const select = screen.getByRole('combobox', { name: 'Status filter' });
    fireEvent.pointerDown(select);
    expect(dialog).toBeInTheDocument();

    anchorRect = makeRect({ left: 24, top: 300, width: 60, height: 36 });
    fireEvent(window, new Event('resize'));
    await waitFor(() => {
      expect(dialog.style.left).toBe('12px');
      expect(dialog.style.top).not.toBe('64px');
    });

    anchorRect = makeRect({ left: 24, top: 420, width: 60, height: 36 });
    visualViewport.dispatchEvent(new Event('scroll'));
    await waitFor(() => {
      expect(dialog).toHaveAttribute('data-placement', 'top');
    });

    const outsideDestination = screen.getByRole('button', { name: 'Outside destination' });
    fireEvent.pointerDown(outsideDestination);
    outsideDestination.focus();
    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
      expect(outsideDestination).toHaveFocus();
    });
  });

  it('keeps the parent disclosure open while a nested control portal is used', async () => {
    installVisualViewport();
    render(<PortalHarness />);
    const anchor = screen.getByRole('button', { name: 'Portal filters' });
    anchor.getBoundingClientRect = vi.fn(() => makeRect({
      left: 20,
      top: 20,
      width: 100,
      height: 36,
    }));

    fireEvent.click(anchor);
    const dialog = await screen.findByRole('dialog', { name: 'Portal filters' });
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Nested option' }));
    expect(dialog).toBeInTheDocument();

    fireEvent.pointerDown(document.body);
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Portal filters' }))
        .not.toBeInTheDocument();
    });
  });
});
