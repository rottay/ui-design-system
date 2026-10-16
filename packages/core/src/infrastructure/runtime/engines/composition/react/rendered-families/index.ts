/**
 * @fileoverview Rendered-families warming channel - Rottay Design System
 * @description The server records which engine families a response rendered;
 * the client starts exactly those families' chunk loads before hydration asks.
 *
 * @remarks
 * - **Per render, never per process**: the collector is a context value the
 *   OUTERMOST provider creates for its render. Nested providers append to it
 *   and never emit, so a document carries one list.
 * - **Inert JSON**: the list travels in
 *   `<script type="application/json" data-ds-rendered-families>`, after the
 *   provider's children. The client renders the same text, read once from
 *   that node, so hydration has nothing to reconcile; with no node (a
 *   client-only mount) nothing renders and nothing warms.
 * - **Public loaders only**: a warm is the family's own `loader()` call,
 *   fire-and-forget, at most once per loader. The lazy keeps its own call, so a
 *   failed warm leaves the lazy to load on its own (webpack drops a failed
 *   chunk's state; native-ESM loaders are not claimed).
 * - **Declared miss**: a family first rendered inside a boundary that
 *   suspends on the server renders after the list is fixed and is not warmed.
 * - **Custom packs are never listed**: they resolve from the pack registry
 *   and have no chunk.
 * - **Dark**: the channel stays closed (no list, no script, no warm) until
 *   the joint validation matrix rules; {@link RENDERED_FAMILIES_CHANNEL}.
 *
 * @module System/Engines/RenderedFamilies
 * @category System
 * @package @rottay/design-system
 */

import {
  createContext,
  createElement,
  useContext,
  useState,
  type ReactNode,
} from 'react';

/** Records `displayName@engine` for a family a server render reached. */
export interface RenderedFamiliesCollector {
  record(family: string): void;
}

type Loader = () => Promise<unknown>;

export const RENDERED_FAMILIES_ATTRIBUTE = 'data-ds-rendered-families';
const SELECTOR = `script[${RENDERED_FAMILIES_ATTRIBUTE}]`;

/** Closed until the joint matrix GO: no list, no script and no warm while false. */
export const RENDERED_FAMILIES_CHANNEL = { open: false };

export const RenderedFamiliesContext = createContext<RenderedFamiliesCollector | null>(null);

const onServer = () => typeof window === 'undefined';

/** The client holds the outermost position without recording: its list is the server's. */
const CLIENT_COLLECTOR: RenderedFamiliesCollector = { record() {} };

function serialize(families: ReadonlySet<string>): string {
  return JSON.stringify([...families].sort()).replace(/</g, '\\u003c');
}

function listScript(text: string): ReactNode {
  return createElement('script', {
    type: 'application/json',
    [RENDERED_FAMILIES_ATTRIBUTE]: '',
    dangerouslySetInnerHTML: { __html: text },
  });
}

/** Rendered after the children, so it reads the list once they have recorded. */
function RenderedFamiliesList({ families }: { families: ReadonlySet<string> }): ReactNode {
  return listScript(serialize(families));
}

interface ChannelRoot {
  collector: RenderedFamiliesCollector;
  families?: Set<string>;
  clientText?: string | null;
}

function createChannelRoot(): ChannelRoot {
  if (onServer()) {
    const families = new Set<string>();
    return { collector: { record: (family) => families.add(family) }, families };
  }
  const node = document.querySelector(SELECTOR);
  return { collector: CLIENT_COLLECTOR, clientText: node ? node.textContent ?? '' : null };
}

/**
 * The outermost mount owns the collector and the list; a nested mount passes
 * its children through to the collector above it.
 */
export function RenderedFamiliesRoot({ children }: { children: ReactNode }): ReactNode {
  const outer = useContext(RenderedFamiliesContext);
  const [root] = useState(() => (outer || !RENDERED_FAMILIES_CHANNEL.open ? null : createChannelRoot()));
  if (!root) return children;
  return createElement(
    RenderedFamiliesContext.Provider,
    { value: root.collector },
    children,
    root.families
      ? createElement(RenderedFamiliesList, { families: root.families })
      : root.clientText == null
        ? null
        : listScript(root.clientText),
  );
}

const registered = new Map<string, Set<Loader>>();
const warmed = new WeakSet<Loader>();
let listedFrom: Element | null = null;
let listed: ReadonlySet<string> = new Set();
let awaitingParse = false;

/** `undefined` while the text does not parse: a list still streaming in, or a broken one. */
function parse(text: string | null): ReadonlySet<string> | undefined {
  try {
    const value: unknown = JSON.parse(text ?? '[]');
    return new Set(Array.isArray(value) ? value.filter((entry) => typeof entry === 'string') : []);
  } catch {
    return undefined;
  }
}

/**
 * The list, read once per node; `null` while the document carries none or its
 * text is still incomplete. Once parsing is over, unparseable text reads as empty.
 */
function readListed(): ReadonlySet<string> | null {
  if (listedFrom?.isConnected) return listed;
  const node = document.querySelector(SELECTOR);
  if (!node) return null;
  const families = parse(node.textContent);
  if (!families && document.readyState === 'loading') return null;
  listedFrom = node;
  listed = families ?? new Set();
  return listed;
}

function warm(loader: Loader): void {
  if (warmed.has(loader)) return;
  warmed.add(loader);
  try {
    loader().catch(() => {});
  } catch {
    // A loader that throws synchronously fails its lazy the same way; the warm adds nothing.
  }
}

function warmListed(): void {
  awaitingParse = false;
  const families = readListed();
  if (!families) return;
  for (const family of families) registered.get(family)?.forEach(warm);
}

/**
 * Registers a family's loader under `displayName@engine` (client only). It
 * warms at once when the list is already parsed, else on `DOMContentLoaded`.
 */
export function registerWarmableFamily(family: string, loader: Loader): void {
  if (!RENDERED_FAMILIES_CHANNEL.open || onServer() || typeof document === 'undefined') return;
  let loaders = registered.get(family);
  if (!loaders) registered.set(family, (loaders = new Set()));
  loaders.add(loader);
  const families = readListed();
  if (families) {
    if (families.has(family)) warm(loader);
  } else if (document.readyState === 'loading' && !awaitingParse) {
    awaitingParse = true;
    document.addEventListener('DOMContentLoaded', warmListed, { once: true });
  }
}
