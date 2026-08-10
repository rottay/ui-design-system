/** The app-owned prefix is application territory that packages/core must not mint into, and no
 *  existing repo gate scans this kit -- so this file is its enforcement point. */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TextureBackdrop } from "../../../../entrypoints/commercial";

afterEach(() => {
  cleanup();
});

const HERE = dirname(fileURLToPath(import.meta.url));
const COMMERCIAL_ROOT = resolve(HERE, "..");
const TEXTURE_BACKDROP_CSS = resolve(
  COMMERCIAL_ROOT,
  "presentation/framing/texture-backdrop/TextureBackdrop.css",
);

describe("TextureBackdrop opacity bridge — --rt-texture-opacity migrated to --_ds-texture-backdrop-opacity", () => {
  it("sets the family-private custom property on the layer element, never the retired app-namespace name", () => {
    const { container } = render(<TextureBackdrop pattern="dots" opacity={0.12} />);
    const layer = container.querySelector('[data-part="layer"]') as HTMLElement | null;
    expect(layer).not.toBeNull();

    // GREEN post-migration; this is RED against the pre-migration source, which set
    // --rt-texture-opacity instead and left --_ds-texture-backdrop-opacity absent.
    expect(layer?.style.getPropertyValue("--_ds-texture-backdrop-opacity")).toBe("0.12");
    expect(layer?.style.getPropertyValue("--rt-texture-opacity")).toBe("");
    expect(layer?.getAttribute("style") ?? "").not.toContain("--rt-texture-opacity");
  });

  it("omits the inline style entirely when opacity is not supplied (public API unchanged)", () => {
    const { container } = render(<TextureBackdrop pattern="grain" />);
    const layer = container.querySelector('[data-part="layer"]');
    expect(layer?.getAttribute("style")).toBeNull();
  });

  it("reads the same family-private name in TextureBackdrop.css, with the public fallback chain preserved exactly", () => {
    const css = readFileSync(TEXTURE_BACKDROP_CSS, "utf8");

    // GREEN post-migration; this is RED against the pre-migration source, whose declaration read
    // `opacity: var(--rt-texture-opacity, var(--ds-commercial-texture-opacity, 0.03));`.
    expect(css).toContain(
      "opacity: var(--_ds-texture-backdrop-opacity, var(--ds-commercial-texture-opacity, 0.03));",
    );
    expect(css).not.toContain("--rt-texture-opacity");
  });
});

// ---- Decrease-only namespace ratchet ----

const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".css"]);
/** Fixtures are excluded: a test string would otherwise masquerade as a new production
 *  capability, or a deliberate negative lookalike would false-flag. */
const EXCLUDED_DIR_NAMES = new Set(["tests"]);

/** Every `.ts`/`.tsx`/`.css` file under the commercial kit's production source (contracts,
 *  tokens, runtime, presentation), excluding `tests/` directories at any depth. */
function listSourceFiles(root: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = join(root, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;
      out.push(...listSourceFiles(full));
    } else if (SCAN_EXTENSIONS.has(extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

/** Every `--rt-*` occurrence, MINT or read alike. */
const CUSTOM_PROPERTY_TOKEN = /--rt-[a-zA-Z0-9-]+/g;
/** The same token in READ position: `var(--rt-foo, fallback)`. The namespace law makes reading
 *  an app-owned hook the SANCTIONED API, so only mints may be ratcheted. */
const CUSTOM_PROPERTY_READ = /var\(\s*(--rt-[a-zA-Z0-9-]+)/g;
/** The delimiter immediately before the prefix is what separates a real selector or class-list
 *  literal from prose merely naming the prefix. */
const CLASS_TOKEN = /[."](rt-[a-zA-Z0-9_-]+)/g;

/** A decrease-only ratchet: scanning asserts every name found is a MEMBER of these sets, never
 *  that every member is still found, so only an unlisted NEW name can turn this red. */
const KNOWN_CUSTOM_PROPERTIES: ReadonlySet<string> = new Set([
  // (empty) — the migration above retired the family's only --rt-* custom property
  // (--rt-texture-opacity). Any --rt-* reappearing here is new mint debt, not grandfathered.
]);

const KNOWN_CLASSES: ReadonlySet<string> = new Set([
  "rt-ascii-diagram",
  "rt-ascii-diagram__grid",
  "rt-ascii-diagram__visually-hidden",
  "rt-ascii-frame",
  "rt-ascii-frame__body",
  "rt-ascii-frame__corner",
  "rt-ascii-frame__corner--bl",
  "rt-ascii-frame__corner--br",
  "rt-ascii-frame__corner--tl",
  "rt-ascii-frame__corner--tr",
  "rt-ascii-frame__label",
  "rt-crop-marks",
  "rt-crop-marks__body",
  "rt-crop-marks__tick",
  "rt-crop-marks__tick--bl",
  "rt-crop-marks__tick--br",
  "rt-crop-marks__tick--tl",
  "rt-crop-marks__tick--tr",
  "rt-invert-section",
  "rt-mono-stat",
  "rt-mono-stat__label",
  "rt-mono-stat__value",
  "rt-mono-stat__visually-hidden",
  "rt-product-window",
  "rt-product-window__affordance",
  "rt-product-window__caption",
  "rt-product-window__content",
  "rt-product-window__frame",
  "rt-product-window__label",
  "rt-product-window__titlebar",
  "rt-section-frame",
  "rt-section-frame__body",
  "rt-section-frame__dash",
  "rt-section-frame__index",
  "rt-section-frame__label",
  "rt-section-frame__meta",
  "rt-section-frame__title",
  "rt-terminal-block",
  "rt-terminal-block__body",
  "rt-terminal-block__line",
  "rt-terminal-block__prompt",
  "rt-terminal-block__scanlines",
  "rt-terminal-block__title-bar",
  "rt-terminal-block__visual",
  "rt-terminal-block__visually-hidden",
  "rt-texture-backdrop",
  "rt-texture-backdrop__layer",
  "rt-tree-view",
  "rt-tree-view__connector",
  "rt-tree-view__group",
  "rt-tree-view__item",
  "rt-tree-view__label",
  "rt-tree-view__link",
  "rt-tree-view__row",
  "rt-typewriter",
  "rt-typewriter__visual",
  "rt-typewriter__visually-hidden",
]);

function scanTokens(pattern: RegExp, group: 0 | 1): Set<string> {
  const found = new Set<string>();
  for (const file of listSourceFiles(COMMERCIAL_ROOT)) {
    const content = readFileSync(file, "utf8");
    for (const match of content.matchAll(pattern)) {
      found.add(match[group] as string);
    }
  }
  return found;
}

describe("commercial namespace ratchet (decrease-only)", () => {
  it("introduces no new --rt-* custom property anywhere in the commercial kit's production source", () => {
    // Mints only: a read is subtracted, because a zero-tolerance scan that cannot tell a
    // declaration from a `var()` read would go red on the very API the namespace law sanctions.
    const all = scanTokens(CUSTOM_PROPERTY_TOKEN, 0);
    const reads = scanTokens(CUSTOM_PROPERTY_READ, 1);
    const mints = [...all].filter((name) => !reads.has(name));
    const unknown = mints.filter((name) => !KNOWN_CUSTOM_PROPERTIES.has(name)).sort();

    expect(unknown).toEqual([]);
  });

  it("introduces no new .rt-* class anywhere in the commercial kit's production source", () => {
    const found = scanTokens(CLASS_TOKEN, 1);
    const unknown = [...found].filter((name) => !KNOWN_CLASSES.has(name)).sort();

    // A pass here means: every .rt-* class this scan found is already in KNOWN_CLASSES (today's
    // 11-component inventory, 57 names). A non-empty `unknown` names exactly the new class(es).
    expect(unknown).toEqual([]);
  });
});
