/**
 * I-2 — the acceptance sentence the work order wrote, executable.
 *
 * The WO names `emitThemeTokens(intent)`. The emitter itself takes a
 * compilation, so that a second compile is not expressible in its signature;
 * this facade is what makes the intent-shaped call true, and it compiles
 * exactly once.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import type { TokenEmissionMode } from "@/contracts/theme/runtime/compilation";

import { staticThemeIntent } from "../../../../runtime/ingress";
import type { ResolvedBaseEnvironment } from "../../../../runtime/emission/tokens";
import { emitThemeTokensForIntent } from "..";

const VERTICALS = ["rottay", "bithire", "evnto"] as const;

function baseEnvironment(vertical: string, mode: TokenEmissionMode): ResolvedBaseEnvironment {
  const document = JSON.parse(
    readFileSync(
      resolve(
        process.cwd(),
        `artifacts/generated/tokens/base-environment/${vertical}/${mode}/index.json`
      ),
      "utf8"
    )
  ) as ResolvedBaseEnvironment;
  return {
    vertical: document.vertical,
    mode: document.mode,
    channels: document.channels,
    digest: document.digest,
  };
}

describe.each(VERTICALS)("%s", (vertical) => {
  const base = baseEnvironment(vertical, "light");
  const document = emitThemeTokensForIntent(
    staticThemeIntent(vertical),
    { mode: "light", rootFontSizePx: 16 },
    base,
    { compilerVersion: "facade-suite", digest: base.digest }
  );

  it("answers a full document from an intent", () => {
    expect(document.formatVersion).toBe(1);
    expect(document.vertical).toBe(vertical);
    expect(document.slug).toBe(vertical);
    expect(document.engine).toBe("modern");
    expect(Object.keys(document.tokens).length).toBeGreaterThan(2500);
  });

  it("carries the provenance it was handed, and invents none", () => {
    expect(document.compilerVersion).toBe("facade-suite");
    expect(document.digest).toBe(base.digest);
  });

  it("I-1 holds through the facade too", () => {
    for (const [channel, leaf] of Object.entries(document.tokens)) {
      if (leaf.kind === "css") continue;
      for (const call of ["var(", "calc(", "color-mix(", "clamp(", "min(", "max(", "env("]) {
        expect(JSON.stringify(leaf), `${channel} carries ${call}`).not.toContain(call);
      }
    }
  });
});

describe("one compilation", () => {
  it("I-4: the facade reaches the compile door exactly once per call", async () => {
    const compileModule = await import("../../compile");
    const spy = vi.spyOn(compileModule, "compileThemeIntent");
    try {
      const base = baseEnvironment("bithire", "dark");
      const before = spy.mock.calls.length;
      const document = emitThemeTokensForIntent(
        staticThemeIntent("bithire"),
        { mode: "dark", rootFontSizePx: 16 },
        base,
        { compilerVersion: "facade-suite", digest: base.digest }
      );
      expect(spy.mock.calls.length - before, "the facade compiled more than once").toBe(1);
      expect(document.environment.mode).toBe("dark");
      expect(Object.keys(document.tokens).length).toBeGreaterThan(2500);
    } finally {
      spy.mockRestore();
    }
  });

  it("refuses a base snapshot for the other mode rather than reporting a phantom", () => {
    expect(() =>
      emitThemeTokensForIntent(
        staticThemeIntent("bithire"),
        { mode: "dark", rootFontSizePx: 16 },
        baseEnvironment("bithire", "light"),
        { compilerVersion: "facade-suite", digest: "x" }
      )
    ).toThrow(/base snapshot is for mode/);
  });
});
