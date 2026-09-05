/**
 * The ingress owner is the only producer of a ThemeIntent, and each of its
 * three named producers states a domain the others do not.
 */

import { describe, expect, it } from "vitest";

import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";

import {
  authoredThemePatch,
  documentThemeIntent,
  documentThemePatch,
  draftPreviewThemeIntent,
  migrateV1,
  previewThemeIntent,
  staticThemeIntent,
  ThemePatchMigrationError,
  verticalEngine,
} from "..";

const simpleDocument = (primary: string): TenantThemeDocument =>
  ({
    schemaVersion: 1,
    mode: "simple",
    appearance: { palette: { primary } },
  }) as unknown as TenantThemeDocument;

describe("staticThemeIntent", () => {
  it("carries an EMPTY patch: the roster Theme IS the baseline", () => {
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      expect(staticThemeIntent(vertical)).toEqual({
        vertical,
        slug: vertical,
        origin: "static-vertical",
        patch: {},
      });
    }
  });

  it("scopes the untouched baseline under another slug when asked", () => {
    expect(staticThemeIntent("bithire", "acme").slug).toBe("acme");
    expect(staticThemeIntent("bithire", "acme").patch).toEqual({});
  });
});

describe("documentThemeIntent and previewThemeIntent", () => {
  it("differ ONLY in origin, so a preview is the publish it previews", () => {
    const document = simpleDocument("#123456");
    const persisted = documentThemeIntent({
      vertical: "rottay",
      slug: "acme",
      document,
    });
    const preview = previewThemeIntent({ vertical: "rottay", slug: "acme", document });
    expect(persisted.origin).toBe("tenant-document");
    expect(preview.origin).toBe("preview");
    expect({ ...preview, origin: persisted.origin }).toEqual(persisted);
  });

  it("reads the default mode off the baseline, never off a caller's literal", () => {
    // The mode argument decides WHICH BLOCK a customer's seed lands in: the
    // base palette when the document's background mode is the baseline's own,
    // and `modes.<mode>.palette` otherwise. The document below names no
    // background mode, so the migration's own `light` default applies -- which
    // is the base block on a light-default vertical and the LIGHT OVERLAY on a
    // dark-default one. Two different blocks, from one document, decided
    // entirely by the baseline this door now reads for itself.
    expect(FIRST_PARTY_THEMES.rottay.appearance?.defaultMode).toBe("dark");
    expect(FIRST_PARTY_THEMES.bithire.appearance?.defaultMode).toBe("light");

    const document = simpleDocument("#123456");
    const rottay = documentThemePatch({ vertical: "rottay", document }) as Record<
      string,
      Record<string, Record<string, Record<string, unknown>>>
    >;
    const bithire = documentThemePatch({ vertical: "bithire", document }) as Record<
      string,
      Record<string, unknown>
    >;
    expect(bithire.palette?.primaryColor).toBe("#123456");
    expect(rottay.modes?.light?.palette?.primaryColor).toBe("#123456");

    // and it is the SAME answer the migration gives when told the mode by hand
    expect(rottay).toEqual(migrateV1(document, "dark").patch);
    expect(bithire).toEqual(migrateV1(document, "light").patch);
    // the retired literal is a DIFFERENT patch on the dark-default vertical --
    // this is the preview/publish divergence, stated as a fact
    expect(rottay).not.toEqual(migrateV1(document, "light").patch);
  });

  it("REFUSES an off-roster vertical with its OWN error, not a TypeError", () => {
    // The type does not hold a JS caller. Indexing the roster first would have
    // answered `Cannot read properties of undefined`, which names neither the
    // door nor the reason.
    for (const vertical of ["platform", "acme", "", "__proto__"]) {
      const call = () =>
        documentThemePatch({
          vertical: vertical as never,
          document: simpleDocument("#123456"),
        });
      expect(call).toThrow(ThemePatchMigrationError);
      expect(call).toThrow(/is not a first-party vertical/u);
      expect(call).not.toThrow(TypeError);
    }
  });
});

describe("authoredThemePatch", () => {
  it("drops identity: the intent's slug names the compile, not the draft", () => {
    const patch = authoredThemePatch({
      id: "draft",
      name: "Draft",
      palette: { primaryColor: "#123456" },
    } as never) as Record<string, unknown>;
    expect(patch.id).toBeUndefined();
    expect(patch.name).toBeUndefined();
    expect(patch.palette).toEqual({ primaryColor: "#123456" });
  });

  it("wraps a governed family as an ACTIVATION, so the baseline's disposition clears", () => {
    const patch = authoredThemePatch({
      id: "draft",
      motion: { intensity: "calm" },
    } as never) as Record<string, unknown>;
    expect(patch.motion).toEqual({ value: { intensity: "calm" } });
    expect(Object.prototype.hasOwnProperty.call(patch.motion, "disposition")).toBe(false);
  });

  it("omits a family the draft never authored, leaving the baseline's own", () => {
    const patch = authoredThemePatch({ id: "draft" } as never);
    expect(Object.keys(patch)).toEqual([]);
  });

  it("produces a preview intent over the vertical the draft belongs to", () => {
    const intent = draftPreviewThemeIntent({
      vertical: "evnto",
      slug: "acme",
      draft: { id: "ignored", palette: { primaryColor: "#123456" } } as never,
    });
    expect(intent).toEqual({
      vertical: "evnto",
      slug: "acme",
      origin: "preview",
      patch: { palette: { primaryColor: "#123456" } },
    });
  });
});

describe("verticalEngine", () => {
  it("answers the roster row for every first-party vertical", () => {
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      expect(verticalEngine(vertical)).toBe("modern");
    }
  });

  it("REFUSES a vertical the roster does not declare, with no primary fallback", () => {
    // The one law. Four preview and tooling sites used to answer
    // `?? PRIMARY_ENGINE` here while the DB terminal threw.
    expect(() => verticalEngine("platform" as never)).toThrow(
      /no first-party vertical declares an engine/u
    );
    expect(() => verticalEngine("acme" as never)).toThrow(/declares an engine/u);
  });
});
