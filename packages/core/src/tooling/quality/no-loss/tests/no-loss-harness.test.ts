/**
 * @fileoverview Self-tests for the no-loss harness.
 *
 * A proof tool that cannot fail proves nothing, so most of this suite is
 * NEGATIVE: a channel that ignores its declared upstream, a chain that never
 * terminates, a value that holds in one vertical and moves in another. Each
 * of those must come back red. The positive cases then run against the real
 * shipped bundles, because a harness validated only on fixtures would be
 * exactly the sham-coverage pattern the programme keeps finding.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, it, expect } from "vitest";

import {
  SHIPPED_BUNDLES,
  UNRESOLVED,
  collectDeclarationSites,
  defaultIsUnchanged,
  expand,
  hasConsumer,
  loadBundle,
  resolveChannel,
  restoreEqualsDefault,
  upstreamMovesDownstream,
  type Bundle,
} from "../index";

/** A hand-built bundle, so the drills can be tested without 4MB of CSS. */
function fixtureBundle(declarations: Record<string, string>): Bundle {
  const map = new Map(Object.entries(declarations));
  return {
    path: "<fixture>",
    sites: new Map(),
    declarations: map,
  };
}

describe("chain expansion", () => {
  it("expands a nested var() chain to its terminal value", () => {
    const bundle = fixtureBundle({
      "--a": "var(--b)",
      "--b": "var(--c, 4px)",
    });
    expect(resolveChannel(bundle, "--a")).toBe("4px");
  });

  it("uses the fallback only when the name is undeclared", () => {
    const declared = fixtureBundle({ "--a": "var(--b, 99px)", "--b": "4px" });
    expect(resolveChannel(declared, "--a")).toBe("4px");

    const undeclared = fixtureBundle({ "--a": "var(--b, 99px)" });
    expect(resolveChannel(undeclared, "--a")).toBe("99px");
  });

  it("keeps calc() and color-mix() symbolic while substituting inside them", () => {
    const bundle = fixtureBundle({
      "--a": "calc(var(--b) * var(--scale))",
      "--b": "0.25rem",
      "--scale": "0.9",
    });
    expect(resolveChannel(bundle, "--a")).toBe("calc(0.25rem * 0.9)");
  });

  it("reports an unterminated chain rather than looping forever", () => {
    const bundle = fixtureBundle({ "--a": "var(--b)", "--b": "var(--a)" });
    expect(resolveChannel(bundle, "--a")).toBe(UNRESOLVED);
  });

  it("returns null for a channel the bundle never declares", () => {
    expect(resolveChannel(fixtureBundle({}), "--absent")).toBeNull();
  });

  it("leaves text without any var() untouched", () => {
    expect(expand(fixtureBundle({}), "1px solid red")).toBe("1px solid red");
  });
});

describe("upstreamMovesDownstream", () => {
  it("passes when the override reaches the channel", () => {
    const bundle = fixtureBundle({ "--channel": "var(--upstream)", "--upstream": "4px" });
    expect(upstreamMovesDownstream(bundle, "--channel", "--upstream").passed).toBe(true);
  });

  it("FAILS when the channel does not derive from the declared upstream", () => {
    const bundle = fixtureBundle({ "--channel": "4px", "--upstream": "4px" });
    const result = upstreamMovesDownstream(bundle, "--channel", "--upstream");
    expect(result.passed).toBe(false);
    expect(result.detail).toContain("ignores");
  });

  it("FAILS when the channel is not declared at all", () => {
    const result = upstreamMovesDownstream(fixtureBundle({}), "--absent", "--upstream");
    expect(result.passed).toBe(false);
    expect(result.detail).toContain("not declared");
  });

  it("FAILS when a literal shadows the upstream in the chain", () => {
    // The classic dead reconnection: the fallback is wired, but a declared
    // value sits above it, so the "upstream" can never win.
    const bundle = fixtureBundle({
      "--channel": "var(--shadow, var(--upstream))",
      "--shadow": "12px",
      "--upstream": "4px",
    });
    expect(upstreamMovesDownstream(bundle, "--channel", "--upstream").passed).toBe(false);
  });
});

describe("restoreEqualsDefault", () => {
  it("passes when reading after an override returns the baseline", () => {
    const bundle = fixtureBundle({ "--channel": "var(--upstream)", "--upstream": "4px" });
    const result = restoreEqualsDefault(bundle, "--channel", "--upstream");
    expect(result.passed).toBe(true);
    expect(resolveChannel(bundle, "--channel")).toBe("4px");
  });

  it("never lets an override leak into the parsed bundle", () => {
    const bundle = fixtureBundle({ "--channel": "var(--upstream)", "--upstream": "4px" });
    resolveChannel(bundle, "--channel", { "--upstream": "999px" });
    expect(bundle.declarations.get("--upstream")).toBe("4px");
  });
});

describe("the real shipped bundles", () => {
  const bithire = loadBundle(SHIPPED_BUNDLES.bithire);

  it("indexes a substantial default-state token surface", () => {
    expect(bithire.declarations.size).toBeGreaterThan(500);
  });

  it("excludes dark-mode declarations from the default state", () => {
    for (const sites of bithire.sites.values()) {
      for (const site of sites) {
        expect(site.selector).not.toContain("data-theme");
        expect(site.selector).not.toContain(".dark");
      }
    }
  });

  it("resolves a spacing step through its density multiplier", () => {
    const resolved = resolveChannel(bithire, "--ds-spacing-1");
    expect(resolved).toContain("0.25rem");
    expect(resolved).toContain("calc(");
  });

  it("proves density is the upstream of the spacing scale", () => {
    const drill = upstreamMovesDownstream(
      bithire,
      "--ds-spacing-1",
      "--ds-density-effective-scale"
    );
    expect(drill.passed, drill.detail).toBe(true);
  });

  it("restores the spacing scale after the density probe", () => {
    const drill = restoreEqualsDefault(
      bithire,
      "--ds-spacing-1",
      "--ds-density-effective-scale"
    );
    expect(drill.passed, drill.detail).toBe(true);
  });

  it("records where a channel is declared, for adjudication", () => {
    expect(collectDeclarationSites(bithire, "--ds-spacing-1").length).toBeGreaterThan(0);
  });
});

describe("per-vertical divergence -- the density trap, measured", () => {
  // FASE C rejected reconnecting fixed literals to the spacing scale because
  // the verticals ship different densities. This asserts that reasoning
  // against the real bundles rather than restating it.
  const verticals = Object.entries(SHIPPED_BUNDLES) as ReadonlyArray<
    [string, string]
  >;

  it("resolves --ds-spacing-1 in every shipped vertical", () => {
    for (const [, path] of verticals) {
      expect(resolveChannel(loadBundle(path), "--ds-spacing-1")).not.toBeNull();
    }
  });

  it.each(verticals)(
    "runs both drills in %s, not only in the default theme",
    (_vertical, path) => {
      const bundle = loadBundle(path);
      const moves = upstreamMovesDownstream(
        bundle,
        "--ds-spacing-1",
        "--ds-density-effective-scale"
      );
      expect(moves.passed, moves.detail).toBe(true);
      const restored = restoreEqualsDefault(
        bundle,
        "--ds-spacing-1",
        "--ds-density-effective-scale"
      );
      expect(restored.passed, restored.detail).toBe(true);
    }
  );

  it("shows the density scale is NOT uniform across verticals", () => {
    const densities = new Set(
      verticals.map(([, path]) => resolveChannel(loadBundle(path), "--ds-density-scale"))
    );
    // bithire 0.9 / platform+rottay 1 / evnto 1.125 -- more than one answer,
    // which is precisely why "byte-identical" must be proven per bundle.
    expect(densities.size).toBeGreaterThan(1);
  });

  it("FAILS a cross-vertical baseline that only holds in one bundle", () => {
    const bithireValue = resolveChannel(loadBundle(SHIPPED_BUNDLES.bithire), "--ds-density-scale");
    const drill = defaultIsUnchanged(
      loadBundle(SHIPPED_BUNDLES.evnto),
      "--ds-density-scale",
      bithireValue ?? ""
    );
    expect(drill.passed).toBe(false);
  });
});

describe("hasConsumer -- name BOUNDARY, not prefix", () => {
  const FIXTURES = resolvePath(dirname(fileURLToPath(import.meta.url)), "fixtures");
  const FIXTURE = "consumer-boundary.css";
  const reads = (channel: string) => hasConsumer(FIXTURE, channel, FIXTURES);

  it("does NOT count a superstring as a read of its base", () => {
    // `var(--ds-fx-base-extra)` is not a read of `--ds-fx-base`.
    expect(reads("--ds-fx-base")).toBe(false);
    expect(reads("--ds-fx-base-extra")).toBe(true);
    // The numeric form is the nastiest: `-5` sits inside `-50`.
    expect(reads("--ds-fx-num-5")).toBe(false);
    expect(reads("--ds-fx-num-50")).toBe(true);
  });

  it("counts an exact read whether it closes with ')' or continues with ','", () => {
    expect(reads("--ds-fx-closed")).toBe(true);
    expect(reads("--ds-fx-comma")).toBe(true);
    expect(reads("--ds-fx-padded")).toBe(true);
  });

  it("counts a read WRAPPED across lines, the form the bundles really emit", () => {
    expect(reads("--ds-fx-wrapped")).toBe(true);
  });

  it("does not count a reference that only appears inside a comment", () => {
    expect(reads("--ds-fx-commented")).toBe(false);
  });

  it("drill: the retired includes-style predicate FAILS this fixture both ways", () => {
    const text = readFileSync(resolvePath(FIXTURES, FIXTURE), "utf8");
    const retired = (channel: string) =>
      text.includes(`var(${channel}`) || text.includes(`var( ${channel}`);

    // It scored a superstring as a read of the base (conservative: it blocked
    // retirements) ...
    expect(retired("--ds-fx-base")).toBe(true);
    expect(reads("--ds-fx-base")).toBe(false);
    // ... and it could not see a wrapped read at all, which is the UNSAFE
    // direction: it would have licensed retiring a channel that ships.
    expect(retired("--ds-fx-wrapped")).toBe(false);
    expect(reads("--ds-fx-wrapped")).toBe(true);
  });
});

describe("hasConsumer against the real shipped bundles", () => {
  // Derived from the corpus, never a hardcoded list, so the invariant keeps
  // holding after the bundles are regenerated.
  const bundleText = (path: string) =>
    readFileSync(resolvePath(dirname(fileURLToPath(import.meta.url)), "../../../../..", path), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "");

  it("never claims a consumer without an exact-boundary read (the prefix trap)", () => {
    const text = bundleText(SHIPPED_BUNDLES.bithire);
    const declared = new Set(
      [...text.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map((match) => match[1])
    );
    const readExactly = new Set(
      [...text.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*[,)]/g)].map((match) => match[1])
    );
    expect(declared.size).toBeGreaterThan(1000);
    const overclaimed = [...declared].filter(
      (channel) => !readExactly.has(channel) && hasConsumer(SHIPPED_BUNDLES.bithire, channel)
    );
    expect(overclaimed).toEqual([]);
  });

  it("never misses a channel read only through a WRAPPED var()", () => {
    const text = bundleText(SHIPPED_BUNDLES.bithire);
    const wrapped = [
      ...new Set([...text.matchAll(/var\(\s*\n\s*(--[a-zA-Z0-9-]+)/g)].map((m) => m[1])),
    ];
    // Positive control: the wrapped form is really present in the artifact, so
    // an empty result below would mean the corpus rotted, not that we are safe.
    expect(wrapped.length).toBeGreaterThan(100);
    const missed = wrapped.filter(
      (channel) => !hasConsumer(SHIPPED_BUNDLES.bithire, channel)
    );
    expect(missed).toEqual([]);
  });
});
