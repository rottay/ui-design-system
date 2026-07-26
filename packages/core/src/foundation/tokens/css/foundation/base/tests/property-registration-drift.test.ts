/**
 * Drift gate for the @property registrations in foundation/base/properties.css.
 *
 * A registered custom property that is unset resolves to its declared
 * initial-value (NOT to a var() fallback), so an initial-value that disagrees
 * with the token's shipped at-rest default silently changes unset rendering.
 * This test parses properties.css and the shipped default sources and fails on
 * any disagreement, on any drift in syntax/inherits, and on any registration
 * that is not accounted for.
 *
 * Shipped-default sources parsed here: foundation/themes/default.css and
 * foundation/animations/transitions.css (the two named default files), plus
 * foundation/animations/premium.css, which is where the effect-intensity dial's
 * at-rest default lives. A literal default is compared byte-for-byte against the
 * registered initial-value; a var()-chain default (color-primary) is accounted
 * for by existence only, because an @property initial-value cannot hold a var().
 *
 * A fourth source, presentation/components/skin/widget-board.css, is parsed for
 * the widget-board spatial family. Those channels have no at-rest declaration at
 * all: the registration itself supplies their at-rest value, so they are
 * accounted for against their consumption site instead of a shipped literal.
 *
 * No React render, no DOM: source parsing exactly like density-scale-parity and
 * the neutral-derivation contract test.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const fromRoot = (rel: string) => resolve(process.cwd(), rel);

const PROPERTIES_CSS = readFileSync(
  fromRoot("src/foundation/tokens/css/foundation/base/properties.css"),
  "utf8",
);
const DEFAULT_CSS = readFileSync(
  fromRoot("src/foundation/tokens/css/foundation/themes/default.css"),
  "utf8",
);
const TRANSITIONS_CSS = readFileSync(
  fromRoot("src/foundation/tokens/css/foundation/animations/transitions.css"),
  "utf8",
);
const PREMIUM_CSS = readFileSync(
  fromRoot("src/foundation/tokens/css/foundation/animations/premium.css"),
  "utf8",
);
const WIDGET_BOARD_CSS = readFileSync(
  fromRoot(
    "src/foundation/tokens/css/presentation/components/skin/widget-board.css",
  ),
  "utf8",
);

interface Registration {
  syntax: string;
  inherits: boolean;
  initialValue: string;
}

/** Parse every `@property --name { syntax; inherits; initial-value; }` block. */
function parseRegistrations(css: string): Record<string, Registration> {
  const out: Record<string, Registration> = {};
  const block = /@property\s+(--[\w-]+)\s*\{([^}]*)\}/g;
  for (const match of css.matchAll(block)) {
    const name = match[1];
    const body = match[2];
    const syntax = body.match(/syntax:\s*['"]([^'"]+)['"]\s*;/);
    const inherits = body.match(/inherits:\s*(true|false)\s*;/);
    const initial = body.match(/initial-value:\s*([^;]+);/);
    if (!syntax || !inherits) {
      throw new Error(`@property ${name} is missing syntax or inherits`);
    }
    out[name] = {
      syntax: syntax[1].trim(),
      inherits: inherits[1] === "true",
      // Universal syntax is the only case allowed to omit initial-value; every
      // registration here is typed, so a missing initial is a hard error.
      initialValue: initial ? initial[1].trim() : "",
    };
  }
  return out;
}

/** Last-wins `--name: value;` at-rest literal, or null if the token is absent. */
function readDecl(css: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*:\\s*([^;]+);`, "g");
  let value: string | null = null;
  for (const match of css.matchAll(re)) {
    value = match[1].trim();
  }
  return value;
}

/**
 * The registration contract. Each initial-value is asserted equal to the shipped
 * at-rest default below; keep the two in lockstep.
 */
const EXPECTED: Record<string, Registration> = {
  "--ds-effect-intensity": {
    syntax: "<number>",
    inherits: true,
    initialValue: "1",
  },
  "--ds-motion-scale-in": {
    syntax: "<number>",
    inherits: true,
    initialValue: "0.98",
  },
  "--ds-motion-offset-in": {
    syntax: "<length>",
    inherits: true,
    initialValue: "-2px",
  },
  "--ds-elevation-lift": {
    syntax: "<number>",
    inherits: false,
    initialValue: "0",
  },
  "--ds-widget-board-layout-x": {
    syntax: "<length>",
    inherits: false,
    initialValue: "0px",
  },
  "--ds-widget-board-layout-y": {
    syntax: "<length>",
    inherits: false,
    initialValue: "0px",
  },
  "--ds-widget-board-hover-lift": {
    syntax: "<length>",
    inherits: false,
    initialValue: "0px",
  },
  "--ds-widget-board-entry-offset": {
    syntax: "<length>",
    inherits: false,
    initialValue: "0px",
  },
  "--ds-widget-board-entry-scale": {
    syntax: "<number>",
    inherits: false,
    initialValue: "1",
  },
  "--ds-widget-board-interaction-scale": {
    syntax: "<number>",
    inherits: false,
    initialValue: "1",
  },
  "--ds-color-primary": {
    syntax: "<color>",
    inherits: true,
    initialValue: "transparent",
  },
};

/**
 * Tokens whose initial-value must byte-match a literal at-rest default, and the
 * source file that owns that literal. color-primary is excluded: its default is
 * a var() chain, checked by existence only. elevation-lift is excluded: it is a
 * forward token with no at-rest declaration yet (owned by the elevation lane).
 * The widget-board family is excluded for the same reason and guarded instead by
 * the identity/consumption assertions below.
 */
const LITERAL_DEFAULTS: Record<string, string> = {
  "--ds-effect-intensity": PREMIUM_CSS,
  "--ds-motion-scale-in": TRANSITIONS_CSS,
  "--ds-motion-offset-in": TRANSITIONS_CSS,
};

/**
 * --ds-chart-series-1..10 are intentionally NOT registered: any valid <color>
 * initial defeats the guaranteed-invalid var() fallback in chart-foundation.css
 * for uncompiled renders. This set locks that deferral.
 */
const DEFERRED_UNREGISTERED = Array.from(
  { length: 10 },
  (_, i) => `--ds-chart-series-${i + 1}`,
);

/**
 * The widget-board spatial channels, mapped to the at-rest identity of the
 * transform operation each one feeds.
 *
 * All six are composed into ONE `transform` on `.ds-widget-board__cell` and none
 * is declared at rest: the skin writes them only in state blocks (:hover,
 * [data-dragging], [data-resizing]) and in the entry keyframes, while the FLIP
 * runtime writes layout-x/y inline during rearrangement. Registration is
 * therefore load-bearing rather than decorative — unregistered and unset, each
 * `var()` in that chain is invalid at computed-value time and drops the entire
 * transform declaration. The registered initial-value IS the at-rest value, so
 * it must be the identity for its operation: 0px for a translate, 1 for a scale.
 */
const WIDGET_BOARD_IDENTITIES: Record<string, string> = {
  "--ds-widget-board-layout-x": "0px",
  "--ds-widget-board-layout-y": "0px",
  "--ds-widget-board-hover-lift": "0px",
  "--ds-widget-board-entry-offset": "0px",
  "--ds-widget-board-entry-scale": "1",
  "--ds-widget-board-interaction-scale": "1",
};

const registered = parseRegistrations(PROPERTIES_CSS);

describe("@property registration contract", () => {
  it("registers exactly the expected token set", () => {
    expect(Object.keys(registered).sort()).toEqual(
      Object.keys(EXPECTED).sort(),
    );
  });

  it.each(Object.keys(EXPECTED))(
    "%s has the expected syntax, inherits and initial-value",
    (name) => {
      expect(registered[name]).toEqual(EXPECTED[name]);
    },
  );
});

describe("@property initial-value drift against shipped defaults", () => {
  it.each(Object.keys(LITERAL_DEFAULTS))(
    "%s initial-value equals its shipped at-rest default",
    (name) => {
      const shipped = readDecl(LITERAL_DEFAULTS[name], name);
      // The source token must still exist, or the registration is anchored to a
      // default that no longer ships.
      expect(shipped).not.toBeNull();
      expect(registered[name].initialValue).toBe(shipped);
    },
  );
});

describe("@property accountability", () => {
  it("color-primary is defined in core css (its transparent initial is the unset fallback)", () => {
    // Real value is a var() chain at :root; the transparent initial only applies
    // where the property is unset, so it is not compared to the chain.
    expect(readDecl(DEFAULT_CSS, "--ds-color-primary")).not.toBeNull();
  });

  it("elevation-lift is a forward token: registered but not yet declared at rest", () => {
    expect(registered["--ds-elevation-lift"].initialValue).toBe("0");
    expect(readDecl(DEFAULT_CSS, "--ds-elevation-lift")).toBeNull();
    expect(readDecl(TRANSITIONS_CSS, "--ds-elevation-lift")).toBeNull();
  });

  it.each(DEFERRED_UNREGISTERED)(
    "%s stays unregistered (var() fallback chain must keep resolving)",
    (name) => {
      expect(registered[name]).toBeUndefined();
    },
  );
});

describe("widget-board channels: registration is load-bearing", () => {
  it.each(Object.keys(WIDGET_BOARD_IDENTITIES))(
    "%s registers its transform identity and does not inherit",
    (name) => {
      expect(registered[name].initialValue).toBe(WIDGET_BOARD_IDENTITIES[name]);
      // Geometry must not cascade: a lifted or dragged cell must move as one
      // object, not re-offset the widget content nested inside it.
      expect(registered[name].inherits).toBe(false);
    },
  );

  it.each(Object.keys(WIDGET_BOARD_IDENTITIES))(
    "%s is consumed with no var() fallback, so the registration owns its at-rest value",
    (name) => {
      // A fallback would make the registration optional. Its absence is exactly
      // why an unregistered channel would invalidate the whole transform, and
      // why the initial-value above must stay the identity.
      expect(WIDGET_BOARD_CSS).toMatch(new RegExp(`var\\(\\s*${name}\\s*\\)`));
      expect(WIDGET_BOARD_CSS).not.toMatch(new RegExp(`var\\(\\s*${name}\\s*,`));
    },
  );

  it.each(Object.keys(WIDGET_BOARD_IDENTITIES))(
    "%s stays undeclared in the named at-rest default sources",
    (name) => {
      for (const css of [DEFAULT_CSS, TRANSITIONS_CSS, PREMIUM_CSS]) {
        expect(readDecl(css, name)).toBeNull();
      }
    },
  );
});
