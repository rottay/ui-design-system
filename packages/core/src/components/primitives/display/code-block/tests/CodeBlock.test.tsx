import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CodeBlock, registerHighlighter } from '../index';
import type { HighlighterAdapter, HighlightTokenLine } from '../index';

afterEach(() => {
  // Unmount before clearing the registry: `registerHighlighter(null)` emits to
  // `useSyncExternalStore` subscribers, and notifying a still-mounted block
  // re-renders it outside `act` (React act warning). Cleanup first keeps the
  // notification silent.
  cleanup();
  registerHighlighter(null);
  vi.restoreAllMocks();
});

const LABELS = { copyLabel: 'Copy', copiedLabel: 'Copied' };

describe('CodeBlock -- plain rendering', () => {
  it('renders the code verbatim inside a pre/code block', () => {
    const { container } = render(<CodeBlock code={'const a = 1;\nconst b = 2;'} {...LABELS} />);
    expect(container.querySelector('pre code')).toBeTruthy();
    expect(container.textContent).toContain('const a = 1;');
    expect(container.textContent).toContain('const b = 2;');
  });

  it('renders a line-number gutter when requested', () => {
    const { container } = render(<CodeBlock code={'one\ntwo\nthree'} showLineNumbers {...LABELS} />);
    expect(container.querySelectorAll('[data-part="line-number"]')).toHaveLength(3);
  });

  it('emphasizes highlighted lines', () => {
    const { container } = render(<CodeBlock code={'a\nb\nc'} highlightLines={[2]} {...LABELS} />);
    expect(container.querySelectorAll('[data-highlighted="true"]')).toHaveLength(1);
  });

  it('does not execute embedded markup (code is inert text)', () => {
    const { container } = render(<CodeBlock code={'<script>alert(1)</script>'} {...LABELS} />);
    expect(container.querySelector('script')).toBeNull();
    expect(container.textContent).toContain('<script>alert(1)</script>');
  });
});

describe('CodeBlock -- copy control', () => {
  it('exposes the idle copy label and copies to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    render(<CodeBlock code={'payload'} {...LABELS} />);
    const button = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(button);

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('payload'));
    await screen.findByRole('button', { name: 'Copied' });
  });
});

describe('CodeBlock -- highlighter adapter', () => {
  it('renders adapter tokens with their colors when one is registered', async () => {
    const adapter: HighlighterAdapter = {
      id: 'test',
      ssr: true,
      highlight: () => [
        {
          tokens: [
            { content: 'const', color: 'rgb(1, 2, 3)', fontStyle: 'bold' },
            { content: ' x = 1;' },
          ],
        },
      ],
    };
    registerHighlighter(adapter);

    const { container } = render(<CodeBlock code={'const x = 1;'} {...LABELS} />);
    await screen.findByText('const');
    const tokenSpans = container.querySelectorAll('[data-part="token"]');
    expect(tokenSpans.length).toBeGreaterThanOrEqual(2);
    expect((tokenSpans[0] as HTMLElement).style.color).toBe('rgb(1, 2, 3)');
  });

  it('falls back to the plain renderer when no adapter is registered', () => {
    const { container } = render(<CodeBlock code={'plain text'} {...LABELS} />);
    expect(container.textContent).toContain('plain text');
    expect(container.querySelector('[data-part="token"]')).toBeNull();
  });
});

describe('CodeBlock -- per-line adapter tokens', () => {
  const ZWSP = String.fromCharCode(0x200b);
  const lineContents = (container: HTMLElement): HTMLElement[] =>
    Array.from(container.querySelectorAll<HTMLElement>('[data-part="line-content"]'));

  it('places each async adapter token line on its own source line, in order', async () => {
    registerHighlighter({
      id: 'per-line',
      highlight: async () => [
        { tokens: [{ content: 'alpha' }] },
        { tokens: [{ content: 'beta' }, { content: '!' }] },
        { tokens: [{ content: 'gamma' }] },
      ],
    });
    const { container } = render(<CodeBlock code={'a\nb\nc'} {...LABELS} />);
    await screen.findByText('gamma');
    const rows = lineContents(container);
    expect(rows.map((row) => row.textContent)).toEqual(['alpha', 'beta!', 'gamma']);
    expect(rows.map((row) => row.querySelectorAll('[data-part="token"]').length)).toEqual([1, 2, 1]);
  });

  it('renders the verbatim source line wherever the adapter returns no token line', async () => {
    registerHighlighter({ id: 'short', highlight: () => [{ tokens: [{ content: 'first' }] }] });
    const { container } = render(<CodeBlock code={'one\n\nthree'} {...LABELS} />);
    await screen.findByText('first');
    const rows = lineContents(container);
    expect(rows.map((row) => row.textContent)).toEqual(['first', ZWSP, 'three']);
    expect(rows.slice(1).map((row) => row.querySelector('[data-part="token"]'))).toEqual([null, null]);
  });

  it('keeps each plain row verbatim, an empty row as a zero-width space, and trims one trailing newline', () => {
    const { container } = render(<CodeBlock code={'a\n\nb\n'} showLineNumbers {...LABELS} />);
    expect(lineContents(container).map((row) => row.textContent)).toEqual(['a', ZWSP, 'b']);
    expect(container.querySelectorAll('[data-part="line-number"]')).toHaveLength(3);
  });

  it('renders plainly when an out-of-contract adapter result leaves no token lines', async () => {
    const highlight = vi.fn(() => (() => undefined) as unknown as HighlightTokenLine[]);
    registerHighlighter({ id: 'updater-undefined', highlight });
    const { container } = render(<CodeBlock code={'x\ny'} {...LABELS} />);
    await waitFor(() => expect(highlight).toHaveBeenCalled());
    expect(lineContents(container).map((row) => row.textContent)).toEqual(['x', 'y']);
    expect(container.querySelector('[data-part="token"]')).toBeNull();
  });

  it('never indexes a callable token-line value', async () => {
    const callable = Object.assign(() => undefined, { 0: { tokens: [{ content: 'leaked' }] } });
    const highlight = vi.fn(() => (() => callable) as unknown as HighlightTokenLine[]);
    registerHighlighter({ id: 'updater-callable', highlight });
    const { container } = render(<CodeBlock code={'kept'} {...LABELS} />);
    await waitFor(() => expect(highlight).toHaveBeenCalled());
    expect(lineContents(container).map((row) => row.textContent)).toEqual(['kept']);
    expect(container.querySelector('[data-part="token"]')).toBeNull();
  });
});
