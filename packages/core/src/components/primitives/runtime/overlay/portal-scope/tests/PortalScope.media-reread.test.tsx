/**
 * The portaled copy of the `--ds-*` scope follows a media-condition change (viewport breakpoint,
 * reduced motion, contrast, print) with no lineage attribute mutation, and media listeners exist
 * only while a consumer renders the snapshot. The setup's matchMedia shim answers `matches` from
 * the viewport width but never fires `change`, so (as in the Layout breakpoint suite) the test
 * installs a factory over it that keeps real listener sets and fires the `change` a browser would.
 * happy-dom keeps computed styles cached across a resize, so a <head> mutation, off the lineage,
 * drops that cache.
 * happy-dom also omits inherited custom properties from computed styles, so the rule targets the anchor.
 */
import fs from "node:fs";
import path from "node:path";
import React, { useState } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as theme from "../../foundation/portal-theme";
import {
  PortalScope,
  readPortalMediaQueries,
  usePortalScope,
  type PortalScopeSnapshot,
} from "..";

vi.mock("../../foundation/portal-theme", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../foundation/portal-theme")>();
  return { ...actual, readDsPortalVariables: vi.fn(actual.readDsPortalVariables) };
});

const WIDE = "(min-width: 1024px)";
const walks = () => vi.mocked(theme.readDsPortalVariables).mock.calls.length;

type MediaListener = (event: Event) => void;
const listeners = new Map<MediaListener, MediaQueryList>();
const liveListeners = () => listeners.size;
const shimMatchMedia = window.matchMedia;
let style: HTMLStyleElement;
let latest: PortalScopeSnapshot | null = null;

beforeEach(() => {
  (window as any).happyDOM.setViewport({ width: 500, height: 800 });
  style = document.createElement("style");
  style.textContent =
    `[data-media-anchor] { --ds-probe-width: narrow; } @media ${WIDE} { [data-media-anchor] { --ds-probe-width: wide; } }`;
  document.head.appendChild(style);
  listeners.clear();
  window.matchMedia = (query: string): MediaQueryList => {
    const shim = shimMatchMedia(query);
    const list = {
      get matches() {
        return shim.matches;
      },
      media: query,
      addEventListener: (_type: string, listener: MediaListener) => listeners.set(listener, list),
      removeEventListener: (_type: string, listener: MediaListener) => listeners.delete(listener),
    } as unknown as MediaQueryList;
    return list;
  };
});

afterEach(() => {
  cleanup();
  style.remove();
  window.matchMedia = shimMatchMedia;
  vi.restoreAllMocks();
});

/** Crosses the breakpoint through the viewport, touching nothing on the anchor lineage. */
async function crossToWide(): Promise<void> {
  document.head.appendChild(document.createElement("meta"));
  const before = new Map([...listeners].map(([listener, list]) => [listener, list.matches]));
  (window as any).happyDOM.setViewport({ width: 1280, height: 800 });
  await act(async () => {
    for (const [listener, list] of listeners) {
      if (list.matches !== before.get(listener)) listener(new Event("change"));
    }
    await Promise.resolve();
  });
}

function watchLineage(element: HTMLElement): MutationRecord[] {
  const records: MutationRecord[] = [];
  const observer = new MutationObserver((batch) => records.push(...batch));
  for (let owner: HTMLElement | null = element; owner; owner = owner.parentElement) {
    observer.observe(owner, { attributes: true });
  }
  afterEach(() => observer.disconnect());
  return records;
}

function Probe({ open }: { open: boolean }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const snapshot = usePortalScope(anchor);
  latest = snapshot;
  return (
    <div data-ds-root="" data-tenant="acme">
      <span data-testid="anchor" data-media-anchor="" ref={setAnchor}>anchor</span>
      {open ? (
        <PortalScope snapshot={snapshot}>
          <span>content</span>
        </PortalScope>
      ) : null}
    </div>
  );
}

const probeValue = (variables: PortalScopeSnapshot["variables"]) =>
  (variables as Record<string, string>)["--ds-probe-width"];

describe("PortalScope -- the portaled --ds copy follows media-condition changes", () => {
  it("an open overlay re-reads across a width breakpoint without any lineage attribute mutation", async () => {
    const { container, getByTestId } = render(<Probe open />);
    const wrapper = () => container.querySelector<HTMLElement>('[data-portal-scope="true"]')!;
    expect(wrapper().style.getPropertyValue("--ds-probe-width")).toBe("narrow");
    const lineageRecords = watchLineage(getByTestId("anchor"));

    await crossToWide();

    expect(lineageRecords.filter((record) => record.target !== wrapper())).toHaveLength(0);
    expect(wrapper().style.getPropertyValue("--ds-probe-width")).toBe("wide");
  });

  it("media listeners exist only while a consumer is registered", () => {
    const { rerender } = render(<Probe open={false} />);
    expect(liveListeners()).toBe(0);
    rerender(<Probe open />);
    expect(liveListeners()).toBeGreaterThan(0);
    rerender(<Probe open={false} />);
    expect(liveListeners()).toBe(0);
  });

  it("with no consumer a media flip re-walks nothing, and the next read is fresh", async () => {
    vi.mocked(theme.readDsPortalVariables).mockClear();
    render(<Probe open={false} />);
    const afterMount = walks();
    expect(afterMount).toBeGreaterThan(0);

    await crossToWide();
    expect(walks()).toBe(afterMount);

    expect(probeValue(latest!.variables)).toBe("wide");
    expect(walks()).toBe(afterMount + 1);
    expect(probeValue(latest!.variables)).toBe("wide");
    expect(walks()).toBe(afterMount + 1);
  });
});

describe("readPortalMediaQueries -- derived from the stylesheets, not a fixed list", () => {
  it("finds every media block of the DS token CSS that declares a --ds-* value", () => {
    const root = path.resolve(__dirname, "../../../../../../foundation/tokens/css");
    const sources: string[] = [];
    (function walk(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(file);
        else if (file.endsWith(".css")) sources.push(fs.readFileSync(file, "utf8"));
      }
    })(root);

    const normalize = (query: string) => query.trim().replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ");
    const expected = new Set<string>();
    let blocks = 0;
    for (const source of sources) {
      const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
      const opener = /@media([^{]+)\{/g;
      for (let match = opener.exec(css); match; match = opener.exec(css)) {
        let depth = 1;
        let end = opener.lastIndex;
        while (depth > 0 && end < css.length) {
          if (css[end] === "{") depth += 1;
          else if (css[end] === "}") depth -= 1;
          end += 1;
        }
        if (/(^|[;{\s])--ds-[\w-]+\s*:/.test(css.slice(opener.lastIndex, end - 1))) {
          blocks += 1;
          expected.add(normalize(match[1]));
        }
      }
    }
    expect(blocks).toBeGreaterThan(0);

    const sheets = sources.map((source) => {
      const element = document.createElement("style");
      element.textContent = source;
      document.head.appendChild(element);
      return element;
    });
    try {
      const derived = new Set(readPortalMediaQueries(document).map(normalize));
      expect([...expected].filter((query) => !derived.has(query))).toEqual([]);
    } finally {
      for (const element of sheets) element.remove();
    }
  });

  it("finds the prefers-color-scheme blocks a followsSystem tenant artifact emits, absent from the token CSS", () => {
    const artifact = document.createElement("style");
    artifact.textContent = [
      "/* TenantThemeArtifact v1 | test | digest */",
      '[data-tenant="acme"] { --ds-color-surface: #ffffff; }',
      '@media (prefers-color-scheme: dark) {\n[data-tenant="acme"]:not([data-theme]) { --ds-color-surface: #0a0a0a; }\n}',
      '@media (prefers-contrast: more) and (prefers-color-scheme: dark) {\n[data-tenant="acme"]:not([data-theme]) { --ds-color-surface: #000000; }\n}',
    ].join("\n");
    document.head.appendChild(artifact);
    try {
      const derived = readPortalMediaQueries(document).map((query) => query.replace(/\s+/g, " "));
      expect(derived).toContain("(prefers-color-scheme: dark)");
      expect(derived).toContain("(prefers-contrast: more) and (prefers-color-scheme: dark)");
    } finally {
      artifact.remove();
    }
  });
});
