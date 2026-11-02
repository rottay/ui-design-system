import React, { createRef, Suspense } from "react";
import { renderToString } from "react-dom/server";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Grid, GridItem, type GridItemProps } from "@/components/primitives/layout/grid";
import { ModernGrid } from "@/components/primitives/layout/grid/engines/modern";
import { EngineProvider } from "@/infrastructure/runtime/engines/composition/react/provider";

const resizeObservers = new Set<ResizeControl>();
const mutationObservers = new Set<MutationControl>();
const resizeListeners = new Set<EventListenerOrEventListenerObject>();
const NativeMutationObserver = window.MutationObserver;
let width = 320;
let probeReads = 0;

class ResizeControl {
  targets = new Set<Element>();
  constructor(readonly callback: ResizeObserverCallback) {}
  observe = (target: Element) => { this.targets.add(target); resizeObservers.add(this); };
  unobserve = (target: Element) => { this.targets.delete(target); };
  disconnect = () => { this.targets.clear(); resizeObservers.delete(this); };
}
class MutationControl {
  native: MutationObserver;
  constructor(callback: MutationCallback) { this.native = new NativeMutationObserver(callback); }
  observe = (target: Node, options: MutationObserverInit) => {
    mutationObservers.add(this); this.native.observe(target, options);
  };
  disconnect = () => { mutationObservers.delete(this); this.native.disconnect(); };
  takeRecords = () => this.native.takeRecords();
}
const cell = (container: HTMLElement, id: string) => {
  const node = container.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  expect(node, id).not.toBeNull();
  return node!;
};
async function deliver(root: HTMLElement, inlineSize: number) {
  await act(async () => {
    resizeObservers.forEach(observer => { if (observer.targets.has(root)) observer.callback([
      { target: root, contentRect: { width: inlineSize, height: 20 }, contentBoxSize: [{ inlineSize, blockSize: 20 }] } as unknown as ResizeObserverEntry,
    ], observer as unknown as ResizeObserver); });
  });
}
async function mounted(node: React.ReactElement) {
  const result = render(node);
  await waitFor(() => expect(result.container.querySelector('.rottay-grid--modern')).not.toBeNull());
  return result;
}
beforeEach(() => {
  width = 320; probeReads = 0;
  vi.stubGlobal('ResizeObserver', ResizeControl);
  vi.stubGlobal('MutationObserver', MutationControl);
  const nativeRead = window.getComputedStyle.bind(window);
  vi.spyOn(window, 'getComputedStyle').mockImplementation(node => {
    if (!(node instanceof HTMLElement)) return nativeRead(node);
    if (node.hasAttribute('data-grid-track-probe')) {
      probeReads++;
      const minimum = parseFloat(node.parentElement?.closest('[data-minimum]')?.getAttribute('data-minimum') || '256');
      const count = Math.max(1, Math.floor((parseFloat(node.style.inlineSize) + 16) / (minimum + 16)));
      return { gridTemplateColumns: Array.from({ length: count }, () => '0px').join(' ') } as CSSStyleDeclaration;
    }
    return { width: `${width}px`, height: '20px', boxSizing: 'content-box', writingMode: 'horizontal-tb',
      overflowY: node.dataset.gutter ? 'scroll' : 'visible', overflowX: 'visible',
      paddingLeft: '0', paddingRight: '0', borderLeftWidth: '0', borderRightWidth: '0' } as CSSStyleDeclaration;
  });
  const add = window.addEventListener.bind(window);
  const remove = window.removeEventListener.bind(window);
  vi.spyOn(window, 'addEventListener').mockImplementation((kind, callback, options) => {
    if (kind === 'resize') resizeListeners.add(callback);
    add(kind, callback, options);
  });
  vi.spyOn(window, 'removeEventListener').mockImplementation((kind, callback, options) => {
    if (kind === 'resize') resizeListeners.delete(callback);
    remove(kind, callback, options);
  });
});
afterEach(() => {
  cleanup();
  expect(resizeObservers.size).toBe(0);
  expect(mutationObservers.size).toBe(0);
  expect(resizeListeners.size).toBe(0);
  expect(document.querySelectorAll('[data-grid-track-probe]').length).toBe(0);
  vi.restoreAllMocks(); vi.unstubAllGlobals();
});
const endpoints: GridItemProps[] = [{}, { colStart: 'auto' }, { colEnd: 'auto' }, { colStart: 'auto', colEnd: 'auto' }];
describe('public Grid.Item adaptive placement', () => {
  it.each(endpoints)('clamps automatic endpoints %j after narrow measurement and restores wide spans', async endpoints => {
    const { container } = await mounted(<Grid engine="modern" autoFit data-gutter="true">
      <Grid.Item {...endpoints} span={3} rowSpan={4} data-testid="auto" />
      <GridItem {...endpoints} span={2} colSpan={3} data-testid="alias" />
      <Grid.Item data-testid="later" />
    </Grid>);
    const root = container.querySelector<HTMLElement>('.rottay-grid--modern')!;
    await deliver(root, 320);
    const prefix = endpoints.colStart === 'auto' ? 'auto / ' : '';
    expect(cell(container, 'auto').style.gridColumn).toBe(`${prefix}span 1`);
    expect(cell(container, 'alias').style.gridColumn).toBe(`${prefix}span 1`);
    expect(cell(container, 'auto').style.gridRow).toBe('span 4');
    expect(cell(container, 'later').style.gridColumn).toBe('');
    await deliver(root, 1280);
    expect(cell(container, 'auto').style.gridColumn).toBe(`${prefix}span 3`);
    expect(cell(container, 'alias').style.gridColumn).toBe(`${prefix}span 3`);
    await deliver(root, 360);
    expect(cell(container, 'auto').style.gridColumn).toBe(`${prefix}span 1`);
  });

  it('preserves anchored requested spans and explicit styles above active narrow and wide capacity', async () => {
    const { container } = await mounted(<Grid engine="modern" minColumnWidth={256}>
      <Grid.Item span={8} colStart={2} data-testid="positive" />
      <Grid.Item span={8} colStart={-1} data-testid="negative" />
      <Grid.Item span={8} colEnd={3} data-testid="end-positive" />
      <Grid.Item span={8} colEnd={-2} colStart="auto" data-testid="end-negative" />
      <Grid.Item colStart={1} colEnd={-1} data-testid="lines" />
      <Grid.Item style={{ gridColumn: 'named-start / span 8' }} data-testid="named" />
      <Grid.Item style={{ gridColumn: 'span 8' }} data-testid="style" />
      <Grid.Item area="hero" span={8} rowSpan={8} data-testid="area" />
      <Grid.Item span={8} data-testid="automatic" />
    </Grid>);
    const root = container.querySelector<HTMLElement>('.rottay-grid--modern')!;
    const capacities = [{ width: 320, limit: 1 }, { width: 1280, limit: 4 }];
    for (const capacity of capacities) {
      await deliver(root, capacity.width);
      expect(cell(container, 'automatic').style.gridColumn).toBe(`span ${capacity.limit}`);
      expect(cell(container, 'positive').style.gridColumn).toBe('2 / span 8');
      expect(cell(container, 'negative').style.gridColumn).toBe('-1 / span 8');
      expect(cell(container, 'end-positive').style.gridColumn).toBe('span 8');
      expect(cell(container, 'end-negative').style.gridColumn).toBe('auto / span 8');
      expect(cell(container, 'lines').style.gridColumn).toBe('1 / -1');
      expect(cell(container, 'named').style.gridColumn).toBe('named-start / span 8');
      expect(cell(container, 'style').style.gridColumn).toBe('span 8');
      expect(cell(container, 'area').style.gridArea).toBe('hero');
      expect(cell(container, 'area').style.gridRow).toBe('');
    }
  });

  it('preserves anchored and item-style negative controls independently of the automatic cell', async () => {
    const { container } = await mounted(<Grid engine="modern" autoFit>
      <Grid.Item span={8} colStart={2} data-testid="positive-control" />
      <Grid.Item span={8} colStart={-1} data-testid="negative-control" />
      <Grid.Item span={8} colEnd={-1} data-testid="end-control" />
      <Grid.Item style={{ gridColumn: 'named / span 8' }} data-testid="named-control" />
      <Grid.Item style={{ gridColumn: 'span 8' }} data-testid="style-control" />
    </Grid>);
    const root = container.querySelector<HTMLElement>('.rottay-grid--modern')!;
    const widths = [320, 1280];
    for (const size of widths) {
      await deliver(root, size);
      expect(cell(container, 'positive-control').style.gridColumn).toBe('2 / span 8');
      expect(cell(container, 'negative-control').style.gridColumn).toBe('-1 / span 8');
      expect(cell(container, 'end-control').style.gridColumn).toBe('span 8');
      expect(cell(container, 'named-control').style.gridColumn).toBe('named / span 8');
      expect(cell(container, 'style-control').style.gridColumn).toBe('span 8');
    }
  });

  it.each(['classic', 'rustic'] as const)('retains standalone %s generic item behavior', async engine => {
    const ref = createRef<HTMLElement>();
    const { container } = render(<Grid ref={ref} engine={engine} columns={4}>
      <Grid.Item span={8} colSpan={3} rowSpan={4} data-testid="frozen-alone" style={{ gridColumn: 'span 9' }} />
    </Grid>);
    await waitFor(() => expect(container.querySelector(`.rottay-grid--${engine}`)).not.toBeNull());
    expect(cell(container, 'frozen-alone').style.gridColumn).toBe('span 3');
    expect(cell(container, 'frozen-alone').style.gridRow).toBe('span 4');
    expect(ref.current).toBe(container.firstElementChild);
    expect(mutationObservers.size).toBe(0);
  });

  it('keeps no-provider root refusal and standalone generic placement precedence', () => {
    expect(() => renderToString(<Grid />)).toThrow(/no engine is declared/);
    expect(renderToString(<GridItem span={3} colSpan={2} rowSpan={4} style={{ gridColumn: 'span 9' }} />)).toContain('grid-column:span 2;grid-row:span 4');
  });

  it('retains generic prop-over-style placement and alignment precedence with and without a limiter', async () => {
    const item = <Grid.Item data-testid="precedence" span={8} colSpan={3} rowSpan={4} placeSelf="center" alignSelf="end" zIndex={2}
      style={{ gridColumn: 'span 9', gridRow: 'span 9', placeSelf: 'end', zIndex: 9, color: 'red' }} />;
    const { container, rerender } = await mounted(<Grid engine="modern" autoFit>{item}</Grid>);
    const root = container.querySelector<HTMLElement>('.rottay-grid--modern')!;
    await deliver(root, 320);
    expect(cell(container, 'precedence').style.gridColumn).toBe('span 1');
    expect(cell(container, 'precedence').style.gridRow).toBe('span 4');
    expect(cell(container, 'precedence').style.placeSelf).toBe('center');
    expect(cell(container, 'precedence').style.zIndex).toBe('2');
    expect(cell(container, 'precedence').style.color).toBe('red');
    rerender(item);
    expect(cell(container, 'precedence').style.gridColumn).toBe('span 3');
  });

  it('preserves standalone/no-provider placement, polymorphism, refs and public anatomy', () => {
    expect(Grid.Item).toBe(GridItem);
    const ref = createRef<HTMLElement>();
    const { container } = render(<GridItem ref={ref} as="section" span={3} data-testid="alone" data-part="caller" data-state="caller" />);
    expect(cell(container, 'alone').style.gridColumn).toBe('span 3');
    expect(ref.current).toBe(cell(container, 'alone'));
    expect(ref.current?.tagName).toBe('SECTION');
    expect(ref.current?.dataset.part).toBe('grid-cell');
    expect(ref.current?.hasAttribute('data-state')).toBe(false);
  });

  const templates = [{ templateColumns: '1fr 1fr' }, { style: { gridTemplateColumns: '1fr 1fr' } },
    { style: { gridTemplate: 'auto / 1fr 1fr' } }, { style: { grid: 'auto / 1fr 1fr' } }, { columns: 4 as const, autoFit: false }];
  it.each(templates)('preserves root override %j and disconnects the limiter', async props => {
    const ref = createRef<HTMLElement>();
    const { container, rerender } = await mounted(<Grid ref={ref} engine="modern" autoFit><Grid.Item span={3} data-testid="item" /></Grid>);
    await deliver(ref.current!, 320);
    expect(cell(container, 'item').style.gridColumn).toBe('span 1');
    rerender(<Grid ref={ref} engine="modern" autoFit {...props}><Grid.Item span={3} data-testid="item" /></Grid>);
    await waitFor(() => expect(cell(container, 'item').style.gridColumn).toBe('span 3'));
    expect(mutationObservers.size).toBe(0);
    expect(resizeObservers.size).toBe(1);
  });

  it.each(['classic', 'rustic'] as const)('preserves %s placement outside and nested within Modern', async engine => {
    const { container } = await mounted(<Grid engine="modern" autoFit>
      <Grid.Item span={3} data-testid="outer" />
      <Grid engine={engine} columns={4}><Grid.Item span={3} data-testid="frozen" /></Grid>
      <Grid engine="modern" columns={4}><Grid.Item span={3} data-testid="explicit-inner" /></Grid>
    </Grid>);
    await waitFor(() => expect(container.querySelector(`.rottay-grid--${engine}`)).not.toBeNull());
    expect(cell(container, 'outer').style.gridColumn).toBe('span 1');
    expect(cell(container, 'frozen').style.gridColumn).toBe('span 3');
    expect(cell(container, 'explicit-inner').style.gridColumn).toBe('span 3');
  });

  it('honors actual engine-provider selection and explicit-engine overrides', async () => {
    const { container } = await mounted(<EngineProvider defaultEngine="modern"><Grid autoFit>
      <Grid.Item span={3} data-testid="selected" />
      <Grid engine="rustic" columns={4}><Grid.Item span={3} data-testid="override" /></Grid>
    </Grid></EngineProvider>);
    await waitFor(() => expect(container.querySelector('.rottay-grid--rustic')).not.toBeNull());
    expect(cell(container, 'selected').style.gridColumn).toBe('span 1');
    expect(cell(container, 'override').style.gridColumn).toBe('span 3');
  });

  it('updates public items for ancestor recipe changes with stable boxes and cleans probes/observers', async () => {
    width = 512;
    const { container } = await mounted(<div data-minimum="384"><Grid engine="modern" autoFit>
      <Grid.Item span={3} data-testid="item" />
    </Grid></div>);
    const root = container.querySelector<HTMLElement>('.rottay-grid--modern')!;
    await deliver(root, 512);
    expect(cell(container, 'item').style.gridColumn).toBe('span 1');
    const ancestor = container.querySelector('[data-minimum]')!;
    const before = probeReads;
    await act(async () => { ancestor.setAttribute('data-minimum', '240'); });
    expect(cell(container, 'item').style.gridColumn).toBe('span 2');
    expect(probeReads).toBe(before + 1);
    await act(async () => { ancestor.setAttribute('data-minimum', '384'); });
    expect(cell(container, 'item').style.gridColumn).toBe('span 1');
    const reads = probeReads;
    await act(async () => { await Promise.resolve(); });
    expect(probeReads).toBe(reads);
  });

  it('isolates nested adaptive Modern capacities', async () => {
    const { container } = await mounted(<Grid engine="modern" autoFit data-testid="outer-root">
      <Grid.Item span={3} data-testid="outer-item" />
      <Grid engine="modern" autoFit data-testid="inner-root"><Grid.Item span={3} data-testid="inner-item" /></Grid>
    </Grid>);
    await deliver(cell(container, 'outer-root'), 320);
    await deliver(cell(container, 'inner-root'), 1280);
    expect(cell(container, 'outer-item').style.gridColumn).toBe('span 1');
    expect(cell(container, 'inner-item').style.gridColumn).toBe('span 3');
  });

  it('keeps deterministic SSR output without measurement and safe initial adaptive placement', () => {
    const html = renderToString(<ModernGrid autoFit><Grid.Item span={3} data-testid="ssr" /></ModernGrid>);
    expect(html).toContain('grid-column:span 1');
    expect(renderToString(<Grid.Item span={3} />)).toContain('grid-column:span 3');
    const frozen = renderToString(<Suspense><Grid engine="classic" columns={4}><Grid.Item span={3} /></Grid></Suspense>);
    expect(frozen).not.toContain('grid-column:span 1');
  });
});
