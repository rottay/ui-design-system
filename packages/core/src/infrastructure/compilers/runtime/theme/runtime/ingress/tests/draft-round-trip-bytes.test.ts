/**
 * `draft-round-trip-bytes` — WO-DER-08 acceptance arm 2, at the door itself.
 *
 * The studio's file export is `JSON.stringify` on the way out and
 * `readThemeDraft(JSON.parse(...))` on the way back (`brand-studio/runtime/
 * file-export`), so the round trip a WO acceptance names is a property of THIS
 * door, not of the component that calls it. The studio suite already compares
 * the compiled OBJECT; what was never measured here is the stronger claim the
 * acceptance makes: a draft that leaves as JSON and comes back through the
 * governed ingress recompiles to the same CSS BYTES.
 *
 * Both arms are measured: the governed `Theme` transport, and the superseded
 * flat file the window still admits. A negative control moves one authored leaf
 * so the equality cannot pass by both sides emitting nothing.
 */
import { describe, expect, it } from "vitest";

import type { EmissionScope } from "@/foundation/contracts/composition/tenants/themes/emission";
import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import type { Theme } from "@/foundation/contracts/composition/tenants/themes/iso";
import { compileThemeIntent } from "../../../facade/runtime/compile";
import { emitThemeCss } from "../../emission";
import {
  draftPreviewThemeIntent,
  governedTenantTheme,
  readThemeDraft,
} from "../presentation/preview";

const VERTICALS: readonly FirstPartyVerticalId[] = ["rottay", "bithire", "evnto"];

const SLUG = "draft-round-trip";

/** A draft that authors several families, so the emitted block is not thin. */
const DRAFT: FlatTheme = {
  id: SLUG,
  name: "Draft Round Trip",
  palette: { primaryColor: "#2F5BE8", secondaryColor: "#7C3AED" },
  typography: { fontFamilyBase: "Inter, system-ui, sans-serif" },
  motion: { intensity: 0.6, hoverScale: 1.01 },
  surfaces: { densityScale: 1.1 },
  chrome: { cardComponent: { bg: "#0b0b0b" } },
};

const SCOPE: EmissionScope = {
  baseSelector: ".ds-draft-round-trip",
  modeSelector: (mode) => `.ds-draft-round-trip[data-ds-mode="${mode}"]`,
};

/** What the file export writes and reads back, without naming the studio. */
const throughJson = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function emit(vertical: FirstPartyVerticalId, draft: Theme | FlatTheme): string {
  const intent = draftPreviewThemeIntent({ vertical, slug: SLUG, draft });
  return emitThemeCss(compileThemeIntent(intent).compiled, SCOPE);
}

describe("WO-DER-08 the governed ingress round-trips a draft to the same bytes", () => {
  for (const vertical of VERTICALS) {
    const governed = governedTenantTheme(DRAFT);

    it(`${vertical}: the emitted block is real, so the equality below can fail`, () => {
      const css = emit(vertical, governed);
      expect(css).toContain(SCOPE.baseSelector);
      expect(css).toContain("#2F5BE8");
    });

    it(`${vertical}: governed draft -> JSON -> governed ingress -> same bytes`, () => {
      const restored = readThemeDraft(throughJson(governed));
      expect(emit(vertical, restored)).toBe(emit(vertical, governed));
    });

    it(`${vertical}: the superseded flat file lands on the same bytes`, () => {
      // A file written before the transport moved parses to a flat literal;
      // the door lifts it on its own arm and must not compile a different
      // theme than the governed draft it was written from.
      const fromFlatFile = readThemeDraft(throughJson(DRAFT));
      expect(emit(vertical, fromFlatFile)).toBe(emit(vertical, governed));
    });

    it(`${vertical}: JSON keeps the governed wrapper the door discriminates on`, () => {
      // `disposition: undefined` is dropped by JSON; the `value` key is what
      // survives, and it is what keeps a governed draft off the flat arm.
      expect(Object.keys(throughJson(governed).motion)).toEqual(["value"]);
    });

    it(`${vertical}: a moved leaf moves the bytes (negative control)`, () => {
      const moved = governedTenantTheme({
        ...DRAFT,
        palette: { ...DRAFT.palette, primaryColor: "#B91C1C" },
      });
      expect(emit(vertical, moved)).not.toBe(emit(vertical, governed));
    });
  }
});
