/**
 * The ingress owner is the only producer of a ThemeIntent, and each of its
 * three named producers states a domain the others do not.
 */

import { describe, expect, it } from "vitest";

import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";

import { compileThemeIntent } from "../../../facade/runtime/compile";
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
      // A draft that authored no chrome captured no claim; the ledger is empty
      // rather than absent, which is what tells the caps this door records one.
      ledger: { entries: [] },
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

/* -------------------------------------------------------------------------- */
/* three producers x valid/invalid, through the door that admits them          */
/* -------------------------------------------------------------------------- */

/**
 * F-02: `compileThemeIntent` and this owner had ZERO tests, while the ingress
 * docblock claimed `theme-lowering-single-door` asserted the property. That
 * gate proves the uniqueness of a NAME; it cannot prove that what the three
 * producers make is admissible. This block compiles each producer's output
 * through the real door, once with a value the vertical admits and once with a
 * value it does not.
 */
describe("every producer reaches the same door, and the same refusal", () => {
  const VALID_SCALE = 1.02;
  const OUT_OF_ENVELOPE_SCALE = 100;

  const scaleDocument = (scale: number): TenantThemeDocument =>
    ({
      schemaVersion: 1,
      mode: "simple",
      appearance: { typography: { scale } },
    }) as unknown as TenantThemeDocument;

  const scaleDraft = (scale: number) =>
    ({
      id: "acme",
      name: "Acme",
      palette: { primaryColor: "#2F6B9A" },
      typography: { scale },
    }) as never;

  it("staticThemeIntent compiles: a vertical's own baseline is admissible", () => {
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      expect(() =>
        compileThemeIntent(staticThemeIntent(vertical, vertical))
      ).not.toThrow();
    }
  });

  it("staticThemeIntent REFUSES a patch: the baseline is authored, not patched", () => {
    expect(() =>
      compileThemeIntent({
        ...staticThemeIntent("bithire", "acme"),
        patch: { typography: { scale: VALID_SCALE } },
      })
    ).toThrow(/static-vertical intent carries an empty patch/u);
  });

  it("documentThemeIntent compiles an in-envelope scale and refuses one outside", () => {
    const input = { vertical: "bithire", slug: "acme" } as const;
    expect(() =>
      compileThemeIntent(
        documentThemeIntent({ ...input, document: scaleDocument(VALID_SCALE) })
      )
    ).not.toThrow();
    expect(() =>
      compileThemeIntent(
        documentThemeIntent({
          ...input,
          document: scaleDocument(OUT_OF_ENVELOPE_SCALE),
        })
      )
    ).toThrow(/exceeds the bithire envelope for typeScale/u);
  });

  it("previewThemeIntent compiles an in-envelope scale and refuses one outside", () => {
    const input = { vertical: "bithire", slug: "acme" } as const;
    expect(() =>
      compileThemeIntent(
        previewThemeIntent({ ...input, document: scaleDocument(VALID_SCALE) })
      )
    ).not.toThrow();
    expect(() =>
      compileThemeIntent(
        previewThemeIntent({
          ...input,
          document: scaleDocument(OUT_OF_ENVELOPE_SCALE),
        })
      )
    ).toThrow(/exceeds the bithire envelope for typeScale/u);
  });

  it("draftPreviewThemeIntent compiles an in-envelope scale and refuses one outside", () => {
    const input = { vertical: "bithire", slug: "acme" } as const;
    expect(() =>
      compileThemeIntent(
        draftPreviewThemeIntent({ ...input, draft: scaleDraft(VALID_SCALE) })
      )
    ).not.toThrow();
    expect(() =>
      compileThemeIntent(
        draftPreviewThemeIntent({
          ...input,
          draft: scaleDraft(OUT_OF_ENVELOPE_SCALE),
        })
      )
    ).toThrow(/exceeds the bithire envelope for typeScale/u);
  });

  it("the draft producer refuses a colour that is not a colour", () => {
    // F-61: `admitCssVariables` asks whether a value can break out of its
    // declaration, never whether it means anything, so `notacolor` reached the
    // channel writers through the one origin nothing else validated.
    expect(() =>
      compileThemeIntent(
        draftPreviewThemeIntent({
          vertical: "bithire",
          slug: "acme",
          draft: {
            id: "acme",
            name: "Acme",
            palette: { primaryColor: "notacolor" },
          } as never,
        })
      )
    ).toThrow(/"notacolor" is not a CSS colour/u);
  });

  it("carries the v2 document's plan onto the intent, and invents none for v1", () => {
    const v2 = {
      version: 2,
      plan: "pro",
      decisions: { "palette.seeds": { primary: "#2F6B9A" } },
    } as never;
    expect(
      documentThemeIntent({ vertical: "bithire", slug: "acme", document: v2 })
        .entitlement
    ).toEqual({ plan: "pro" });
    expect(
      previewThemeIntent({ vertical: "bithire", slug: "acme", document: v2 })
        .entitlement
    ).toEqual({ plan: "pro" });
    // D-02: a defaulted plan is an entitlement nobody granted.
    expect(
      documentThemeIntent({
        vertical: "bithire",
        slug: "acme",
        document: simpleDocument("#2F6B9A"),
      }).entitlement
    ).toBeUndefined();
  });
});
